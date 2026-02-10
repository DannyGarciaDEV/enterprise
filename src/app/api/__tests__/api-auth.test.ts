import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-auth";

function mockRequest(headers: { get: (name: string) => string | null }): NextRequest {
  return { headers } as unknown as NextRequest;
}

describe("requireAuth", () => {
  it("returns 401 response when no auth header or cookie", () => {
    const req = mockRequest({ get: () => null });
    const result = requireAuth(req);
    expect(result.auth).toBeNull();
    expect(result.res).not.toBeNull();
    expect(result.res?.status).toBe(401);
  });

  it("returns auth and null res when valid Bearer token", async () => {
    const { signToken } = await import("@/lib/auth");
    const token = signToken({
      userId: "u1",
      companyId: "c1",
      email: "e@t.com",
      role: "owner",
    });
    const req = mockRequest({
      get: (name: string) => (name === "authorization" ? `Bearer ${token}` : null),
    });
    const result = requireAuth(req);
    expect(result.res).toBeNull();
    expect(result.auth).not.toBeNull();
    expect(result.auth?.userId).toBe("u1");
    expect(result.auth?.companyId).toBe("c1");
  });
});
