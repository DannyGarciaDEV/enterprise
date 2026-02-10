import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

activitySchema.index({ companyId: 1, createdAt: -1 });
export default mongoose.models.Activity || mongoose.model("Activity", activitySchema);
