export type Role = "owner" | "admin" | "manager" | "staff";

export function canManageCompany(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export function canManageSettings(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export function canManageStoresAndEvents(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

export function canManageEmployees(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

export function canViewMetrics(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export function roleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    owner: "Owner",
    admin: "Admin",
    manager: "Manager",
    staff: "Staff",
  };
  return labels[role] || role;
}
