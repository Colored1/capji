import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Inquiry = {
  full_name: string;
  contact: string;
  service_type: string;
  details: string;
  budget: string;
};

type ChannelResult = "sent" | "skipped" | "failed";

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

async function sendEmail(p: Inquiry): Promise<ChannelResult> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_TO_EMAIL;
  const from = process.env.NOTIFY_FROM_EMAIL;
  if (!key || !to || !from) return "skipped";

  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial;background:#0a0a0e;color:#f5f5f7;padding:24px">
      <h2 style="color:#22d3ee">طلب جديد من الموقع</h2>
      <p><b>الاسم:</b> ${esc(p.full_name)}</p>
      <p><b>التواصل:</b> ${esc(p.contact)}</p>
      <p><b>نوع الخدمة:</b> ${esc(p.service_type)}</p>
      <p><b>الميزانية:</b> ${esc(p.budget || "غير محددة")}</p>
      <p><b>التفاصيل:</b><br/>${esc(p.details).replace(/\n/g, "<br/>")}</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: `طلب جديد: ${p.service_type}`, html }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

async function sendWhatsApp(p: Inquiry): Promise<ChannelResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_NOTIFY_TO;
  if (!token || !phoneId || !to) return "skipped";

  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const summary = `${p.full_name} | ${p.service_type} | ${p.details}`.slice(0, 900);

  // إذا كان لديك قالب معتمد في Meta نستخدمه (يعمل دائماً)، وإلا نرسل نصاً (يعمل ضمن نافذة 24 ساعة فقط)
  const message = template
    ? {
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "ar" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: p.full_name.slice(0, 60) || "-" },
                { type: "text", text: p.service_type.slice(0, 60) || "-" },
                { type: "text", text: summary.slice(0, 900) || "-" },
              ],
            },
          ],
        },
      }
    : { type: "text", text: { body: `طلب جديد من الموقع\n${summary}` } };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, ...message }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

export async function POST(req: Request) {
  // نقبل الطلبات من نفس الموقع فقط
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const p: Inquiry = {
    full_name: clean(body.full_name, 120),
    contact: clean(body.contact, 150),
    service_type: clean(body.service_type, 120),
    details: clean(body.details, 2000),
    budget: clean(body.budget, 120),
  };
  if (!p.full_name || !p.contact || !p.service_type || !p.details) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const [email, whatsapp] = await Promise.all([sendEmail(p), sendWhatsApp(p)]);
  return NextResponse.json({ ok: true, email, whatsapp });
}
