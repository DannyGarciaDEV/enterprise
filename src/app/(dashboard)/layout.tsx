"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { roleLabel, type Role } from "@/lib/permissions";

const LOADING_TIMEOUT_MS = 6000;

const navItems: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/employees", label: "Employees" },
  { href: "/shipments", label: "Shipments" },
  { href: "/stores", label: "Stores" },
  { href: "/events", label: "Events" },
  { href: "/chat", label: "Chat" },
  { href: "/activity", label: "Activity" },
  { href: "/metrics", label: "Metrics", roles: ["owner", "admin"] },
  { href: "/settings", label: "Settings", roles: ["owner", "admin"] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (loading) {
      queueMicrotask(() => setLoadingTimedOut(false));
      timeoutRef.current = setTimeout(() => {
        setLoadingTimedOut(true);
        if (pathname !== "/dashboard") router.replace("/dashboard");
      }, LOADING_TIMEOUT_MS);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading, router, pathname]);

  if (loading && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern">
        <p className="text-[var(--accent)]/80">Loading…</p>
      </div>
    );
  }

  if (!user) {
    if (loadingTimedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-grid-pattern">
          <p className="text-[var(--accent)]/80">Taking you to dashboard…</p>
        </div>
      );
    }
    return null;
  }

  if (user.companyNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern px-4">
        <div className="max-w-md w-full glass-panel rounded-xl p-6 text-center">
          <h1 className="text-xl font-bold text-[var(--foreground)]">Company not found</h1>
          <p className="text-[var(--muted)] mt-2">Your company may have been deleted or is no longer available. Sign out and sign up again to create a new company.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => logout().then(() => router.push("/signup"))} className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 btn-glow">
              Sign out and create new company
            </button>
            <Link href="/dashboard" className="px-4 py-2 border border-[var(--border)] text-[var(--accent)] text-sm font-medium rounded-lg hover:bg-[var(--accent)]/10 inline-block transition-colors">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const role = (user.role || "staff") as Role;
  const nav = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-grid-pattern flex">
      <aside className="w-56 glass-panel border-r border-[var(--border)] flex flex-col rounded-r-xl">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--accent)]">DFlow</h2>
          <p className="text-sm text-[var(--muted)] truncate">{user.companyName}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30" : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-[var(--border)]">
          <div className="px-3 py-2 flex justify-end">
            <ThemeToggle />
          </div>
          <p className="px-3 py-1 text-sm text-[var(--muted)] truncate">{user.email}</p>
          <p className="px-3 py-0.5 text-xs text-[var(--accent)] font-medium">{roleLabel(role)}</p>
          <button onClick={() => logout().then(() => router.push("/login"))} className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 text-[var(--foreground)]">{children}</main>
    </div>
  );
}
