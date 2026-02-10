import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
  },
  { timestamps: true }
);

companySchema.index({ slug: 1 }, { unique: true });
export default mongoose.models.Company || mongoose.model("Company", companySchema);
