import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    await connectDB();
    const users = await User.find({ companyId: auth!.companyId })
      .select("_id name email role")
      .lean();
    const list = users.filter((u) => u._id.toString() !== auth!.userId);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
