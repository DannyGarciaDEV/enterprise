import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Event from "@/models/Event";

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
    const doc = await Event.findOne({ _id: id, companyId: auth!.companyId })
      .populate("storeId", "name location")
      .populate("staffIds", "name email")
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
    const doc = await Event.findOneAndUpdate(
      { _id: id, companyId: auth!.companyId },
      { $set: body },
      { new: true }
    )
      .populate("storeId", "name location")
      .populate("staffIds", "name email")
      .lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    const doc = await Event.findOneAndDelete({ _id: id, companyId: auth!.companyId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
