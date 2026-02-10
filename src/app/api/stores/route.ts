import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Store from "@/models/Store";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    await connectDB();
    const list = await Store.find({ companyId: auth!.companyId })
      .populate("managerId", "name email")
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
    const doc = await Store.create({
      companyId: auth!.companyId,
      name: body.name,
      location: body.location,
      managerId: body.managerId || undefined,
    });
    await logActivity(
      auth!.companyId,
      "store_created",
      `Store created: ${body.name}`,
      auth!.userId,
      { storeId: doc._id }
    );
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
