"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { canViewMetrics, type Role } from "@/lib/permissions";

type DailyPoint = { date: string; count: number };

type MetricsData = {
  emails: {
    total: number;
    thisMonth: number;
    perDay?: DailyPoint[];
    recent: {
      _id: string;
      to: string;
      toName?: string;
      subject: string;
      sentAt: string;
      fromUserId?: { name: string };
    }[];
  };
  employees: number;
  shipments: number;
  events: number;
  shipmentsPerDay?: DailyPoint[];
  eventsPerDay?: DailyPoint[];
};

function formatChartDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MetricsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics", { credentials: "include" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-slate-500">Loading metrics…</p>
      </div>
    );
  }

  const role = (user?.role || "staff") as Role;
  if (user && !canViewMetrics(role)) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <p className="text-slate-600">You don’t have permission to view metrics. Only Owner and Admin can access this page.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-4 text-red-600 font-medium hover:underline">Back to Dashboard</button>
      </div>
    );
  }

  const emailsPerDay = data?.emails?.perDay ?? [];
  const shipmentsPerDay = data?.shipmentsPerDay ?? [];
  const eventsPerDay = data?.eventsPerDay ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Metrics</h1>
        <p className="text-slate-600 mt-1">Overview of your company activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Emails sent (total)</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.emails?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Emails this month</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.emails?.thisMonth ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Active employees</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.employees ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total shipments</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.shipments ?? 0}</p>
        </div>
      </div>

      {/* Emails over time */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-1">Emails sent (last 30 days)</h2>
        <p className="text-sm text-slate-500 mb-4">Daily volume of emails sent from the app</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={emailsPerDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={formatChartDate} formatter={(value: number) => [value, "Emails"]} />
              <Area type="monotone" dataKey="count" name="Emails" stroke="#dc2626" strokeWidth={2} fill="url(#colorEmails)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shipments & events side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Shipments created (last 30 days)</h2>
          <p className="text-sm text-slate-500 mb-4">New shipments logged per day</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shipmentsPerDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={formatChartDate} formatter={(value: number) => [value, "Shipments"]} />
                <Bar dataKey="count" name="Shipments" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Events scheduled (last 30 days)</h2>
          <p className="text-sm text-slate-500 mb-4">Events by date (scheduled date)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsPerDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={formatChartDate} formatter={(value: number) => [value, "Events"]} />
                <Bar dataKey="count" name="Events" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Combined overview line chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-1">Activity overview (last 30 days)</h2>
        <p className="text-sm text-slate-500 mb-4">Emails, shipments, and events in one view</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }} data={emailsPerDay.map((e, i) => ({
              date: e.date,
              emails: e.count,
              shipments: shipmentsPerDay[i]?.count ?? 0,
              events: eventsPerDay[i]?.count ?? 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={formatChartDate} />
              <Legend />
              <Line type="monotone" dataKey="emails" name="Emails" stroke="#dc2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="shipments" name="Shipments" stroke="#0f172a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="events" name="Events" stroke="#64748b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Recent emails sent</h2>
          <p className="text-sm text-slate-500">Last 20 emails sent from the app</p>
        </div>
        <div className="overflow-x-auto">
          {!data?.emails?.recent?.length ? (
            <p className="p-6 text-slate-500 text-sm">No emails sent yet. Send one from Chat when you message an employee.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">To</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Subject</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Sent by</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.emails.recent.map((email) => (
                  <tr key={email._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-800">
                      {email.toName ? `${email.toName} ` : ""}
                      <span className="text-slate-500 text-sm">{email.to}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{email.subject}</td>
                    <td className="px-4 py-3 text-slate-600">{email.fromUserId?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {new Date(email.sentAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
