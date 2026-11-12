"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const enabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function GoogleAuthButton() {
  if (!enabled) return null;
  return <Inner />;
}

function Inner() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setEmail(null);
  }

  const btn = "rounded-full border border-gold/50 px-4 py-1.5 text-xs text-gold transition hover:bg-gold hover:text-black";

  return email ? (
    <button onClick={logout} className={btn}>خروج</button>
  ) : (
    <button onClick={login} className={btn}>دخول بجوجل</button>
  );
}
