"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    title: "Tasks & workflows",
    description: "Assign, track, and complete work across your team with clear due dates and status.",
    icon: "✓",
  },
  {
    title: "Employees",
    description: "Manage your team, roles, and permissions in one place.",
    icon: "👤",
  },
  {
    title: "Shipments",
    description: "Track shipments and delivery status from order to fulfillment.",
    icon: "📦",
  },
  {
    title: "Stores & locations",
    description: "Organize locations and inventory by store or site.",
    icon: "🏪",
  },
  {
    title: "Events",
    description: "Schedule and manage events with your team and stakeholders.",
    icon: "📅",
  },
  {
    title: "Chat",
    description: "In-app messaging so your team can collaborate without leaving DFlow.",
    icon: "💬",
  },
  {
    title: "Activity & metrics",
    description: "See what’s happening and measure progress with dashboards and reports.",
    icon: "📊",
  },
  {
    title: "Email",
    description: "Send transactional and notification emails via Resend integration.",
    icon: "✉️",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-slate-900 font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-[#faf9f7]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold text-slate-900 text-lg tracking-tight">
            DFlow
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Operations in one place
            </h1>
            <p className="mt-5 text-lg text-slate-600 sm:text-xl">
              DFlow keeps your company aligned: tasks, employees, shipments, stores, events, and chat—all in a single workspace.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto rounded-xl bg-red-600 px-6 py-3.5 text-base font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Start free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-white/60 py-16 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              Everything your team needs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
              One platform for daily operations, visibility, and collaboration.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="text-2xl" aria-hidden>{f.icon}</span>
                  <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-3 text-slate-600">
              Create your company and invite your team in minutes.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex rounded-xl bg-red-600 px-6 py-3.5 text-base font-medium text-white hover:bg-red-700 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">© DFlow. Business operations platform.</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
              Log in
            </Link>
            <Link href="/signup" className="text-sm text-slate-500 hover:text-slate-700">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
