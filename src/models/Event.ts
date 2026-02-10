import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    location: { type: String },
    date: { type: Date, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    notes: { type: String },
  },
  { timestamps: true }
);

eventSchema.index({ companyId: 1 });
eventSchema.index({ date: 1 });
export default mongoose.models.Event || mongoose.model("Event", eventSchema);
