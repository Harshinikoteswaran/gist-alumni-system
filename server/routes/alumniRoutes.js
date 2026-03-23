import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from "fs";
import XLSX from "xlsx";
import Alumni from "../models/Alumni.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { authMiddleware, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const ROLL_NUMBER_REGEX = /^[A-Za-z0-9\-\/]{4,30}$/;
const isValidRollNumber = (value) => !value || ROLL_NUMBER_REGEX.test(String(value).trim());

// Create current user's alumni profile
router.post("/", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    const existing = await Alumni.findOne({ user: req.user.id });

    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    let profilePicture = req.body.profilePicture || "";
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      profilePicture = uploaded.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const alumni = new Alumni({
      ...req.body,
      profilePicture,
      user: req.user.id,
      department: "Computer Science and Engineering",
      isApproved: false,
    });

    const saved = await alumni.save();
    const populated = await saved.populate("user", "name email role");

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Public alumni list (approved only)
router.get("/", async (_req, res) => {
  try {
    const alumni = await Alumni.find({
      $or: [{ isApproved: true }, { isApproved: { $exists: false } }],
    }).populate("user", "name email");
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin list (all alumni, including pending)
router.get("/admin/list", authMiddleware, allowRoles("admin"), async (_req, res) => {
  try {
    const alumni = await Alumni.find().populate("user", "name email role status isPasswordChanged isFirstLogin");
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin create alumni + user
router.post("/admin/create", authMiddleware, allowRoles("admin"), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      batch,
      degree,
      department,
      company,
      position,
      location,
      bio,
      isApproved,
      profilePicture,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (!isValidRollNumber(rollNumber)) {
      return res.status(400).json({ message: "Invalid roll number format" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "alumni",
      status: "approved",
      isPasswordChanged: true,
      isFirstLogin: false,
    });

    const alumni = await Alumni.create({
      user: user._id,
      rollNumber,
      batch,
      degree,
      department: department || "Computer Science and Engineering",
      company,
      position,
      location,
      bio,
      isApproved: Boolean(isApproved),
      profilePicture,
    });

    const populated = await alumni.populate("user", "name email role");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create alumni" });
  }
});

// Admin bulk import alumni from excel file
router.post(
  "/admin/bulk-import",
  authMiddleware,
  allowRoles("admin"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Excel file is required" });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      fs.unlinkSync(req.file.path);

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors = [];

      for (const row of rows) {
        try {
          const email = getCell(row, ["email", "emailid", "mail", "mailid", "e-mail"]).toLowerCase().trim();
          const name = getCell(row, ["name", "full name", "student name", "student"]);
          const importedRollNumber = getCell(row, [
            "rollnumber",
            "roll number",
            "roll",
            "rollno",
            "roll.no",
            "roll no",
            "roll no.",
            "registration number",
            "reg no",
            "regno",
          ]);
          if (!email || !name) {
            skipped += 1;
            errors.push(`Skipped row: missing name/email`);
            continue;
          }
          if (!isValidRollNumber(importedRollNumber)) {
            skipped += 1;
            errors.push(`Skipped row due to invalid roll number for email: ${email}`);
            continue;
          }

          let user = await User.findOne({ email });
          if (!user) {
            const userPayload = {
              name,
              email,
              password: null,
              role: "alumni",
              status: "approved",
              isPasswordChanged: false,
              isFirstLogin: true,
              isImported: true,
            };

            // Avoid writing empty rollNumber because User.rollNumber has a unique index.
            if (importedRollNumber) {
              userPayload.rollNumber = importedRollNumber;
            }

            user = await User.create(userPayload);
            created += 1;
          } else if (user.role !== "admin") {
            const userUpdates = {};
            if (!user.name && name) userUpdates.name = name;
            if (!user.rollNumber) {
              if (importedRollNumber) userUpdates.rollNumber = importedRollNumber;
            }
            if (user.role === "alumni") {
              userUpdates.status = "approved";
              userUpdates.isImported = true;
              userUpdates.password = null;
              userUpdates.isFirstLogin = true;
              userUpdates.isPasswordChanged = false;
            }
            if (Object.keys(userUpdates).length > 0) {
              await User.findByIdAndUpdate(user._id, userUpdates);
            }
          }

          const alumniPayload = {
            rollNumber: importedRollNumber,
            batch: normalizeBatch(
              getCell(row, ["batch", "batch year", "passout year", "passed out year", "graduation year", "year", "batchyear", "passout"]),
            ),
            degree: getCell(row, ["degree", "course", "program", "qualification"]),
            department:
              getCell(row, ["department", "branch", "dept", "stream"]) || "Computer Science and Engineering",
            company: getCell(row, ["company", "organization", "organisation", "current company", "employer"]),
            position: getCell(row, ["position", "designation", "job title", "role"]),
            location: getCell(row, ["location", "city", "place", "address"]),
            bio: getCell(row, ["bio", "about", "summary", "description"]),
          };

          const alumniProfile = await Alumni.findOne({ user: user._id });
          if (!isValidRollNumber(alumniPayload.rollNumber)) {
            skipped += 1;
            errors.push(`Skipped row due to invalid roll number for email: ${email}`);
            continue;
          }
          if (!alumniProfile) {
            await Alumni.create({
              user: user._id,
              ...alumniPayload,
              isApproved: true,
            });
            updated += 1;
          } else {
            const updates = {};
            for (const [key, value] of Object.entries(alumniPayload)) {
              if (value) updates[key] = value;
            }
            updates.isApproved = true;
            if (Object.keys(updates).length > 0) {
              await Alumni.findByIdAndUpdate(alumniProfile._id, updates);
              updated += 1;
            } else {
              skipped += 1;
            }
          }
        } catch (rowError) {
          skipped += 1;
          errors.push(`Skipped row due to error: ${rowError.message}`);
        }
      }

      res.json({
        message: "Bulk import completed",
        created,
        updated,
        skipped,
        totalRows: rows.length,
        errors,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Bulk import failed" });
    }
  },
);

// Get current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    let alumni = await Alumni.findOne({ user: req.user.id }).populate("user");

    // Backfill missing profile for users created before profile auto-sync.
    if (!alumni) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(200).json(null);
      }

      const created = await Alumni.create({
        user: user._id,
        rollNumber: user.rollNumber || "",
        batch: user.batch || "",
        department: user.department || "Computer Science and Engineering",
        isApproved: user.status === "approved",
      });
      alumni = await created.populate("user");
    }

    res.json(alumni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update current user profile
router.put("/profile", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      updates.profilePicture = uploaded.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Re-approval workflow after profile edit
    updates.isApproved = false;

    const alumni = await Alumni.findOneAndUpdate({ user: req.user.id }, updates, {
      returnDocument: "after",
    });

    if (!alumni) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(alumni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});

// Get single alumni
router.get("/:id", async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id).populate("user", "name email role");
    if (!alumni) return res.status(404).json({ message: "Alumni not found" });
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/reject alumni
router.patch("/:id/approve", authMiddleware, allowRoles("admin"), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const approved = Boolean(isApproved);

    const updated = await Alumni.findByIdAndUpdate(
      req.params.id,
      { isApproved: approved },
      { returnDocument: "after" },
    ).populate("user", "name email role status");

    if (!updated) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    // Keep User.status in sync with alumni approval so login checks are consistent.
    if (updated.user?._id && updated.user?.role === "alumni") {
      const nextStatus = approved ? "approved" : "pending";
      if (updated.user.status !== nextStatus) {
        await User.findByIdAndUpdate(updated.user._id, { status: nextStatus });
        updated.user.status = nextStatus;
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update alumni (admin)
router.put("/:id", authMiddleware, allowRoles("admin"), async (req, res) => {
  try {
    const { name, email, ...alumniUpdates } = req.body;

    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    if (name || email) {
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (email) userUpdates.email = email.trim().toLowerCase();

      await User.findByIdAndUpdate(alumni.user, userUpdates);
    }

    const updatedAlumni = await Alumni.findByIdAndUpdate(req.params.id, alumniUpdates, {
      returnDocument: "after",
    }).populate("user", "name email role");

    res.json(updatedAlumni);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete alumni (admin)
router.delete("/:id", authMiddleware, allowRoles("admin"), async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    await User.findByIdAndDelete(alumni.user);
    await Alumni.findByIdAndDelete(req.params.id);

    res.json({ message: "Alumni deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getCell(row, acceptedKeys) {
  const normalized = Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase().replace(/\s+/g, "")] = row[key];
    return acc;
  }, {});

  for (const key of acceptedKeys) {
    const value = normalized[key.toLowerCase().replace(/\s+/g, "")];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function normalizeBatch(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return "";
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : value;
}

export default router;
