"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-black/70">Sign in to manage products.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}