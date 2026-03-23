import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Alumni Event",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
