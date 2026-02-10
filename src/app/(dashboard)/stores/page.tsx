"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Store {
  _id: string;
  name: string;
  location?: string;
  managerId?: { _id: string; name: string };
}

interface Employee {
  _id: string;
  name: string;
}

export default function StoresPage() {
  const [list, setList] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState({ name: "", location: "", managerId: "" });
  const searchParams = useSearchParams();

  const fetchData = () => {
    fetch("/api/stores", { credentials: "include" }).then((r) => r.json()).then(setList).finally(() => setLoading(false));
    fetch("/api/employees", { credentials: "include" }).then((r) => r.json()).then(setEmployees);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get("add") === "1") setShowForm(true);
  }, [searchParams]);

  const openEdit = (s: Store) => {
    setEditing(s);
    setForm({ name: s.name, location: s.location ?? "", managerId: s.managerId?._id ?? "" });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", location: "", managerId: "" });
  };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const body = { ...form, managerId: form.managerId || undefined };
    const url = editing ? `/api/stores/${editing._id}` : "/api/stores";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      fetchData();
      closeForm();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this store?")) return;
    const res = await fetch(`/api/stores/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stores</h1>
          <p className="text-slate-600 mt-1">Manage your locations</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
          Add store
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? "Edit store" : "New store"}</h2>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Manager</label>
              <select value={form.managerId} onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editing ? "Save" : "Add"}</button>
              <button type="button" onClick={closeForm} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? <p className="p-6 text-slate-500">Loading…</p> : list.length === 0 ? <p className="p-6 text-slate-500">No stores yet.</p> : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Name</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Location</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Manager</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.location ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.managerId?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(s)} className="text-red-600 text-sm hover:underline mr-2">Edit</button>
                    <button onClick={() => del(s._id)} className="text-red-600 text-sm hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
