"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]/50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--accent)]">DFlow</h1>
          <p className="text-[var(--muted)] mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--accent)] text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--accent)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all btn-glow"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-[var(--muted)]">
            No account? <Link href="/signup" className="text-[var(--accent)] font-medium hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
