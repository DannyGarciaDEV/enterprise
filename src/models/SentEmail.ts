import mongoose from "mongoose";

const sentEmailSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: String, required: true },
    toName: { type: String },
    subject: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sentEmailSchema.index({ companyId: 1 });
sentEmailSchema.index({ companyId: 1, sentAt: -1 });
export default mongoose.models.SentEmail || mongoose.model("SentEmail", sentEmailSchema);
