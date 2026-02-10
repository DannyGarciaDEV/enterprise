import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    location: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

storeSchema.index({ companyId: 1 });
export default mongoose.models.Store || mongoose.model("Store", storeSchema);
