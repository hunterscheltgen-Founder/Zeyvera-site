const MAX_BODY = 12000;
const MAX_FIELD = 1800;
const allowed = ["name","email","company","role","website","team","industry","pain","impact","workflow","outcome","urgency","next"];
const clean = (value, max = 500) => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);
const escapeHtml = (value) => clean(value, MAX_FIELD).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try { if (new URL(origin).origin !== new URL(request.url).origin) return json({ error: "Invalid request origin." }, 403); }
    catch { return json({ error: "Invalid request origin." }, 403); }
  }
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) return json({ error: "Expected JSON submission." }, 415);
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY) return json({ error: "Submission is too large." }, 413);
  let body;
  try { const raw = await request.text(); if (raw.length > MAX_BODY) return json({ error: "Submission is too large." }, 413); body = JSON.parse(raw); }
  catch { return json({ error: "Please submit a valid form." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid submission." }, 400);
  // Honeypot: respond generically so automated spam does not learn the field name.
  if (clean(body.company_fax, 200)) return json({ ok: true });
  const data = {};
  for (const key of allowed) data[key] = clean(body[key], key === "impact" || key === "outcome" ? MAX_FIELD : 500);
  const email = data.email.toLowerCase();
  if (!data.name || !data.company || !data.pain || !data.impact || body.consent !== true) return json({ error: "Please complete all required fields and consent." }, 400);
  if (data.name.length > 100 || data.company.length > 140 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json({ error: "Please check your name, company, and email address." }, 400);
  if (data.website) {
    try { const u = new URL(data.website); if (!["http:","https:"].includes(u.protocol)) throw new Error(); }
    catch { return json({ error: "Please enter a valid website URL including https://." }, 400); }
  }
  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL || !env.FROM_EMAIL) {
    console.error("Diagnostic intake unavailable: email provider configuration is missing.");
    return json({ error: "The intake service is not configured yet. Please email contact@zeyvera.ca instead." }, 503);
  }
  const labels = { name:"Name", email:"Work email", company:"Company", role:"Role", website:"Website", team:"Team size", industry:"Industry", pain:"Main friction", impact:"Impact", workflow:"Current tools/workflow", outcome:"Desired outcome", urgency:"Timing", next:"Preferred next step" };
  const text = Object.entries(data).filter(([key,value]) => value && labels[key]).map(([key,value]) => labels[key] + ":\n" + value).join("\n\n");
  const html = Object.entries(data).filter(([key,value]) => value && labels[key]).map(([key,value]) => "<p><strong>" + labels[key] + "</strong><br>" + escapeHtml(value).replace(/\n/g,"<br>") + "</p>").join("");
  let result;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.CONTACT_EMAIL],
        reply_to: email,
        subject: "New Zeyvera diagnostic request — " + data.company,
        text: "New diagnostic request\n\n" + text + "\n\nConsent to respond: yes",
        html: "<h2>New Zeyvera diagnostic request</h2>" + html + "<p><strong>Consent to respond:</strong> yes</p>"
      })
    });
    result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend submission failed", response.status, result?.name || "provider_error");
      return json({ error: "We couldn't deliver your request right now. Please try again or email contact@zeyvera.ca." }, 502);
    }
  } catch (error) {
    console.error("Email provider request failed", error?.name || "network_error");
    return json({ error: "We couldn't deliver your request right now. Please try again or email contact@zeyvera.ca." }, 502);
  }
  return json({ ok: true });
}
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
