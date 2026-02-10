"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canManageSettings, type Role } from "@/lib/permissions";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Seed from auth user when available (defer to avoid setState-in-effect warning)
  useEffect(() => {
    if (user?.companyName) queueMicrotask(() => setName(user.companyName));
  }, [user?.companyName]);

  useEffect(() => {
    fetch("/api/company", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) setName(data.name);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      await refreshUser();
    } else {
      setError(data.error || "Failed to update");
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const role = (user.role || "staff") as Role;
  if (!canManageSettings(role)) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <p className="text-slate-600">You don’t have permission to manage company settings. Only Owner and Admin can access this page.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-4 text-red-600 font-medium hover:underline">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your company details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Company name</h2>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">Company name updated.</div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your company name"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
