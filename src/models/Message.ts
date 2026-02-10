import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ companyId: 1 });
messageSchema.index({ fromUserId: 1, toUserId: 1 });
messageSchema.index({ toUserId: 1, fromUserId: 1 });
export default mongoose.models.Message || mongoose.model("Message", messageSchema);
