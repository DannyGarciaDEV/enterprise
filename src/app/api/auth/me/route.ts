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
    const userDoc = await User.findById(auth.userId).select("-passwordHash").lean();
    if (!userDoc || Array.isArray(userDoc)) return NextResponse.json({ error: "User not found" }, { status: 404 });
    type UserLean = { _id: mongoose.Types.ObjectId; email: string; name: string; companyId: mongoose.Types.ObjectId; role: string };
    const user = userDoc as unknown as UserLean;
    const companyId = user.companyId?.toString?.() ?? user.companyId;
    const [companyDoc, myEmployeeDoc] = await Promise.all([
      companyId ? Company.findById(companyId).lean() : null,
      companyId ? Employee.findOne({ companyId, email: user.email }).select("_id").lean() : null,
    ]);
    const company = companyDoc && !Array.isArray(companyDoc) ? (companyDoc as { name?: string }) : null;
    const myEmployee = myEmployeeDoc && !Array.isArray(myEmployeeDoc) ? (myEmployeeDoc as { _id?: mongoose.Types.ObjectId }) : null;
    const companyNotFound = !company;
    const payload = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: companyId ?? "",
      companyName: company?.name ?? null,
      companyNotFound,
      myEmployeeId: myEmployee?._id ? myEmployee._id.toString() : null,
    };
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[auth/me] Error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
