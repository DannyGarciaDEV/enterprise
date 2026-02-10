import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest, getAuthFromCookie, JWTPayload } from "@/lib/auth";

export function requireAuth(req: NextRequest): { auth: JWTPayload; res: null } | { auth: null; res: NextResponse } {
  const auth = getAuthFromRequest(req) ?? getAuthFromCookie(req.headers.get("cookie") ?? null);
  if (!auth) {
    return { auth: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { auth, res: null };
}
