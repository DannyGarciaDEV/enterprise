import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

companySchema.index({ slug: 1 });
export default mongoose.models.Company || mongoose.model("Company", companySchema);
