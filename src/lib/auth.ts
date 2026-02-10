import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export type Role = "owner" | "admin" | "manager" | "staff";

export interface JWTPayload {
  userId: string;
  companyId: string;
  email: string;
  role: Role;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getAuthFromRequest(req: NextRequest): JWTPayload | null {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

export function getAuthFromCookie(cookieHeader: string | null): JWTPayload | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/token=([^;]+)/);
  const token = match?.[1];
  if (!token) return null;
  return verifyToken(token);
}
