let transporter = null;
let nodemailerModule = null;

async function loadNodemailer() {
  if (nodemailerModule) return nodemailerModule;
  try {
    nodemailerModule = await import("nodemailer");
    return nodemailerModule;
  } catch (_error) {
    throw new Error("nodemailer is not installed. Run: cd server && npm install");
  }
}

async function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  if (!smtpUser || !smtpPass) {
    throw new Error(
      "SMTP credentials missing. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS or GMAIL_USER/GMAIL_APP_PASSWORD).",
    );
  }

  const nodemailer = await loadNodemailer();

  transporter = nodemailer.default.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

export async function sendOtpEmail({ to, otp, purpose }) {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const from = process.env.MAIL_FROM || smtpUser;
  const appName = process.env.APP_NAME || "GIST Alumni Network";
  const subject = `${appName} ${purpose} OTP`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>${appName}</h2>
      <p>Your OTP for ${purpose.toLowerCase()} is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  const t = await getTransporter();
  await t.sendMail({
    from,
    to,
    subject,
    html,
    text: `Your OTP for ${purpose.toLowerCase()} is ${otp}. It is valid for 10 minutes.`,
  });
}
