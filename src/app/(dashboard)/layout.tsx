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
      setLoadingTimedOut(false);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!user) {
    if (loadingTimedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">Taking you to dashboard…</p>
        </div>
      );
    }
    return null;
  }

  if (user.companyNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 text-center">
          <h1 className="text-xl font-bold text-slate-800">Company not found</h1>
          <p className="text-slate-600 mt-2">Your company may have been deleted or is no longer available. Sign out and sign up again to create a new company.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => logout().then(() => router.push("/signup"))}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
            >
              Sign out and create new company
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 inline-block"
            >
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
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-red-600">DFlow</h2>
          <p className="text-sm text-slate-500 truncate">{user.companyName}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === href
                  ? "bg-red-50 text-red-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-200">
          <p className="px-3 py-1 text-sm text-slate-500 truncate">{user.email}</p>
          <p className="px-3 py-0.5 text-xs text-red-600 font-medium">{roleLabel(role)}</p>
          <button
            onClick={() => logout().then(() => router.push("/login"))}
            className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
