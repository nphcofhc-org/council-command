import { json } from "../../_lib/http";
import { ensureFormsTables, listSubmissions, requireAuthenticated, requireDb, requireMethods } from "../../_lib/forms-store";

function t(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function toYmd(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const time = Date.parse(raw);
  if (!Number.isFinite(time)) return "";
  const d = new Date(time);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureFormsTables(env.DB);

  const auth = await requireAuthenticated(request, env);
  if (!auth.ok) return auth.response;

  // Approved-only to keep the public (member-visible) event list clean.
  const rows = await listSubmissions(env.DB, {
    formKey: "event_submission",
    status: "Approved",
    limit: 200,
    offset: 0,
  });

  const events = rows
    .map((r) => {
      const p = r.payload || {};
      const dateISO = toYmd(p.eventDate);
      return {
        id: r.id,
        eventName: t(p.eventName, 160),
        eventDate: t(dateISO || p.eventDate, 40),
        startTime: t(p.startTime, 40),
        endTime: t(p.endTime, 40),
        location: t(p.location, 220),
        hostingOrgChapter: t(p.hostingOrgChapter, 220),
        description: t(p.description, 1200),
        eventLinkUrl: t(p.eventLinkUrl, 600),
        flyerLinks: t(p.flyerLinks, 1200),
        flyerFiles: Array.isArray(p.flyerFiles) ? p.flyerFiles : [],
        createdBy: r.createdBy || "",
        createdAt: r.createdAt,
      };
    })
    .filter((e) => e.eventName && e.eventDate)
    .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)));

  return json({ ok: true, events });
}
