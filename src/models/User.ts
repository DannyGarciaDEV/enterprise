import mongoose from "mongoose";

export type Role = "owner" | "admin" | "manager" | "staff";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    role: { type: String, enum: ["owner", "admin", "manager", "staff"], default: "staff" },
  },
  { timestamps: true }
);

userSchema.index({ companyId: 1 });
// email index is created automatically by unique: true
export default mongoose.models.User || mongoose.model("User", userSchema);
