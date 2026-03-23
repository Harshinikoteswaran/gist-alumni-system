import express from "express";
import Job from "../models/Job.js";
import { authMiddleware, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, allowRoles("admin", "alumni"), async (req, res) => {
  try {
    const created = await Job.create({
      ...req.body,
      postedBy: req.user.id,
      postedByRole: req.user.role || "alumni",
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", authMiddleware, allowRoles("admin", "alumni"), async (req, res) => {
  try {
    const existing = await Job.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "admin" && existing.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authMiddleware, allowRoles("admin", "alumni"), async (req, res) => {
  try {
    const existing = await Job.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "admin" && existing.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await existing.deleteOne();

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
