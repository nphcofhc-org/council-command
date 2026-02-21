import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireSiteEditor,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "notification_settings";

function t(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function asBool(value) {
  if (value === true) return true;
  if (value === false) return false;
  const s = String(value || "").trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return false;
}

function sanitizeRule(input) {
  return {
    notifyEmails: t(input?.notifyEmails, 1200),
    sendConfirmation: input?.sendConfirmation === false ? false : asBool(input?.sendConfirmation) || true,
    notifyOnStatusChange: asBool(input?.notifyOnStatusChange),
  };
}

function sanitizeContent(input) {
  const rulesIn = input?.rules && typeof input.rules === "object" ? input.rules : {};

  return {
    enabled: asBool(input?.enabled),
    defaultNotifyEmails: t(input?.defaultNotifyEmails, 1200),
    treasurerEmail: t(input?.treasurerEmail, 200),
    rules: {
      budget_submission: sanitizeRule(rulesIn?.budget_submission),
      reimbursement_request: sanitizeRule(rulesIn?.reimbursement_request),
      social_media_request: sanitizeRule(rulesIn?.social_media_request),
      committee_report: sanitizeRule(rulesIn?.committee_report),
      event_submission: sanitizeRule(rulesIn?.event_submission),
      event_proposal_budget_request: sanitizeRule(rulesIn?.event_proposal_budget_request),
      event_post_report_financial_reconciliation: sanitizeRule(rulesIn?.event_post_report_financial_reconciliation),
    },
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET", "PUT"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureContentTable(env.DB);

  if (request.method === "GET") {
    const payload = await readSection(env.DB, SECTION_KEY);
    if (!payload.found) {
      return json({
        found: false,
        data: null,
        updatedAt: null,
        updatedBy: null,
      });
    }

    return json({
      found: true,
      data: sanitizeContent(payload.data || {}),
      updatedAt: payload.updatedAt,
      updatedBy: payload.updatedBy,
    });
  }

  const auth = await requireSiteEditor(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const saved = await writeSection(env.DB, SECTION_KEY, sanitizeContent(body || {}), auth.session.email);
  return json(saved);
}
