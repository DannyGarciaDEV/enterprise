"use client";

import { useEffect } from "react";
import Image from "next/image";
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
    <div className="min-h-screen text-slate-200 font-sans">
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
        {/* Hero with 7.png background */}
        <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 pt-20 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/7.png" alt="" fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/90 via-[#050608]/75 to-[#050608]" />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              DFlow
            </h1>
            <p className="mt-4 text-xl text-slate-300 sm:text-2xl font-medium">
              Operations in one place
            </p>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              One workspace for your whole company: tasks, team, shipments, stores, events, chat, and email. Stop switching tools—run the day from DFlow.
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

        {/* What is DFlow — clear explanation */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/8.png" alt="" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-[#050608]/85" />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">What is DFlow?</h2>
            <p className="mt-6 text-slate-300 leading-relaxed text-lg">
              DFlow is a business operations platform for companies. Use it to manage daily work in one place: assign and track tasks, keep your employee roster and stores organized, log shipments, schedule events, chat with your team, and send emails—all with one login. Data is scoped by company, so every team sees only what belongs to them. Built for owners, admins, managers, and staff who want less tool-hopping and more clarity.
            </p>
          </div>
        </section>

        {/* Features grid */}
        <section className="bg-grid-pattern border-t border-red-500/10 py-16 sm:py-20 px-4 sm:px-6">
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

        {/* CTA */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-grid-pattern">
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

      <footer className="border-t border-red-500/10 py-8 px-4 sm:px-6 bg-[var(--background)]">
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
