import mongoose from "mongoose";

const statusEnum = ["todo", "in_progress", "done"];
const priorityEnum = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true },
    description: { type: String },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    dueDate: { type: Date },
    status: { type: String, enum: statusEnum, default: "todo" },
    priority: { type: String, enum: priorityEnum, default: "medium" },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

taskSchema.index({ companyId: 1 });
taskSchema.index({ companyId: 1, dueDate: 1 });
taskSchema.index({ assigneeId: 1 });
export default mongoose.models.Task || mongoose.model("Task", taskSchema);
