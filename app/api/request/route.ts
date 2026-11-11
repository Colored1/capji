import { NextResponse } from "next/server";

// نقطة استقبال طلبات الخدمة.
// ملاحظة: الطلبات لا تُحفظ بعد. عند ربط Supabase نضيف الحفظ هنا.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.contact || !body.message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  console.log("service-request", { name: body.name, contact: body.contact });
  return NextResponse.json({ ok: true });
}
