"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const input = "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-gold";

export default function SettingsForm() {
  const supabase = useMemo(() => createClient(), []);
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [social, setSocial] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return setMsg(error.message);
        setAbout(data?.about ?? "");
        setSkills(data?.skills ?? "");
        setSocial(data?.social_links ?? "");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, about, skills, social_links: social });
    setSaving(false);
    setMsg(error ? error.message : "تم حفظ الإعدادات.");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl text-gold">الإعدادات والملف الشخصي</h1>
      <form onSubmit={save} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm text-white/70">النبذة التعريفية</span>
          <textarea rows={6} value={about} onChange={(e) => setAbout(e.target.value)} className={input} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-white/70">المهارات (افصل بينها بفاصلة)</span>
          <textarea rows={3} value={skills} onChange={(e) => setSkills(e.target.value)} className={input} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-white/70">روابط التواصل: الاسم|الرابط، سطر لكل رابط</span>
          <textarea rows={4} value={social} onChange={(e) => setSocial(e.target.value)} placeholder="Instagram|https://instagram.com/..." className={input} />
        </label>
        <button type="submit" disabled={saving} className="rounded-full bg-gold px-6 py-2.5 font-semibold text-black disabled:opacity-60">
          {saving ? "جارٍ الحفظ..." : "حفظ"}
        </button>
        {msg && <p className="text-sm text-white/70">{msg}</p>}
      </form>
    </div>
  );
}
