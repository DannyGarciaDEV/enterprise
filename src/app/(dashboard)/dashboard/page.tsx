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
        <p className="text-slate-500">Loading dashboard…</p>
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
      <div className="bg-red-600 rounded-xl px-6 py-8 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-red-100 mt-1">Here’s what’s happening across your company today.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800">Quick actions</h2>
        <p className="text-slate-600 text-sm mt-0.5">Jump into common tasks</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/tasks?add=1"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
        >
          Create task
        </Link>
        <Link
          href="/employees?add=1"
          className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
        >
          Add employee
        </Link>
        <Link
          href="/shipments?add=1"
          className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
        >
          Log shipment
        </Link>
        <Link
          href="/stores?add=1"
          className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
        >
          Add store
        </Link>
        <Link
          href="/events?add=1"
          className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
        >
          Create event
        </Link>
        <Link
          href="/chat"
          className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
        >
          Chat
        </Link>
      </div>

      {/* Your tasks — only when we have tasks assigned to the current user (matched by email) */}
      {(data?.myTasks?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Your tasks</h2>
          <p className="text-sm text-slate-500 mb-4">Tasks assigned to you. Update status or open Tasks to edit.</p>
          <ul className="space-y-2">
            {data!.myTasks!.map((t) => {
              const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
              return (
                <li key={t._id} className="flex flex-wrap items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-800 flex-1 min-w-0 truncate">{t.title}</span>
                  {t.priority && t.priority !== "medium" && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${t.priority === "high" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"}`}>
                      {t.priority}
                    </span>
                  )}
                  {t.dueDate && (
                    <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                      {isOverdue ? "Overdue " : ""}{new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
          <Link href="/tasks" className="mt-3 inline-block text-sm text-red-600 font-medium hover:underline">
            View all tasks →
          </Link>
        </div>
      )}

      {/* Setup checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Setup checklist</h2>
        <ul className="space-y-2">
          {checklist.map(({ key, done, label }) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span className={done ? "text-red-600" : "text-slate-400"}>
                {done ? "✓" : "○"}
              </span>
              <span className={done ? "text-slate-600" : "text-slate-500"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total employees</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.employeeCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Active shipments</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.activeShipments ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Stores</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.storeCount ?? 0}</p>
        </div>
        <Link href="/metrics" className="bg-white rounded-xl border border-slate-200 p-5 hover:border-red-200 block">
          <p className="text-sm text-slate-500">Emails this month</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.emailsThisMonth ?? 0}</p>
          <p className="text-xs text-red-600 mt-1">View metrics →</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Upcoming events</h2>
          {data?.upcomingEvents?.length ? (
            <ul className="space-y-2">
              {data.upcomingEvents.map((ev) => (
                <li key={ev._id} className="text-sm flex justify-between">
                  <span className="text-slate-700">{ev.name}</span>
                  <span className="text-slate-500">
                    {new Date(ev.date).toLocaleDateString()}
                    {ev.storeId?.name ? ` · ${ev.storeId.name}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No upcoming events</p>
          )}
          <Link href="/events" className="mt-3 inline-block text-sm text-red-600 font-medium hover:underline">
            View all events →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Recent shipments</h2>
          {data?.recentShipments?.length ? (
            <ul className="space-y-2">
              {data.recentShipments.map((s) => (
                <li key={s._id} className="text-sm flex justify-between">
                  <span className="text-slate-700">{s.trackingNumber || "Shipment"} · {s.status}</span>
                  <span className="text-slate-500">{s.destinationStoreId?.name ?? "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No shipments yet</p>
          )}
          <Link href="/shipments" className="mt-3 inline-block text-sm text-red-600 font-medium hover:underline">
            View all shipments →
          </Link>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Recent activity</h2>
        {data?.recentActivity?.length ? (
          <ul className="space-y-2">
            {data.recentActivity.map((item) => (
              <li key={item._id} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                {item.userId?.name && <span className="font-medium text-slate-700">{item.userId.name}</span>}
                <span className="text-slate-600">{item.title}</span>
                <span className="text-slate-400 text-xs ml-auto">{new Date(item.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No activity yet.</p>
        )}
        <Link href="/activity" className="mt-3 inline-block text-sm text-red-600 font-medium hover:underline">
          View all activity →
        </Link>
      </div>
    </div>
  );
}
