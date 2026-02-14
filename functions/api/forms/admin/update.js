import { json } from "../../../_lib/http";
import {
  ensureFormsTables,
  readSubmissionById,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  sanitizeStatus,
  updateSubmission,
} from "../../../_lib/forms-store";
import { getNotificationSettings, splitEmails } from "../../../_lib/notification-settings";
import { sendEmail, isEmailEnabled } from "../../../_lib/email";

function t(value, max = 1200) {
  return String(value || "").trim().slice(0, max);
}

function firstEmail(...values) {
  for (const v of values) {
    const s = String(v || "").trim();
    if (s && s.includes("@") && s.length <= 254) return s;
  }
  return "";
}

function requestorEmailFor(formKey, payload, createdBy) {
  if (formKey === "reimbursement_request") return firstEmail(payload?.emailAddress, payload?.email, createdBy);
  return firstEmail(payload?.email, payload?.submitterEmail, createdBy);
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["PUT"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureFormsTables(env.DB);

  const auth = await requireCouncilAdmin(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id = t(body?.id, 80);
  const status = sanitizeStatus(body?.status);
  const reviewNotes = t(body?.reviewNotes, 4000);

  if (!id) return json({ error: "Missing id." }, { status: 400 });
  if (!status) return json({ error: "Missing status." }, { status: 400 });

  const before = await readSubmissionById(env.DB, id);

  const updated = await updateSubmission(env.DB, {
    id,
    status,
    reviewNotes,
    reviewedBy: auth.session.email,
  });

  // Best-effort email notifications (never block status updates).
  try {
    const after = await readSubmissionById(env.DB, id);
    if (after.found && after.row && isEmailEnabled(env)) {
      const settings = await getNotificationSettings(env.DB);
      if (settings.enabled) {
        const formKey = String(after.row.formKey || "");
        const payload = after.row.payload || {};
        const requestor = requestorEmailFor(formKey, payload, after.row.createdBy);
        const rule = settings.rules?.[formKey] || {};

        const origin = new URL(request.url).origin;

        const statusText = [
          `Your submission status was updated.`,
          "",
          `Tracking ID: ${after.row.id}`,
          `New Status: ${String(updated.status || status)}`,
          `Reviewed By: ${auth.session.email || "Council Admin"}`,
          reviewNotes ? "" : null,
          reviewNotes ? `Notes:\n${reviewNotes}` : null,
          "",
          `View: ${origin}/#/forms/my`,
        ]
          .filter(Boolean)
          .join("\n");

        if (rule.notifyOnStatusChange && requestor) {
          await sendEmail(env, {
            to: [requestor],
            subject: `Status Updated (ID ${after.row.id})`,
            text: statusText,
          });
        }

        const statusLower = String(updated.status || status).toLowerCase();
        const looksLikeDisbursed = statusLower.includes("disburs") || statusLower.includes("paid");
        if (formKey === "reimbursement_request" && looksLikeDisbursed) {
          const treasurer = firstEmail(settings.treasurerEmail);
          const adminTo = splitEmails(rule.notifyEmails || settings.defaultNotifyEmails);

          const to = Array.from(new Set([treasurer, ...adminTo].filter(Boolean)));
          if (to.length) {
            const text = [
              `Reimbursement marked as disbursed/paid.`,
              "",
              `Tracking ID: ${after.row.id}`,
              `Requestor: ${requestor || after.row.createdBy || "Unknown"}`,
              `New Status: ${String(updated.status || status)}`,
              "",
              `Review: ${origin}/#/council-admin/submissions`,
            ].join("\n");
            await sendEmail(env, {
              to,
              subject: `Reimbursement Disbursed (ID ${after.row.id})`,
              text,
            });
          }
        }
      }
    }
  } catch {
    // ignore email failures
  }

  return json(updated);
}
