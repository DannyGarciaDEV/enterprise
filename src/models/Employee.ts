import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    role: { type: String },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    status: { type: String, default: "active" },
    notes: { type: String },
  },
  { timestamps: true }
);

employeeSchema.index({ companyId: 1 });
export default mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
