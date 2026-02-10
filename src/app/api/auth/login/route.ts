import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import User from "@/models/User";
import Company from "@/models/Company";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }
    await connectDB();
    const found = await User.findOne({ email }).lean();
    if (!found || Array.isArray(found)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    type UserLean = { _id: unknown; email: string; passwordHash: string; name: string; companyId: unknown; role: string };
    const user = found as unknown as UserLean;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const companyDoc = await Company.findById(user.companyId).lean();
    const company = companyDoc && !Array.isArray(companyDoc) ? (companyDoc as { name?: string }) : null;
    const token = signToken({
      userId: String(user._id),
      companyId: String(user.companyId),
      email: user.email,
      role: user.role as "owner" | "admin" | "manager" | "staff",
    });
    const res = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        companyName: company?.name ?? undefined,
      },
      token,
    });
    res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
