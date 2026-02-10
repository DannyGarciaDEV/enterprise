import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Activity from "@/models/Activity";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10), 100);
  try {
    await connectDB();
    const list = await Activity.find({ companyId: auth!.companyId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name")
      .lean();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
