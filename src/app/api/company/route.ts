import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Company from "@/models/Company";

function toObjectId(id: string) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    await connectDB();
    const id = toObjectId(auth!.companyId);
    if (!id) return NextResponse.json({ error: "Invalid company" }, { status: 400 });
    const company = await Company.findById(id).select("name slug").lean();
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    return NextResponse.json(company);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  try {
    const body = await req.json();
    const { name } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }
    await connectDB();
    const id = toObjectId(auth!.companyId);
    if (!id) return NextResponse.json({ error: "Invalid company" }, { status: 400 });

    const slug =
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || `company-${Date.now()}`;

    const company = await Company.findOneAndUpdate(
      { _id: id },
      { $set: { name: name.trim(), slug } },
      { new: true, runValidators: true }
    )
      .select("name slug")
      .lean();

    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    return NextResponse.json(company);
  } catch (e: unknown) {
    console.error(e);
    const msg = e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000
      ? "That company name conflicts with an existing one. Try a different name."
      : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
