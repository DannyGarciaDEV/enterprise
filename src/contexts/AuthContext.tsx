"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  companyName?: string | null;
  companyNotFound?: boolean;
  /** When your login email matches an Employee record, tasks assigned to that employee are "yours" */
  myEmployeeId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, companyName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = (path: string, options?: RequestInit) =>
  fetch(path.startsWith("/") ? path : `/api/${path}`, { ...options, credentials: "include" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await API("/api/auth/me");
      if (res.ok) setUser(await res.json());
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await API("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || "Login failed" };
    setUser(data.user);
    return {};
  };

  const signup = async (email: string, password: string, name: string, companyName: string) => {
    const res = await API("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, companyName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || "Signup failed" };
    setUser(data.user);
    return {};
  };

  const logout = async () => {
    await API("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
