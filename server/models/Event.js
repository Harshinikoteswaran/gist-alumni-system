import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    eventDate: { type: Date, required: true },
    location: { type: String, default: "" },
    registrationLink: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
