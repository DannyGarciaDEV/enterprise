"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        <p className="text-[var(--accent)] opacity-80">Loading…</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen text-[var(--foreground)] font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold text-[var(--accent)] text-lg tracking-tight">
            DFlow
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all btn-glow">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 pt-20 bg-grid-pattern">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
              DFlow
            </h1>
            <p className="mt-4 text-xl text-[var(--muted)] sm:text-2xl font-medium">
              Operations in one place
            </p>
            <p className="mt-6 text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              One workspace for your whole company: tasks, team, shipments, stores, events, chat, and email. Stop switching tools—run the day from DFlow.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-white hover:opacity-90 transition-all btn-glow">
                Start free
              </Link>
              <Link href="/login" className="w-full sm:w-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-base font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* What is DFlow */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 border-t border-[var(--border)] bg-[var(--background)]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">What is DFlow?</h2>
            <p className="mt-6 text-[var(--muted)] leading-relaxed text-lg">
              DFlow is a business operations platform for companies. Use it to manage daily work in one place: assign and track tasks, keep your employee roster and stores organized, log shipments, schedule events, chat with your team, and send emails—all with one login. Data is scoped by company, so every team sees only what belongs to them. Built for owners, admins, managers, and staff who want less tool-hopping and more clarity.
            </p>
            <p className="mt-4 text-[var(--accent)] font-medium">One platform. Your operations.</p>
          </div>
        </section>

        {/* Features grid - theme aware */}
        <section className="bg-grid-pattern border-t border-[var(--border)] py-16 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Everything your team needs</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[var(--muted)]">One platform for daily operations, visibility, and collaboration.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="glass-panel rounded-xl p-6 transition-all hover:border-[var(--accent)]/50">
                  <span className="text-2xl text-[var(--accent)]" aria-hidden>{f.icon}</span>
                  <h3 className="mt-3 font-semibold text-[var(--foreground)]">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-grid-pattern">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Ready to get started?</h2>
            <p className="mt-3 text-[var(--muted)]">Create your company and invite your team in minutes.</p>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-white hover:opacity-90 transition-all btn-glow">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8 px-4 sm:px-6 bg-[var(--background)]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[var(--muted)]">© DFlow. Business operations platform.</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
