import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Task from "@/models/Task";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    await connectDB();
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const list = await Task.find({ companyId: auth!.companyId })
      .populate("assigneeId", "name email")
      .populate("createdById", "name")
      .lean();
    type TaskLean = { priority?: string; dueDate?: Date };
    list.sort((a, b) => {
      const p = (priorityOrder[(a as unknown as TaskLean).priority as keyof typeof priorityOrder] ?? 1) - (priorityOrder[(b as unknown as TaskLean).priority as keyof typeof priorityOrder] ?? 1);
      if (p !== 0) return p;
      const dA = (a as unknown as TaskLean).dueDate ? new Date((a as unknown as TaskLean).dueDate!).getTime() : Infinity;
      const dB = (b as unknown as TaskLean).dueDate ? new Date((b as unknown as TaskLean).dueDate!).getTime() : Infinity;
      return dA - dB;
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    const body = await req.json();
    await connectDB();
    const doc = await Task.create({
      companyId: auth!.companyId,
      title: body.title,
      description: body.description,
      assigneeId: body.assigneeId || undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      createdById: auth!.userId,
    });
    const populated = await Task.findById(doc._id)
      .populate("assigneeId", "name email")
      .populate("createdById", "name")
      .lean();
    await logActivity(
      auth!.companyId,
      "task_created",
      `Task "${body.title}" created`,
      auth!.userId,
      { taskId: doc._id }
    );
    return NextResponse.json(populated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
