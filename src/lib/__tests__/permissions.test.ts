import { describe, it, expect } from "vitest";
import {
  canManageCompany,
  canManageSettings,
  canManageStoresAndEvents,
  canManageEmployees,
  canViewMetrics,
  roleLabel,
  type Role,
} from "../permissions";

const roles: Role[] = ["owner", "admin", "manager", "staff"];

describe("permissions", () => {
  describe("canManageCompany", () => {
    it("returns true for owner and admin only", () => {
      expect(canManageCompany("owner")).toBe(true);
      expect(canManageCompany("admin")).toBe(true);
      expect(canManageCompany("manager")).toBe(false);
      expect(canManageCompany("staff")).toBe(false);
    });
  });

  describe("canManageSettings", () => {
    it("returns true for owner and admin only", () => {
      expect(canManageSettings("owner")).toBe(true);
      expect(canManageSettings("admin")).toBe(true);
      expect(canManageSettings("manager")).toBe(false);
      expect(canManageSettings("staff")).toBe(false);
    });
  });

  describe("canManageStoresAndEvents", () => {
    it("returns true for owner, admin, and manager", () => {
      expect(canManageStoresAndEvents("owner")).toBe(true);
      expect(canManageStoresAndEvents("admin")).toBe(true);
      expect(canManageStoresAndEvents("manager")).toBe(true);
      expect(canManageStoresAndEvents("staff")).toBe(false);
    });
  });

  describe("canManageEmployees", () => {
    it("returns true for owner, admin, and manager", () => {
      expect(canManageEmployees("owner")).toBe(true);
      expect(canManageEmployees("admin")).toBe(true);
      expect(canManageEmployees("manager")).toBe(true);
      expect(canManageEmployees("staff")).toBe(false);
    });
  });

  describe("canViewMetrics", () => {
    it("returns true for owner and admin only", () => {
      expect(canViewMetrics("owner")).toBe(true);
      expect(canViewMetrics("admin")).toBe(true);
      expect(canViewMetrics("manager")).toBe(false);
      expect(canViewMetrics("staff")).toBe(false);
    });
  });

  describe("roleLabel", () => {
    it("returns capitalized label for each role", () => {
      expect(roleLabel("owner")).toBe("Owner");
      expect(roleLabel("admin")).toBe("Admin");
      expect(roleLabel("manager")).toBe("Manager");
      expect(roleLabel("staff")).toBe("Staff");
    });

    it("returns role string for unknown role", () => {
      expect(roleLabel("unknown" as Role)).toBe("unknown");
    });
  });
});
