import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    jobType: { type: String, default: "Full-time" },
    description: { type: String, default: "" },
    applyLink: { type: String, default: "" },
    deadline: { type: Date },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postedByRole: {
      type: String,
      enum: ["admin", "alumni"],
      default: "alumni",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
