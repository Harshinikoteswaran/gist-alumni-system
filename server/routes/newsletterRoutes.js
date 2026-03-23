import express from "express";
import multer from "multer";
import fs from "fs";
import Newsletter from "../models/Newsletter.js";
import cloudinary from "../config/cloudinary.js";
import { authMiddleware, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", async (_req, res) => {
  try {
    const newsletters = await Newsletter.find().sort({ publishedAt: -1, createdAt: -1 });
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, allowRoles("admin"), upload.single("coverImage"), async (req, res) => {
  try {
    const payload = { ...req.body };

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      payload.coverImage = uploaded.secure_url;
      payload.coverPublicId = uploaded.public_id;
      fs.unlinkSync(req.file.path);
    }

    const created = await Newsletter.create(payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", authMiddleware, allowRoles("admin"), upload.single("coverImage"), async (req, res) => {
  try {
    const payload = { ...req.body };
    const existing = await Newsletter.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    if (req.file) {
      if (existing.coverPublicId) {
        await cloudinary.uploader.destroy(existing.coverPublicId);
      }
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      payload.coverImage = uploaded.secure_url;
      payload.coverPublicId = uploaded.public_id;
      fs.unlinkSync(req.file.path);
    }

    const updated = await Newsletter.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authMiddleware, allowRoles("admin"), async (req, res) => {
  try {
    const deleted = await Newsletter.findById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    if (deleted.coverPublicId) {
      await cloudinary.uploader.destroy(deleted.coverPublicId);
    }

    await deleted.deleteOne();
    res.json({ message: "Newsletter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
