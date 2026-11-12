"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function logout() {
    await createClient().auth.signOut();
    window.location.href = "/admin/login";
  }
  return (
    <button onClick={logout} className="w-full rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-red-400 hover:text-red-400">
      تسجيل الخروج
    </button>
  );
}
