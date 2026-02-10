import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthFromRequest, getAuthFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import Employee from "@/models/Employee";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req) ?? getAuthFromCookie(req.headers.get("cookie") ?? null);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!mongoose.isValidObjectId(auth.userId)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
  try {
    await connectDB();
  } catch (e) {
    console.error("[auth/me] DB connection failed:", e);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  try {
    const user = await User.findById(auth.userId).select("-passwordHash").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const companyId = user.companyId?.toString?.() ?? user.companyId;
    const [company, myEmployee] = await Promise.all([
      companyId ? Company.findById(companyId).lean() : null,
      companyId ? Employee.findOne({ companyId, email: user.email }).select("_id").lean() : null,
    ]);
    const companyNotFound = !company;
    const payload = {
      _id: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: companyId ?? "",
      companyName: company?.name ?? null,
      companyNotFound,
      myEmployeeId: myEmployee?._id ? (myEmployee._id as mongoose.Types.ObjectId).toString() : null,
    };
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[auth/me] Error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
