import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Shipment from "@/models/Shipment";
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
    const doc = await Shipment.findOne({ _id: id, companyId: auth!.companyId })
      .populate("destinationStoreId", "name location")
      .populate("receivedById", "name")
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
    const doc = await Shipment.findOneAndUpdate(
      { _id: id, companyId: auth!.companyId },
      { $set: body },
      { new: true }
    )
      .populate("destinationStoreId", "name location")
      .populate("receivedById", "name")
      .lean();
    if (!doc || Array.isArray(doc)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.status === "received") {
      const dest = (doc as { destinationStoreId?: { name?: string } }).destinationStoreId;
      const storeName = dest && typeof dest === "object" && "name" in dest ? dest.name : null;
      await logActivity(
        auth!.companyId,
        "shipment_received",
        storeName ? `${storeName} received shipment` : "Shipment received",
        auth!.userId,
        { shipmentId: id }
      );
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
    const doc = await Shipment.findOneAndDelete({ _id: id, companyId: auth!.companyId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
