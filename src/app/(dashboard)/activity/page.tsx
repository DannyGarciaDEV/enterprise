"use client";

import { useEffect, useState } from "react";

type ActivityItem = {
  _id: string;
  type: string;
  title: string;
  userId?: { name: string };
  createdAt: string;
};

export default function ActivityPage() {
  const [list, setList] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity", { credentials: "include" })
      .then((r) => r.json())
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Activity</h1>
        <p className="text-slate-600 mt-1">Recent activity across your company</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : list.length === 0 ? (
          <p className="p-6 text-slate-500">No activity yet. Create shipments, add employees, or create events to see the feed.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((item) => (
              <li key={item._id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-medium">
                  {item.userId?.name?.charAt(0) || "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800">
                    {item.userId?.name && <span className="font-medium">{item.userId.name}</span>}
                    {item.userId?.name && " "}
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
