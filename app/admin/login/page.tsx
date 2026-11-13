"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("بيانات الدخول غير صحيحة.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const input =
    "w-full rounded-xl border border-fg/15 bg-fg/[0.04] px-4 py-3 text-fg outline-none transition duration-300 focus:border-cyan focus:shadow-glow";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={login} className="glass-card w-full max-w-sm space-y-5 p-8 md:p-10">
        <div className="flex flex-col items-center gap-3">
          <img src="/brand/mark-dark.png" alt="CAPJI" className="logo-dark h-16 w-auto" />
          <img src="/brand/mark-light.png" alt="" aria-hidden className="logo-light h-16 w-auto" />
          <h1 className="text-neon text-2xl font-light">لوحة التحكم</h1>
        </div>
        <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input type="password" required placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        <button type="submit" disabled={busy} className="btn-primary w-full rounded-xl py-3 font-semibold disabled:opacity-60">
          {busy ? "جارٍ الدخول..." : "دخول"}
        </button>
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
