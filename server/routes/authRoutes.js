import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Alumni from "../models/Alumni.js";
import { authMiddleware, allowRoles } from "../middleware/authMiddleware.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = express.Router();
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_REQUEST_WINDOW_MS = 15 * 60 * 1000;
const OTP_MAX_REQUESTS_PER_WINDOW = 5;
const OTP_MAX_VERIFY_ATTEMPTS = 5;
const OTP_SEND_RETRIES = 2;

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const storeOtp = async (user, otp) => {
  user.passwordResetToken = hashOtp(otp);
  user.passwordResetExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpVerifyAttempts = 0;
  await user.save();
};

const canSendOtp = (user) => {
  const now = Date.now();
  const windowStarted = user.otpRequestWindowStartedAt ? new Date(user.otpRequestWindowStartedAt).getTime() : 0;

  if (!windowStarted || now - windowStarted > OTP_REQUEST_WINDOW_MS) {
    return { allowed: true, resetWindow: true };
  }

  if ((user.otpRequestCount || 0) >= OTP_MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, message: "Too many OTP requests. Please try again after 15 minutes." };
  }

  const lastSent = user.otpLastSentAt ? new Date(user.otpLastSentAt).getTime() : 0;
  if (lastSent && now - lastSent < OTP_RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);
    return { allowed: false, message: `Please wait ${waitSec}s before requesting another OTP.` };
  }

  return { allowed: true, resetWindow: false };
};

