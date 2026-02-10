import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import Company from "@/models/Company";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, companyName } = body;
    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { error: "Missing email, password, name, or company name" },
        { status: 400 }
      );
    }
    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    const slug = companyName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const company = await Company.create({
      name: companyName,
      slug: slug || `company-${Date.now()}`,
    });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      name,
      companyId: company._id,
      role: "owner",
    });
    const token = signToken({
      userId: user._id.toString(),
      companyId: company._id.toString(),
      email: user.email,
      role: user.role as "owner" | "admin" | "manager" | "staff",
    });
    const res = NextResponse.json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role, companyId: company._id, companyName: company.name },
      token,
    });
    res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
