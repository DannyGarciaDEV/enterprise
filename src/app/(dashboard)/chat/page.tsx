"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

type User = { _id: string; name: string; email: string; role?: string };
type Employee = { _id: string; name: string; email?: string };
type Message = {
  _id: string;
  fromUserId: { _id: string; name: string };
  toUserId: { _id: string; name: string };
  content: string;
  createdAt: string;
};

type Selected = { type: "user"; id: string } | { type: "employee"; id: string } | null;

function EmployeeEmailCompose({ employee }: { employee: Employee | undefined }) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.email || !subject.trim() || sending) return;
    setError("");
    setSending(true);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        to: employee.email,
        subject: subject.trim(),
        content: content.trim() || "(No message body)",
        toName: employee.name,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (res.ok) {
      setSent(true);
      setSubject("");
      setContent("");
    } else {
      setError(data.error || "Failed to send email");
    }
  };

  if (!employee) return null;
  if (!employee.email) {
    return (
      <>
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <p className="font-medium text-slate-800">{employee.name}</p>
          <p className="text-xs text-slate-500">No email on file</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-600 text-sm mb-4">Add an email for this employee on the Employees page to send them messages.</p>
          <Link href="/employees" className="text-red-600 text-sm font-medium hover:underline">
            Go to Employees →
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <p className="font-medium text-slate-800">To: {employee.name}</p>
        <p className="text-xs text-slate-500">{employee.email}</p>
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-auto">
        {sent ? (
          <div className="p-6 text-center">
            <p className="text-red-600 font-medium mb-1">Email sent</p>
            <p className="text-slate-600 text-sm mb-4">Your message was delivered to {employee.email}.</p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-red-600 text-sm font-medium hover:underline"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 flex-1">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your message…"
                className="w-full flex-1 min-h-[200px] px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={8}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending || !subject.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send email"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Selected>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    fetch("/api/company/users", { credentials: "include" }).then((r) => r.json()).then(setUsers);
    fetch("/api/employees", { credentials: "include" }).then((r) => r.json()).then(setEmployees);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedUserId = selected?.type === "user" ? selected.id : null;
  useEffect(() => {
    if (!selectedUserId) {
      queueMicrotask(() => setMessages([]));
      return;
    }
    const load = () => {
      fetch(`/api/chat?with=${selectedUserId}`, { credentials: "include" })
        .then((r) => r.json())
        .then(setMessages);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected?.type !== "user" || !selectedUserId || !input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ toUserId: selectedUserId, content: input.trim() }),
    });
    setSending(false);
    setInput("");
    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  const selectedUser = selected?.type === "user" ? users.find((u) => u._id === selected.id) : null;
  const selectedEmployee = selected?.type === "employee" ? employees.find((e) => e._id === selected.id) : null;
  const myId = (user as { id?: string; _id?: string })?.id ?? (user as { _id?: string })?._id;

  const hasAnyone = users.length > 0 || employees.length > 0;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Chat</h1>
        <p className="text-slate-600 text-sm mt-1">Message your team or send an email to employees</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex min-h-0">
        <aside className="w-56 border-r border-slate-200 flex flex-col">
          {users.length > 0 && (
            <>
              <div className="p-2 border-b border-slate-200 bg-slate-50">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Team (with accounts)</p>
              </div>
              <div className="p-1">
                {users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => setSelected({ type: "user", id: u._id })}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                      selected?.type === "user" && selected.id === u._id ? "bg-red-50 text-red-700" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="p-2 border-b border-slate-200 bg-slate-50">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employees</p>
          </div>
          <div className="flex-1 overflow-auto p-1">
            {employees.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">No employees yet. Add people in the Employees page to message or email them.</p>
            ) : (
              employees.map((e) => (
                <button
                  key={e._id}
                  onClick={() => setSelected({ type: "employee", id: e._id })}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                    selected?.type === "employee" && selected.id === e._id ? "bg-red-50 text-red-700" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {e.name}
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm px-4 text-center">
              {hasAnyone ? "Select someone from the list to chat or send an email." : "Add employees in the Employees page, or invite team members with accounts to chat here."}
            </div>
          ) : selected.type === "employee" ? (
            <EmployeeEmailCompose employee={selectedEmployee ?? undefined} />
          ) : selectedUser ? (
            <>
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <p className="font-medium text-slate-800">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMe = String(m.fromUserId._id) === String(myId);
                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          isMe ? "bg-red-600 text-white" : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-slate-500 mb-0.5">{m.fromUserId.name}</p>
                        )}
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-red-200" : "text-slate-400"}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
