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

  const input = "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-gold";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={login} className="w-full max-w-sm space-y-5 rounded-2xl border border-gold/30 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-center text-2xl text-gold">لوحة التحكم</h1>
        <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input type="password" required placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-gold py-3 font-semibold text-black disabled:opacity-60">
          {busy ? "جارٍ الدخول..." : "دخول"}
        </button>
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
