import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

// slug index is created automatically by unique: true
export default mongoose.models.Company || mongoose.model("Company", companySchema);
