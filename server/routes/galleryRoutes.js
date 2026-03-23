import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Gallery from "../models/Gallery.js";
import fs from "fs";
import { authMiddleware, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer config
const upload = multer({ dest: "uploads/" });

/* ===============================
   Upload Image
================================= */
router.post("/upload", authMiddleware, allowRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const newImage = new Gallery({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      title: req.body.title || "Alumni Event",
      description: req.body.description || "",
    });

    await newImage.save();

    // delete temp file
    fs.unlinkSync(req.file.path);

    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   Get All Images
================================= */
router.get("/", async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   Delete Image
================================= */
router.delete("/:id", authMiddleware, allowRoles("admin"), async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    await cloudinary.uploader.destroy(image.publicId);
    await image.deleteOne();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   Update Image
================================= */
router.put("/:id", authMiddleware, allowRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    let imageUrl = image.imageUrl;
    let publicId = image.publicId;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      publicId = result.public_id;

      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }

      fs.unlinkSync(req.file.path);
    }

    image.title = req.body.title || image.title;
    image.description = req.body.description || "";
    image.imageUrl = imageUrl;
    image.publicId = publicId;

    await image.save();

    res.json(image);
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
