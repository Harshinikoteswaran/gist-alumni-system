import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    coverPublicId: { type: String, default: "" },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Newsletter", newsletterSchema);
