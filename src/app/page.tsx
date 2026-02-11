"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { title: "Tasks & workflows", description: "Assign, track, and complete work across your team with clear due dates and status.", icon: "◇" },
  { title: "Employees", description: "Manage your team, roles, and permissions in one place.", icon: "▣" },
  { title: "Shipments", description: "Track shipments and delivery status from order to fulfillment.", icon: "▤" },
  { title: "Stores & locations", description: "Organize locations and inventory by store or site.", icon: "▥" },
  { title: "Events", description: "Schedule and manage events with your team and stakeholders.", icon: "◈" },
  { title: "Chat", description: "In-app messaging so your team can collaborate without leaving DFlow.", icon: "◉" },
  { title: "Activity & metrics", description: "See what's happening and measure progress with dashboards and reports.", icon: "▦" },
  { title: "Email", description: "Send transactional and notification emails via Resend integration.", icon: "✉" },
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
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern">
        <p className="text-red-400/80">Loading…</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-grid-pattern text-slate-200 font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-red-500/20 bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold text-red-400 text-lg tracking-tight">
            DFlow
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-red-400 transition-all btn-glow">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Operations in one place
            </h1>
            <p className="mt-5 text-lg text-slate-400 sm:text-xl">
              DFlow keeps your company aligned: tasks, employees, shipments, stores, events, and chat—all in a single workspace.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto rounded-xl bg-red-500 px-6 py-3.5 text-base font-medium text-slate-950 hover:bg-red-400 transition-all btn-glow">
                Start free
              </Link>
              <Link href="/login" className="w-full sm:w-auto rounded-xl border border-red-500/40 bg-transparent px-6 py-3.5 text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-red-500/10 py-16 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Everything your team needs</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">One platform for daily operations, visibility, and collaboration.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="glass-panel rounded-xl p-6 transition-all hover:border-red-500/40">
                  <span className="text-2xl text-red-400" aria-hidden>{f.icon}</span>
                  <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to get started?</h2>
            <p className="mt-3 text-slate-400">Create your company and invite your team in minutes.</p>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex rounded-xl bg-red-500 px-6 py-3.5 text-base font-medium text-slate-950 hover:bg-red-400 transition-all btn-glow">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-red-500/10 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">© DFlow. Business operations platform.</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-slate-500 hover:text-red-400 transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm text-slate-500 hover:text-red-400 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
