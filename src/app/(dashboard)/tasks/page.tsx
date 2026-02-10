"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const STATUSES = ["todo", "in_progress", "done"];

const PRIORITIES = ["high", "medium", "low"] as const;

type Task = {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  priority?: string;
  assigneeId?: { _id: string; name: string };
  createdById?: { name: string };
};

type Employee = { _id: string; name: string };

export default function TasksPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    dueDate: "",
    status: "todo",
    priority: "medium",
  });
  const sp = useSearchParams();

  const filteredList =
    filter === "mine" && user?.myEmployeeId
      ? list.filter((t) => t.assigneeId?._id === user.myEmployeeId)
      : list;

  const load = () => {
    fetch("/api/tasks", { credentials: "include" }).then((r) => r.json()).then(setList).finally(() => setLoading(false));
    fetch("/api/employees", { credentials: "include" }).then((r) => r.json()).then(setEmployees);
  };

  useEffect(() => {
    load();
  }, []);

  const showFormPanel = showForm || sp.get("add") === "1";

  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description ?? "",
      assigneeId: t.assigneeId?._id ?? "",
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : "",
      status: t.status,
      priority: t.priority ?? "medium",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", description: "", assigneeId: "", dueDate: "", status: "todo", priority: "medium" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/tasks/${editing._id}` : "/api/tasks";
    const body = {
      ...form,
      assigneeId: form.assigneeId || undefined,
      dueDate: form.dueDate || undefined,
    };
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      load();
      closeForm();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) load();
  };

  const updateStatus = async (taskId: string, status: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          <p className="text-slate-600 mt-1">Assign and track work (e.g. Check shipment, Prepare event booth, Train new staff)</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.myEmployeeId && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "mine")}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
            >
              <option value="all">All tasks</option>
              <option value="mine">Assigned to me</option>
            </select>
          )}
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
            Create task
          </button>
        </div>
      </div>

      {showFormPanel && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? "Edit task" : "Create task"}</h2>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Check shipment, Prepare event booth"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign to</label>
              <select
                value={form.assigneeId}
                onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">—</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editing ? "Save" : "Create"}</button>
              <button type="button" onClick={closeForm} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : filteredList.length === 0 ? (
          <p className="p-6 text-slate-500">
            {filter === "mine" ? "No tasks assigned to you." : "No tasks yet. Create one to get started."}
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Task</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Priority</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Assigned to</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Due date</th>
                <th className="text-left text-sm font-medium text-slate-600 px-4 py-3">Status</th>
                <th className="w-40" />
              </tr>
            </thead>
            <tbody>
              {filteredList.map((t) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
                return (
                  <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{t.title}</p>
                      {t.description && <p className="text-sm text-slate-500 truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                        t.priority === "high" ? "bg-red-100 text-red-800" : t.priority === "low" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800"
                      }`}>
                        {t.priority ?? "medium"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.assigneeId?.name ?? "—"}</td>
                    <td className={`px-4 py-3 ${isOverdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      {isOverdue && t.dueDate && (
                        <span className="ml-1 text-xs">(overdue)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t._id, e.target.value)}
                        className={`text-sm border rounded-lg px-2 py-1 bg-white ${
                          t.status === "done" ? "text-green-700 border-green-200" : t.status === "in_progress" ? "text-amber-700 border-amber-200" : "border-slate-300 text-slate-700"
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(t)} className="text-red-600 text-sm hover:underline mr-2">Edit</button>
                      <button onClick={() => del(t._id)} className="text-red-600 text-sm hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
