import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Shipment from "@/models/Shipment";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    await connectDB();
    const list = await Shipment.find({ companyId: auth!.companyId })
      .populate("destinationStoreId", "name location")
      .populate("receivedById", "name")
      .sort({ createdAt: -1 })
      .lean();
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
    const doc = await Shipment.create({
      companyId: auth!.companyId,
      trackingNumber: body.trackingNumber,
      carrier: body.carrier,
      vendor: body.vendor,
      purchaseOrderNumber: body.purchaseOrderNumber,
      destinationStoreId: body.destinationStoreId,
      status: body.status ?? "created",
      dateReceived: body.dateReceived,
      receivedById: body.receivedById,
      notes: body.notes,
      attachments: body.attachments ?? [],
    });
    await logActivity(
      auth!.companyId,
      "shipment_created",
      body.trackingNumber ? `Shipment ${body.trackingNumber} added` : "Shipment added",
      auth!.userId,
      { shipmentId: doc._id }
    );
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
