"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Employee = {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  status: string;
  storeId?: { _id: string; name: string };
};

type Store = { _id: string; name: string };

export default function EmployeesPage() {
  const [list, setList] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", storeId: "", status: "active", notes: "" });
  const sp = useSearchParams();

  const load = () => {
    fetch("/api/employees", { credentials: "include" }).then((r) => r.json()).then(setList).finally(() => setLoading(false));
    fetch("/api/stores", { credentials: "include" }).then((r) => r.json()).then(setStores);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (sp.get("add") === "1") setShowForm(true);
  }, [sp]);

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      name: e.name,
      email: e.email ?? "",
      phone: "",
      role: e.role ?? "",
      storeId: e.storeId?._id ?? "",
      status: e.status ?? "active",
      notes: "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", email: "", phone: "", role: "", storeId: "", status: "active", notes: "" });
  };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const url = editing ? `/api/employees/${editing._id}` : "/api/employees";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, storeId: form.storeId || undefined }),
    });
    if (res.ok) {
      load();
      closeForm();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-600 mt-1">Manage your team</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
            Add employee
          </button>
          {list.some((e) => e.email) && (
            <a
              href={`mailto:${list.filter((e) => e.email).map((e) => e.email).join(",")}`}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Email team
            </a>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? "Edit employee" : "New employee"}</h2>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store</label>
              <select value={form.storeId} onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {stores.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
        {loading ? <p className="p-6 text-slate-500">Loading…</p> : list.length === 0 ? <p className="p-6 text-slate-500">No employees yet.</p> : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Name</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Email</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Role</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Store</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Status</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {list.map((emp) => (
                <tr key={emp._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800 font-medium">{emp.name}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.role ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.storeId?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{emp.status}</td>
                  <td className="px-4 py-3">
                    {emp.email && (
                      <a href={`mailto:${emp.email}`} className="text-red-600 text-sm hover:underline mr-2">Email</a>
                    )}
                    <button onClick={() => openEdit(emp)} className="text-red-600 text-sm hover:underline mr-2">Edit</button>
                    <button onClick={() => del(emp._id)} className="text-red-600 text-sm hover:underline">Delete</button>
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
