"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url" | "number" | "select" | "file" | "files";
  accept?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
};

type Row = { id: string; created_at?: string } & Record<string, any>;

type Props = {
  table: string;
  title: string;
  fields: Field[];
  columns: { key: string; label: string }[];
};

const input = "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-gold";

export default function CrudManager({ table, title, fields, columns }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) setMsg(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  function openNew() {
    setEditing(null);
    setForm({});
    setMsg("");
    setOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setForm({ ...row });
    setMsg("");
    setOpen(true);
  }

  async function uploadFile(field: Field, files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setMsg("");
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${table}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) {
        setMsg(`فشل رفع الملف: ${error.message}`);
        setBusy(false);
        return;
      }
      urls.push(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
    }
    if (field.type === "files") {
      const existing = (form[field.key] || "").split("\n").filter(Boolean);
      setForm((f) => ({ ...f, [field.key]: [...existing, ...urls].join("\n") }));
    } else {
      setForm((f) => ({ ...f, [field.key]: urls[0] }));
    }
    setBusy(false);
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const payload: Record<string, any> = {};
    for (const f of fields) {
      const v = form[f.key];
      payload[f.key] = v === undefined || v === "" ? null : f.type === "number" ? Number(v) : v;
    }
    const res = editing
      ? await supabase.from(table).update(payload).eq("id", editing.id)
      : await supabase.from(table).insert(payload);
    setBusy(false);
    if (res.error) {
      setMsg(res.error.message);
      return;
    }
    setOpen(false);
    load();
  }

  async function remove(row: Row) {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) setMsg(error.message);
    else load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl text-gold">{title}</h1>
        <button onClick={openNew} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">
          + إضافة جديد
        </button>
      </div>

      {msg && <p className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">{msg}</p>}

      {loading ? (
        <p className="text-white/50">جارٍ التحميل...</p>
      ) : rows.length === 0 ? (
        <p className="text-white/50">لا توجد عناصر بعد.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                {columns.map((c) => <th key={c.key} className="px-4 py-3 font-normal">{c.label}</th>)}
                <th className="px-4 py-3 font-normal">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  {columns.map((c) => (
                    <td key={c.key} className="max-w-xs truncate px-4 py-3 text-white/80">{String(r[c.key] ?? "—")}</td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3">
                    <button onClick={() => openEdit(r)} className="ml-3 text-gold hover:underline">تعديل</button>
                    <button onClick={() => remove(r)} className="text-red-400 hover:underline">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-gold/30 bg-[#111] p-6">
            <h2 className="text-xl text-gold">{editing ? "تعديل" : "إضافة"}</h2>

            {fields.map((f) => (
              <label key={f.key} className="block space-y-2">
                <span className="text-sm text-white/70">{f.label}{f.required ? " *" : ""}</span>

                {f.type === "textarea" ? (
                  <textarea rows={4} required={f.required} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className={input} />
                ) : f.type === "select" ? (
                  <select required={f.required} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className={input}>
                    <option value="">—</option>
                    {f.options?.map((o) => <option key={o} value={o} className="bg-black">{o}</option>)}
                  </select>
                ) : f.type === "file" || f.type === "files" ? (
                  <div className="space-y-2">
                    <input type="file" accept={f.accept} multiple={f.type === "files"} onChange={(e) => uploadFile(f, e.target.files)} className="text-sm text-white/70" />
                    {f.type === "files" ? (
                      <textarea rows={3} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder="رابط في كل سطر" className={input} />
                    ) : (
                      <input type="url" value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder="الرابط يتعبأ تلقائياً بعد الرفع" className={input} />
                    )}
                  </div>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                    required={f.required}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className={input}
                  />
                )}
                {f.hint && <span className="block text-xs text-white/40">{f.hint}</span>}
              </label>
            ))}

            {busy && <p className="text-sm text-gold">جارٍ الرفع أو الحفظ...</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70">إلغاء</button>
              <button type="submit" disabled={busy} className="rounded-full bg-gold px-6 py-2 text-sm font-semibold text-black disabled:opacity-60">حفظ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
