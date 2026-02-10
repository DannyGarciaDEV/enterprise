import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Task from "@/models/Task";
import { logActivity } from "@/lib/activity";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await connectDB();
    const doc = await Task.findOne({ _id: id, companyId: auth!.companyId })
      .populate("assigneeId", "name email")
      .populate("createdById", "name")
      .lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const body = await req.json();
    await connectDB();
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.assigneeId !== undefined) updates.assigneeId = body.assigneeId || null;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;

    const doc = await Task.findOneAndUpdate(
      { _id: id, companyId: auth!.companyId },
      { $set: updates },
      { new: true }
    )
      .populate("assigneeId", "name email")
      .populate("createdById", "name")
      .lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.status === "done") {
      await logActivity(auth!.companyId, "task_completed", `Task "${doc.title}" completed`, auth!.userId, { taskId: id });
    } else {
      await logActivity(auth!.companyId, "task_updated", `Task "${doc.title}" updated`, auth!.userId, { taskId: id });
    }
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await connectDB();
    const doc = await Task.findOneAndDelete({ _id: id, companyId: auth!.companyId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
