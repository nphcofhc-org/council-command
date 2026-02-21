import { json } from "../../_lib/http";
import {
  ensureFormsTables,
  insertSubmission,
  requireAuthenticated,
  requireDb,
  requireMethods,
  sanitizeFormKey,
} from "../../_lib/forms-store";
import { getNotificationSettings, splitEmails } from "../../_lib/notification-settings";
import { sendEmail, isEmailEnabled } from "../../_lib/email";

function formLabel(formKey) {
  if (formKey === "budget_submission") return "Budget Submission";
  if (formKey === "reimbursement_request") return "Reimbursement Request";
  if (formKey === "social_media_request") return "Social Media Intake";
  if (formKey === "committee_report") return "Committee Report";
  if (formKey === "event_submission") return "Event Submission";
  if (formKey === "event_proposal_budget_request") return "Event Proposal & Budget Request";
  if (formKey === "event_post_report_financial_reconciliation") return "Event Post-Report & Financial Reconciliation";
  return formKey;
}

function firstEmail(...values) {
  for (const v of values) {
    const s = String(v || "").trim();
    if (s && s.includes("@") && s.length <= 254) return s;
  }
  return "";
}

function requestorEmailFor(formKey, payload, createdBy) {
  // Prefer explicit form email fields, then fall back to the session email.
  if (formKey === "reimbursement_request") {
    return firstEmail(payload?.emailAddress, payload?.email, createdBy);
  }
  return firstEmail(payload?.email, payload?.submitterEmail, createdBy);
}

function summarizeLines(formKey, payload) {
  const p = payload || {};
  if (formKey === "social_media_request") {
    return [
      `Event Name: ${String(p.eventName || "").trim()}`,
      `Event Date: ${String(p.eventDate || "").trim()}`,
      `Organization/Chapter: ${String(p.orgAndChapterName || "").trim()}`,
      `Handle: ${String(p.chapterHandle || "").trim()}`,
    ].filter(Boolean);
  }
  if (formKey === "reimbursement_request") {
    return [
      `Full Name: ${String(p.fullName || "").trim()}`,
      `Organization: ${String(p.memberOrganization || "").trim()}`,
      `Event/Activity: ${String(p.eventName || "").trim()}`,
      `Total Requested: ${typeof p.totalRequested === "number" ? `$${p.totalRequested.toLocaleString()}` : ""}`,
    ].filter(Boolean);
  }
  if (formKey === "budget_submission") {
    return [
      `Project/Committee: ${String(p.projectName || p.committeeName || "").trim()}`,
      `Requested Amount: ${typeof p.totalAmount === "number" ? `$${p.totalAmount.toLocaleString()}` : ""}`,
    ].filter(Boolean);
  }
  if (formKey === "committee_report") {
    return [
      `Committee: ${String(p.committeeName || "").trim()}`,
      `Title: ${String(p.reportTitle || "").trim()}`,
      `Period: ${String(p.reportingPeriod || "").trim()}`,
    ].filter(Boolean);
  }
  if (formKey === "event_submission") {
    return [
      `Event Name: ${String(p.eventName || "").trim()}`,
      `Event Date: ${String(p.eventDate || "").trim()}`,
      `Location: ${String(p.location || "").trim()}`,
      `Host: ${String(p.hostingOrgChapter || "").trim()}`,
    ].filter(Boolean);
  }
  if (formKey === "event_proposal_budget_request") {
    return [
      `Event Name: ${String(p.eventName || "").trim()}`,
      `Proposed Date: ${String(p.proposedDate || "").trim()}`,
      `Requested Budget: ${String(p.requestedBudget || "").trim()}`,
      `Requestor: ${String(p.requestorName || "").trim()}`,
    ].filter(Boolean);
  }
  if (formKey === "event_post_report_financial_reconciliation") {
    return [
      `Event Name: ${String(p.eventName || "").trim()}`,
      `Event Date: ${String(p.eventDate || "").trim()}`,
      `Actual Spend: ${String(p.actualSpend || "").trim()}`,
      `Requestor: ${String(p.requestorName || "").trim()}`,
    ].filter(Boolean);
  }
  return [];
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["POST"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureFormsTables(env.DB);

  const auth = await requireAuthenticated(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const formKey = sanitizeFormKey(body?.formKey);
  if (!formKey) {
    return json({ error: "Invalid formKey." }, { status: 400 });
  }

  const payload = body?.payload ?? {};

  try {
    const saved = await insertSubmission(env.DB, {
      formKey,
      payload,
      createdBy: auth.session.email,
    });

    // Notifications are best-effort: never block the submission if email fails.
    try {
      const settings = await getNotificationSettings(env.DB);
      if (settings.enabled && isEmailEnabled(env)) {
        const rule = settings.rules?.[formKey] || {};
        const adminTo = splitEmails(rule.notifyEmails || settings.defaultNotifyEmails);
        const requestor = requestorEmailFor(formKey, payload, auth.session.email);

        const origin = new URL(request.url).origin;
        const summary = summarizeLines(formKey, payload);

        if (adminTo.length) {
          const text = [
            `New ${formLabel(formKey)} submitted.`,
            "",
            `Tracking ID: ${saved.id}`,
            `Submitted By: ${auth.session.email || "Unknown"}`,
            ...summary,
            "",
            `Review: ${origin}/#/council-admin/submissions`,
          ]
            .filter(Boolean)
            .join("\n");
          await sendEmail(env, {
            to: adminTo,
            subject: `New ${formLabel(formKey)} (ID ${saved.id})`,
            text,
            replyTo: requestor || undefined,
          });
        }

        if (rule.sendConfirmation && requestor) {
          const text = [
            `Your ${formLabel(formKey)} was received.`,
            "",
            `Tracking ID: ${saved.id}`,
            `Submitted: ${saved.createdAt}`,
            "",
            `Check status: ${origin}/#/forms/my`,
          ].join("\n");
          await sendEmail(env, {
            to: [requestor],
            subject: `Submission Received (ID ${saved.id})`,
            text,
          });
        }
      }
    } catch {
      // ignore email failures
    }

    return json({ ok: true, ...saved });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Failed to submit form." }, { status: 400 });
  }
}
