import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAuth } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import SentEmail from "@/models/SentEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || "DFlow <onboarding@resend.dev>";

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email is not configured. Add RESEND_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { to, subject, content, toName } = body;

    if (!to || typeof to !== "string" || !isValidEmail(to)) {
      return NextResponse.json({ error: "Valid 'to' email is required" }, { status: 400 });
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    const text = typeof content === "string" ? content.trim() : "";
    const html = text ? text.replace(/\n/g, "<br>") : "<p>No content.</p>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject.trim(),
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    await connectDB();
    await SentEmail.create({
      companyId: auth!.companyId,
      fromUserId: auth!.userId,
      to,
      toName: toName || undefined,
      subject: subject.trim(),
    });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
