"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STATUSES = ["created", "shipped", "in_transit", "delivered", "received"];

interface Shipment {
  _id: string;
  trackingNumber?: string;
  carrier?: string;
  vendor?: string;
  destinationStoreId?: { _id: string; name: string };
  status: string;
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

export default function ShipmentsPage() {
  const [list, setList] = useState<Shipment[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [form, setForm] = useState({
    trackingNumber: "",
    carrier: "",
    vendor: "",
    purchaseOrderNumber: "",
    destinationStoreId: "",
    status: "created",
    dateReceived: "",
    receivedById: "",
    notes: "",
  });
  const searchParams = useSearchParams();

  const fetchData = () => {
    fetch("/api/shipments", { credentials: "include" }).then((r) => r.json()).then(setList).finally(() => setLoading(false));
    fetch("/api/stores", { credentials: "include" }).then((r) => r.json()).then(setStores);
    fetch("/api/employees", { credentials: "include" }).then((r) => r.json()).then(setEmployees);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get("add") === "1") setShowForm(true);
  }, [searchParams]);

  const openEdit = (s: Shipment) => {
    setEditing(s);
    setForm({
      trackingNumber: s.trackingNumber ?? "",
      carrier: s.carrier ?? "",
      vendor: s.vendor ?? "",
      purchaseOrderNumber: "",
      destinationStoreId: s.destinationStoreId?._id ?? "",
      status: s.status,
      dateReceived: "",
      receivedById: "",
      notes: s.notes ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      trackingNumber: "",
      carrier: "",
      vendor: "",
      purchaseOrderNumber: "",
      destinationStoreId: "",
      status: "created",
      dateReceived: "",
      receivedById: "",
      notes: "",
    });
  };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const body = {
      ...form,
      destinationStoreId: form.destinationStoreId || undefined,
      dateReceived: form.dateReceived || undefined,
      receivedById: form.receivedById || undefined,
    };
    const url = editing ? `/api/shipments/${editing._id}` : "/api/shipments";
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
    if (!confirm("Delete this shipment?")) return;
    const res = await fetch(`/api/shipments/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shipments</h1>
          <p className="text-slate-600 mt-1">Track and log shipments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
          Log shipment
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? "Edit shipment" : "New shipment"}</h2>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tracking number</label>
              <input value={form.trackingNumber} onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrier</label>
              <input value={form.carrier} onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
              <input value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination store</label>
              <select value={form.destinationStoreId} onChange={(e) => setForm((f) => ({ ...f, destinationStoreId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {stores.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                {STATUSES.map((st) => <option key={st} value={st}>{st.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date received</label>
              <input type="date" value={form.dateReceived} onChange={(e) => setForm((f) => ({ ...f, dateReceived: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Received by</label>
              <select value={form.receivedById} onChange={(e) => setForm((f) => ({ ...f, receivedById: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editing ? "Save" : "Add"}</button>
              <button type="button" onClick={closeForm} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? <p className="p-6 text-slate-500">Loading…</p> : list.length === 0 ? <p className="p-6 text-slate-500">No shipments yet.</p> : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Tracking</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Carrier</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Destination</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Status</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800 font-medium">{s.trackingNumber || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.carrier ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.destinationStoreId?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.status.replace("_", " ")}</td>
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
