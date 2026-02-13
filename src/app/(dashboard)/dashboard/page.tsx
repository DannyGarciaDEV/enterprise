"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const TASK_STATUSES = ["todo", "in_progress", "done"] as const;

type ActivityItem = { _id: string; title: string; userId?: { name: string }; createdAt: string };
type MyTaskItem = {
  _id: string;
  title: string;
  dueDate?: string;
  status: string;
  priority?: string;
  assigneeId?: { name: string };
};
interface DashboardData {
  employeeCount: number;
  activeShipments: number;
  storeCount: number;
  emailsThisMonth?: number;
  stores: { _id: string; name: string; location?: string }[];
  upcomingEvents: { _id: string; name: string; date: string; storeId?: { name: string } }[];
  recentShipments: { _id: string; trackingNumber?: string; status: string; destinationStoreId?: { name: string }; updatedAt: string }[];
  recentActivity?: ActivityItem[];
  myTasks?: MyTaskItem[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setData((d) =>
        d?.myTasks
          ? {
              ...d,
              myTasks: d.myTasks.filter((t) => t._id !== taskId),
            }
          : d
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--accent)]/80">Loading dashboard…</p>
      </div>
    );
  }

  const checklist = [
    { key: "companyName", done: true, label: "Add company name" },
    { key: "firstStore", done: (data?.storeCount ?? 0) > 0, label: "Add first store" },
    { key: "firstEmployee", done: (data?.employeeCount ?? 0) > 0, label: "Add employees" },
    { key: "firstShipment", done: (data?.recentShipments?.length ?? 0) > 0, label: "Start first shipment log" },
  ];

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Dashboard hero / welcome */}
      <div className="glass-panel rounded-xl px-6 py-8 border-[var(--border)]">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Welcome back, {firstName}</h1>
        <p className="text-[var(--accent)]/90 mt-1">Here’s what’s happening across your company today.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Quick actions</h2>
        <p className="text-[var(--muted)] text-sm mt-0.5">Jump into common tasks</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/tasks?add=1" className="inline-flex items-center px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 btn-glow">
          Create task
        </Link>
        <Link href="/employees?add=1" className="inline-flex items-center px-4 py-2 glass-panel border border-[var(--border)] text-[var(--accent)] text-sm font-medium rounded-lg hover:border-[var(--accent)]/50 transition-colors">
          Add employee
        </Link>
        <Link href="/shipments?add=1" className="inline-flex items-center px-4 py-2 glass-panel border border-[var(--border)] text-[var(--accent)] text-sm font-medium rounded-lg hover:border-[var(--accent)]/50 transition-colors">
          Log shipment
        </Link>
        <Link href="/stores?add=1" className="inline-flex items-center px-4 py-2 glass-panel border border-[var(--border)] text-[var(--accent)] text-sm font-medium rounded-lg hover:border-[var(--accent)]/50 transition-colors">
          Add store
        </Link>
        <Link href="/events?add=1" className="inline-flex items-center px-4 py-2 glass-panel border border-[var(--border)] text-[var(--accent)] text-sm font-medium rounded-lg hover:border-[var(--accent)]/50 transition-colors">
          Create event
        </Link>
        <Link href="/chat" className="inline-flex items-center px-4 py-2 glass-panel border border-[var(--border)] text-[var(--accent)] text-sm font-medium rounded-lg hover:border-[var(--accent)]/50 transition-colors">
          Chat
        </Link>
      </div>

      {/* Your tasks — only when we have tasks assigned to the current user (matched by email) */}
      {(data?.myTasks?.length ?? 0) > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-1">Your tasks</h2>
          <p className="text-sm text-[var(--muted)] mb-4">Tasks assigned to you. Update status or open Tasks to edit.</p>
          <ul className="space-y-2">
            {data!.myTasks!.map((t) => {
              const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
              return (
                <li key={t._id} className="flex flex-wrap items-center gap-2 py-2 border-b border-[var(--border)] last:border-0">
                  <span className="font-medium text-[var(--foreground)] flex-1 min-w-0 truncate">{t.title}</span>
                  {t.priority && t.priority !== "medium" && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${t.priority === "high" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--surface-hover)] text-[var(--muted)]"}`}>
                      {t.priority}
                    </span>
                  )}
                  {t.dueDate && (
                    <span className={`text-xs ${isOverdue ? "text-[var(--accent)] font-medium" : "text-[var(--muted)]"}`}>
                      {isOverdue ? "Overdue " : ""}{new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                    className="text-sm border border-[var(--border)] rounded-lg px-2 py-1 bg-[var(--input-bg)] text-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/50"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
          <Link href="/tasks" className="mt-3 inline-block text-sm text-[var(--accent)] font-medium hover:underline">
            View all tasks →
          </Link>
        </div>
      )}

      {/* Setup checklist */}
      <div className="glass-panel rounded-xl p-5">
        <h2 className="font-semibold text-[var(--foreground)] mb-3">Setup checklist</h2>
        <ul className="space-y-2">
          {checklist.map(({ key, done, label }) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span className={done ? "text-[var(--accent)]" : "text-[var(--muted)]"}>{done ? "✓" : "○"}</span>
              <span className={done ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5">
          <p className="text-sm text-[var(--muted)]">Total employees</p>
          <p className="text-2xl font-bold text-[var(--accent)] mt-1">{data?.employeeCount ?? 0}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-sm text-[var(--muted)]">Active shipments</p>
          <p className="text-2xl font-bold text-[var(--accent)] mt-1">{data?.activeShipments ?? 0}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-sm text-[var(--muted)]">Stores</p>
          <p className="text-2xl font-bold text-[var(--accent)] mt-1">{data?.storeCount ?? 0}</p>
        </div>
        <Link href="/metrics" className="glass-panel rounded-xl p-5 hover:border-[var(--accent)]/40 block transition-colors">
          <p className="text-sm text-[var(--muted)]">Emails this month</p>
          <p className="text-2xl font-bold text-[var(--accent)] mt-1">{data?.emailsThisMonth ?? 0}</p>
          <p className="text-xs text-[var(--accent)] mt-1">View metrics →</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">Upcoming events</h2>
          {data?.upcomingEvents?.length ? (
            <ul className="space-y-2">
              {data.upcomingEvents.map((ev) => (
                <li key={ev._id} className="text-sm flex justify-between">
                  <span className="text-[var(--foreground)]">{ev.name}</span>
                  <span className="text-[var(--muted)]">
                    {new Date(ev.date).toLocaleDateString()}
                    {ev.storeId?.name ? ` · ${ev.storeId.name}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">No upcoming events</p>
          )}
          <Link href="/events" className="mt-3 inline-block text-sm text-[var(--accent)] font-medium hover:underline">
            View all events →
          </Link>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">Recent shipments</h2>
          {data?.recentShipments?.length ? (
            <ul className="space-y-2">
              {data.recentShipments.map((s) => (
                <li key={s._id} className="text-sm flex justify-between">
                  <span className="text-[var(--foreground)]">{s.trackingNumber || "Shipment"} · {s.status}</span>
                  <span className="text-[var(--muted)]">{s.destinationStoreId?.name ?? "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">No shipments yet</p>
          )}
          <Link href="/shipments" className="mt-3 inline-block text-sm text-[var(--accent)] font-medium hover:underline">
            View all shipments →
          </Link>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="glass-panel rounded-xl p-5">
        <h2 className="font-semibold text-[var(--foreground)] mb-3">Recent activity</h2>
        {data?.recentActivity?.length ? (
          <ul className="space-y-2">
            {data.recentActivity.map((item) => (
              <li key={item._id} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                {item.userId?.name && <span className="font-medium text-[var(--foreground)]">{item.userId.name}</span>}
                <span className="text-[var(--muted)]">{item.title}</span>
                <span className="text-[var(--muted)] text-xs ml-auto">{new Date(item.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">No activity yet.</p>
        )}
        <Link href="/activity" className="mt-3 inline-block text-sm text-[var(--accent)] font-medium hover:underline">
          View all activity →
        </Link>
      </div>
    </div>
  );
}
