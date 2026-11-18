import { NextResponse } from "next/server";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { syncMatches } from "@/lib/match-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron يرسل GET مع CRON_SECRET. زر المدير يرسل POST من جلسة مسجّلة كمسؤول.
async function isAuthorized(req: Request, allowAdminSession: boolean): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  if (!allowAdminSession) return false;
  try {
    const supabase = createSessionClient();
    const { data, error } = await supabase.rpc("is_admin");
    return !error && data === true;
  } catch {
    return false;
  }
}

async function run(req: Request, allowAdminSession: boolean) {
  if (!(await isAuthorized(req, allowAdminSession))) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  const result = await syncMatches();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET(req: Request) {
  return run(req, false);
}

export async function POST(req: Request) {
  return run(req, true);
}
