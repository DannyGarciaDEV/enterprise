import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Message from "@/models/Message";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  const withUserId = req.nextUrl.searchParams.get("with");
  if (!withUserId) {
    return NextResponse.json({ error: "Missing with (userId)" }, { status: 400 });
  }
  try {
    await connectDB();
    const messages = await Message.find({
      companyId: auth!.companyId,
      $or: [
        { fromUserId: auth!.userId, toUserId: withUserId },
        { fromUserId: withUserId, toUserId: auth!.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("fromUserId", "name")
      .populate("toUserId", "name")
      .lean();
    return NextResponse.json(messages);
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
    const { toUserId, content } = body;
    if (!toUserId || !content?.trim()) {
      return NextResponse.json({ error: "Missing toUserId or content" }, { status: 400 });
    }
    await connectDB();
    const doc = await Message.create({
      companyId: auth!.companyId,
      fromUserId: auth!.userId,
      toUserId,
      content: content.trim(),
    });
    const populated = await Message.findById(doc._id)
      .populate("fromUserId", "name")
      .populate("toUserId", "name")
      .lean();
    return NextResponse.json(populated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
