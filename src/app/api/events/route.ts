import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Event from "@/models/Event";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    await connectDB();
    const list = await Event.find({ companyId: auth!.companyId })
      .populate("storeId", "name location")
      .populate("staffIds", "name email")
      .sort({ date: 1 })
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
    const doc = await Event.create({
      companyId: auth!.companyId,
      name: body.name,
      location: body.location,
      date: body.date,
      storeId: body.storeId,
      staffIds: body.staffIds ?? [],
      notes: body.notes,
    });
    await logActivity(
      auth!.companyId,
      "event_created",
      `Event created: ${body.name}`,
      auth!.userId,
      { eventId: doc._id }
    );
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
