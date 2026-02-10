import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Employee from "@/models/Employee";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    await connectDB();
    const list = await Employee.find({ companyId: auth!.companyId })
      .populate("storeId", "name location")
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
    const doc = await Employee.create({
      companyId: auth!.companyId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      storeId: body.storeId || undefined,
      status: body.status ?? "active",
      notes: body.notes,
    });
    await logActivity(
      auth!.companyId,
      "employee_created",
      `New employee joined: ${body.name}`,
      auth!.userId
    );
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