const sendOtpWithRetry = async ({ email, otp, purpose }) => {
  let lastError = null;
  for (let attempt = 1; attempt <= OTP_SEND_RETRIES; attempt += 1) {
    try {
      await sendOtpEmail({ to: email, otp, purpose });
      return;
    } catch (error) {
      lastError = error;
      console.error(`[OTP] send failed (attempt ${attempt}/${OTP_SEND_RETRIES}) for ${email}:`, error.message);
    }
  }
  throw lastError;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, rollNumber, batch, department } = req.body;

    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    rollNumber = String(rollNumber).trim().toUpperCase();
    batch = String(batch || "").trim();
    department = String(department || "Computer Science and Engineering").trim();

    const GIST_CSE_ROLL_REGEX = /^\d{2}2U1A05[A-Z0-9]{2}$/;
    if (!GIST_CSE_ROLL_REGEX.test(rollNumber)) {
      return res.status(400).json({ message: "Please enter a valid Geethanjali CSE roll number." });
    }

    const existingByRoll = await User.findOne({
      rollNumber: { $regex: `^${escapeRegex(rollNumber)}$`, $options: "i" },
    });
    if (existingByRoll) {
      return res.status(400).json({ message: "Account already exists. Please login." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === "alumni" && !existingUser.password) {
        return res.status(409).json({
          message: "This is your first login. Please set your password.",
          code: "FIRST_TIME_LOGIN",
        });
      }

      // Imported placeholder account can be completed once via Register.
      if (existingUser.role === "alumni" && existingUser.isFirstLogin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(existingUser._id, {
          name,
          password: hashedPassword,
          batch,
          department,
          status: existingUser.status || "approved",
          isFirstLogin: false,
          isPasswordChanged: true,
          isImported: false,
        });
        return res.status(200).json({ message: "Registration completed successfully. Please login." });
      }

      return res.status(400).json({ message: "Account already exists. Please login." });
    }

    const importedAlumni = await Alumni.findOne({ rollNumber }).populate("user", "name email");

    const autoBatch = `20${rollNumber.slice(0, 2)}`;
    const finalName = importedAlumni?.user?.name || importedAlumni?.name || name;
    const finalEmail = (importedAlumni?.user?.email || email || "").trim().toLowerCase();
    const finalBatch = autoBatch;

    if (!finalEmail) {
      return res.status(400).json({ message: "Please enter your email." });
    }

    const emailInUse = await User.findOne({ email: finalEmail });
    if (emailInUse) {
      return res.status(400).json({ message: "Account already exists. Please login." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name: finalName,
      email: finalEmail,
      password: hashedPassword,
      rollNumber,
      batch: finalBatch,
      department,
      role: "alumni",
      status: "approved",
      isFirstLogin: false,
      isPasswordChanged: true,
      isImported: false,
    });

    // Ensure profile fields are available immediately after registration.
    const existingProfile = await Alumni.findOne({ user: createdUser._id });
    if (!existingProfile) {
      await Alumni.create({
        user: createdUser._id,
        rollNumber,
        batch: finalBatch,
        department,
        degree: importedAlumni?.degree || "",
        company: importedAlumni?.company || "",
        position: importedAlumni?.position || "",
        location: importedAlumni?.location || "",
        bio: importedAlumni?.bio || "",
        profilePicture: importedAlumni?.profilePicture || "",
        isApproved: true,
      });
    }

    return res.status(201).json({ message: "Registration successful. You can login now." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password." });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email. Please register first.",
        code: "EMAIL_NOT_FOUND",
      });
    }

    if (user.role === "alumni" && !user.password) {
      return res.status(403).json({
        message: "This is your first login. Please set your password.",
        code: "FIRST_TIME_LOGIN",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    if (user.role === "alumni" && user.status === "pending") {
      // Backward compatibility: some approvals updated Alumni.isApproved but not User.status.
      const alumniProfile = await Alumni.findOne({ user: user._id }).select("isApproved");
      if (alumniProfile?.isApproved === true) {
        user.status = "approved";
        await user.save();
      } else {
        return res.status(403).json({ message: "Your account is waiting for admin approval." });
      }
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      role: user.role,
      status: user.status || "approved",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= SET PASSWORD REQUEST (for imported alumni) =================
router.post("/set-password/request", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please enter your email." });
    }

    email = String(email).trim().toLowerCase();

    const user = await User.findOne({ email, role: "alumni" });
    if (user && !user.password) {
      const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
      const gate = canSendOtp(user);
      if (!gate.allowed) {
        return res.status(429).json({ message: gate.message });
      }

      const otp = generateOtp();
      const now = new Date();
      if (gate.resetWindow) {
        user.otpRequestWindowStartedAt = now;
        user.otpRequestCount = 0;
      }

      user.otpRequestCount = (user.otpRequestCount || 0) + 1;
      user.otpLastSentAt = now;
      await storeOtp(user, otp);
      try {
        await sendOtpWithRetry({ email, otp, purpose: "Set Password" });
        user.otpLastStatus = "sent";
        await user.save();
        console.info(`[OTP] set-password OTP sent to ${email}`);
        return res.json({
          message: "OTP sent to your email. It is valid for 10 minutes.",
          ...(isProd ? {} : { devOtp: otp }),
        });
      } catch (mailError) {
        user.otpLastStatus = `send_failed:${mailError.message}`;
        await user.save();
        if (!isProd) {
          console.warn(`[OTP][DEV] SMTP failed for ${email}. Returning devOtp.`);
          return res.json({
            message: "SMTP failed in local mode. Use the dev OTP shown in UI.",
            devOtp: otp,
          });
        }
        return res.status(500).json({ message: "Could not send OTP right now. Please try again." });
      }
    }

    return res.status(404).json({
      message: "First-time setup account not found for this email.",
      code: "FIRST_TIME_ACCOUNT_NOT_FOUND",
    });
  } catch (error) {
    console.error(error);
    try {
      let email = req.body?.email ? String(req.body.email).trim().toLowerCase() : "";
      if (email) {
        await User.findOneAndUpdate({ email }, { otpLastStatus: `send_failed:${error.message}` });
      }
    } catch (_e) {
      // no-op: avoid masking original error
    }
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= SET PASSWORD (for imported alumni) =================
router.post("/set-password", async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Please enter email and new password." });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    email = String(email).trim().toLowerCase();
    const user = await User.findOne({
      email,
      role: "alumni",
      password: null,
    });
    if (!user) {
      return res.status(404).json({ message: "No first-time account found for this email." });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    user.password = hashedPassword;
    user.isFirstLogin = false;
    user.isPasswordChanged = true;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.otpVerifyAttempts = 0;
    user.otpLastStatus = "verified";
    await user.save();

    return res.json({ message: "Password set successfully. Please login." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= FORGOT PASSWORD (simple) =================
router.post("/forgot-password", async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Please enter email and new password." });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    email = String(email).trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    user.password = hashedPassword;
    user.isFirstLogin = false;
    user.isPasswordChanged = true;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.otpVerifyAttempts = 0;
    user.otpLastStatus = "verified";
    await user.save();

    return res.json({ message: "Password reset successful. Please login." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= FORGOT PASSWORD REQUEST =================
router.post("/forgot-password/request", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please enter your email." });
    }

    email = String(email).trim().toLowerCase();
    const user = await User.findOne({ email, password: { $ne: null } });
    const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";

    // Generic response to avoid email enumeration.
    if (!user) {
      return res.json({ message: "If the email exists, an OTP has been sent." });
    }

    const gate = canSendOtp(user);
    if (!gate.allowed) {
      return res.status(429).json({ message: gate.message });
    }

    const otp = generateOtp();
    const now = new Date();
    if (gate.resetWindow) {
      user.otpRequestWindowStartedAt = now;
      user.otpRequestCount = 0;
    }
    user.otpRequestCount = (user.otpRequestCount || 0) + 1;
    user.otpLastSentAt = now;
    await storeOtp(user, otp);
    try {
      await sendOtpWithRetry({ email, otp, purpose: "Forgot Password" });
      user.otpLastStatus = "sent";
      await user.save();
      console.info(`[OTP] forgot-password OTP sent to ${email}`);
      return res.json({
        message: "If the email exists, an OTP has been sent.",
        ...(isProd ? {} : { devOtp: otp }),
      });
    } catch (mailError) {
      user.otpLastStatus = `send_failed:${mailError.message}`;
      await user.save();
      if (!isProd) {
        console.warn(`[OTP][DEV] SMTP failed for ${email}. Returning devOtp.`);
        return res.json({
          message: "SMTP failed in local mode. Use the dev OTP shown in UI.",
          devOtp: otp,
        });
      }
      return res.status(500).json({ message: "Could not send OTP right now. Please try again." });
    }
  } catch (error) {
    console.error(error);
    try {
      let email = req.body?.email ? String(req.body.email).trim().toLowerCase() : "";
      if (email) {
        await User.findOneAndUpdate({ email }, { otpLastStatus: `send_failed:${error.message}` });
      }
    } catch (_e) {
      // no-op: avoid masking original error
    }
    return res.status(500).json({ message: "Could not send OTP right now. Please try again." });
  }
});

// ================= FORGOT PASSWORD RESET =================
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
      return res.status(400).json({ message: "Please enter OTP and new password." });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const tokenHash = hashOtp(otp);
    const user = await User.findOne({
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user || !user.passwordResetToken) {
      return res.status(400).json({ message: "OTP is invalid or expired." });
    }

    if ((user.otpVerifyAttempts || 0) >= OTP_MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({ message: "Too many invalid OTP attempts. Request a new OTP." });
    }

    if (user.passwordResetToken !== tokenHash) {
      user.otpVerifyAttempts = (user.otpVerifyAttempts || 0) + 1;
      user.otpLastStatus = "verify_failed";
      await user.save();
      return res.status(400).json({ message: "OTP is invalid or expired." });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    user.password = hashedPassword;
    user.isFirstLogin = false;
    user.isPasswordChanged = true;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.otpVerifyAttempts = 0;
    user.otpLastStatus = "verified";
    await user.save();

    return res.json({ message: "Password reset successful. Please login." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= ONE-TIME MIGRATION (admin only) =================
// Sets password=null for imported alumni so they must use /set-password on first login.
router.post("/migrate-imported-passwords", authMiddleware, allowRoles("admin"), async (req, res) => {
  try {
    const { confirm } = req.body || {};
    if (confirm !== true) {
      return res.status(400).json({
        message: "Confirmation required. Send { confirm: true } to run migration.",
      });
    }

    const filter = {
      role: "alumni",
      isImported: true,
      password: { $ne: null },
    };

    const matchedBefore = await User.countDocuments(filter);

    const result = await User.updateMany(filter, {
      $set: {
        password: null,
        isFirstLogin: true,
        isPasswordChanged: false,
      },
    });

    return res.json({
      message: "Imported alumni password migration completed.",
      matchedBefore,
      modified: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Migration failed" });
  }
});

// ================= CHANGE PASSWORD (optional, for logged in users) =================
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      isPasswordChanged: true,
      isFirstLogin: false,
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

export default router;
