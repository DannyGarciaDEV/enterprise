"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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
        <p className="text-red-400/80">Loading…</p>
      </div>
    );
  }

  if (!user) {
    if (loadingTimedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-grid-pattern">
          <p className="text-red-400/80">Taking you to dashboard…</p>
        </div>
      );
    }
    return null;
  }

  if (user.companyNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern px-4">
        <div className="max-w-md w-full glass-panel rounded-xl p-6 text-center">
          <h1 className="text-xl font-bold text-white">Company not found</h1>
          <p className="text-slate-400 mt-2">Your company may have been deleted or is no longer available. Sign out and sign up again to create a new company.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => logout().then(() => router.push("/signup"))} className="px-4 py-2 bg-red-500 text-slate-950 text-sm font-medium rounded-lg hover:bg-red-400 btn-glow">
              Sign out and create new company
            </button>
            <Link href="/dashboard" className="px-4 py-2 border border-red-500/40 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10 inline-block transition-colors">
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
      <aside className="w-56 glass-panel border-r border-red-500/20 flex flex-col rounded-r-xl">
        <div className="p-4 border-b border-red-500/20">
          <h2 className="font-semibold text-red-400">DFlow</h2>
          <p className="text-sm text-slate-400 truncate">{user.companyName}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-400 hover:bg-slate-800/50 hover:text-red-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-red-500/20">
          <p className="px-3 py-1 text-sm text-slate-400 truncate">{user.email}</p>
          <p className="px-3 py-0.5 text-xs text-red-400 font-medium">{roleLabel(role)}</p>
          <button onClick={() => logout().then(() => router.push("/login"))} className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 text-slate-200">{children}</main>
    </div>
  );
}
