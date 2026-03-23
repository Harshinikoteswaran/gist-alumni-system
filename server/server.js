import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import galleryRoutes from "./routes/galleryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import userApprovalRoutes from "./routes/userApprovalRoutes.js";

dotenv.config();
const hasSmtpUser = Boolean(process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER);
const hasSmtpPass = Boolean(process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD);
if (!hasSmtpUser || !hasSmtpPass) {
  console.warn("[OTP] Email OTP is not fully configured. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS or GMAIL_USER/GMAIL_APP_PASSWORD).");
}
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use('/api/alumni', alumniRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', userApprovalRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/newsletters', newsletterRoutes);

app.get('/', (req, res) => {
    res.send('Alumni System API Running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
