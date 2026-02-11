"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signup(email, password, name, companyName);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-red-500/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/50";
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-400">DFlow</h1>
          <p className="text-slate-400 mt-1">Create your company account</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Company name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Your name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-red-500 text-slate-950 font-medium rounded-lg hover:bg-red-400 disabled:opacity-50 transition-all btn-glow">
            {loading ? "Creating account…" : "Sign up"}
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account? <Link href="/login" className="text-red-400 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
