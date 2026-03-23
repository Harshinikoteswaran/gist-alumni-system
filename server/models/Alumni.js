import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rollNumber: String,
    batch: String,
    degree: String,
    department: String,
    company: String,
    position: String,
    location: String,
    bio: String,
    profilePicture: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alumni", alumniSchema);
