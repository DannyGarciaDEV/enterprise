import { describe, it, expect } from "vitest";
import {
  signToken,
  verifyToken,
  getAuthFromRequest,
  getAuthFromCookie,
  type JWTPayload,
} from "../auth";

describe("auth", () => {
  const payload: JWTPayload = {
    userId: "user123",
    companyId: "company456",
    email: "test@example.com",
    role: "owner",
  };

  describe("signToken", () => {
    it("returns a non-empty string", () => {
      const token = signToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("produces a token that can be verified", () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.companyId).toBe(payload.companyId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });
  });

  describe("verifyToken", () => {
    it("returns null for invalid token", () => {
      expect(verifyToken("invalid")).toBeNull();
      expect(verifyToken("")).toBeNull();
    });

    it("returns null for malformed token", () => {
      expect(verifyToken("not.a.token")).toBeNull();
    });

    it("returns payload for valid token", () => {
      const token = signToken(payload);
      const result = verifyToken(token);
      expect(result).not.toBeNull();
      expect(result).toMatchObject(payload);
      expect(result?.userId).toBe(payload.userId);
      expect(result?.companyId).toBe(payload.companyId);
      expect(result?.email).toBe(payload.email);
      expect(result?.role).toBe(payload.role);
    });
  });

  describe("getAuthFromRequest", () => {
    it("returns null when no Authorization header", () => {
      const req = { headers: { get: () => null } } as unknown as Parameters<typeof getAuthFromRequest>[0];
      const auth = getAuthFromRequest(req);
      expect(auth).toBeNull();
    });

    it("returns null when Authorization does not start with Bearer ", () => {
      const req = {
        headers: { get: (name: string) => (name === "authorization" ? "Basic xyz" : null) },
      } as unknown as Parameters<typeof getAuthFromRequest>[0];
      expect(getAuthFromRequest(req)).toBeNull();
    });

    it("returns payload when valid Bearer token", () => {
      const token = signToken(payload);
      const req = {
        headers: { get: (name: string) => (name === "authorization" ? `Bearer ${token}` : null) },
      } as unknown as Parameters<typeof getAuthFromRequest>[0];
      const auth = getAuthFromRequest(req);
      expect(auth).not.toBeNull();
      expect(auth?.userId).toBe(payload.userId);
    });
  });

  describe("getAuthFromCookie", () => {
    it("returns null when cookie header is null", () => {
      expect(getAuthFromCookie(null)).toBeNull();
    });

    it("returns null when no token cookie", () => {
      expect(getAuthFromCookie("other=value")).toBeNull();
    });

    it("returns payload when valid token in cookie", () => {
      const token = signToken(payload);
      const cookie = `token=${token}; other=value`;
      const auth = getAuthFromCookie(cookie);
      expect(auth).not.toBeNull();
      expect(auth?.userId).toBe(payload.userId);
    });
  });
});
