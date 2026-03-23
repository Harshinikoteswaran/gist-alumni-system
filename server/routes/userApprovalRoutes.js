import express from "express";
import User from "../models/User.js";
import Alumni from "../models/Alumni.js";
import { authMiddleware, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware, allowRoles("admin"));

// List pending registrations
router.get("/pending-users", async (_req, res) => {
  try {
    const users = await User.find({ role: "alumni", status: "pending" })
      .select("name email batch department status createdAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
});

// Approve pending user
router.patch("/pending-users/:id/approve", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "alumni") {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "approved";
    await user.save();

    const alumniProfile = await Alumni.findOne({ user: user._id });
    if (!alumniProfile) {
      await Alumni.create({
        user: user._id,
        batch: user.batch || "",
        department: user.department || "Computer Science and Engineering",
        isApproved: true,
      });
    } else if (alumniProfile.isApproved !== true) {
      alumniProfile.isApproved = true;
      await alumniProfile.save();
    }

    res.json({ message: "User approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve user" });
  }
});

// Reject pending user (delete)
router.delete("/pending-users/:id/reject", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "alumni") {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(user._id);
    await Alumni.deleteMany({ user: user._id });

    res.json({ message: "User rejected and removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reject user" });
  }
});

export default router;
