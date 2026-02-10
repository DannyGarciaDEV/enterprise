"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Event {
  _id: string;
  name: string;
  location?: string;
  date: string;
  storeId?: { _id: string; name: string };
  staffIds?: { _id: string; name: string }[];
  notes?: string;
}

interface Store {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  name: string;
}

export default function EventsPage() {
  const [list, setList] = useState<Event[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    date: "",
    storeId: "",
    staffIds: [] as string[],
    notes: "",
  });
  const searchParams = useSearchParams();

  const fetchData = () => {
    fetch("/api/events", { credentials: "include" }).then((r) => r.json()).then(setList).finally(() => setLoading(false));
    fetch("/api/stores", { credentials: "include" }).then((r) => r.json()).then(setStores);
    fetch("/api/employees", { credentials: "include" }).then((r) => r.json()).then(setEmployees);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get("add") === "1") setShowForm(true);
  }, [searchParams]);

  const openEdit = (ev: Event) => {
    setEditing(ev);
    setForm({
      name: ev.name,
      location: ev.location ?? "",
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "",
      storeId: ev.storeId?._id ?? "",
      staffIds: ev.staffIds?.map((s) => s._id) ?? [],
      notes: ev.notes ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", location: "", date: "", storeId: "", staffIds: [], notes: "" });
  };

  const toggleStaff = (id: string) => {
    setForm((f) => ({
      ...f,
      staffIds: f.staffIds.includes(id) ? f.staffIds.filter((x) => x !== id) : [...f.staffIds, id],
    }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      storeId: form.storeId || undefined,
      date: form.date ? new Date(form.date).toISOString() : undefined,
    };
    const url = editing ? `/api/events/${editing._id}` : "/api/events";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
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
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Events</h1>
          <p className="text-slate-600 mt-1">Track events and staff assignments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
        >
          Create event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? "Edit event" : "New event"}</h2>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date & time *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store</label>
              <select
                value={form.storeId}
                onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">—</option>
                {stores.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Staff assigned</label>
              <div className="flex flex-wrap gap-2">
                {employees.map((emp) => (
                  <label key={emp._id} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.staffIds.includes(emp._id)}
                      onChange={() => toggleStaff(emp._id)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700">{emp.name}</span>
                  </label>
                ))}
                {employees.length === 0 && <span className="text-sm text-slate-500">No employees yet</span>}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows={2}
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                {editing ? "Save" : "Create"}
              </button>
              <button type="button" onClick={closeForm} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : list.length === 0 ? (
          <p className="p-6 text-slate-500">No events yet. Create your first event above.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Name</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Date</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Location</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Store</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {list.map((ev) => (
                <tr key={ev._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800 font-medium">{ev.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(ev.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ev.location ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{ev.storeId?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(ev)} className="text-red-600 text-sm hover:underline mr-2">Edit</button>
                    <button onClick={() => del(ev._id)} className="text-red-600 text-sm hover:underline">Delete</button>
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
