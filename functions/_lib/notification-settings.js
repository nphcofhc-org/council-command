import { ensureContentTable, readSection } from "./content-store";

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

function normalizeRule(input) {
  return {
    notifyEmails: t(input?.notifyEmails, 1200),
    sendConfirmation: input?.sendConfirmation === false ? false : asBool(input?.sendConfirmation) || true,
    notifyOnStatusChange: asBool(input?.notifyOnStatusChange),
  };
}

export function splitEmails(value) {
  const raw = String(value || "").trim();
  if (!raw) return [];
  const parts = raw
    .split(/[,\n;]/g)
    .map((p) => p.trim())
    .filter(Boolean);
  // Keep it simple: basic "@" check + trim length.
  return parts.filter((e) => e.includes("@") && e.length <= 254).slice(0, 50);
}

export function defaultNotificationSettings() {
  return {
    enabled: false,
    defaultNotifyEmails: "",
    treasurerEmail: "treasurer.nphcofhc@gmail.com",
    rules: {
      budget_submission: { notifyEmails: "", sendConfirmation: true, notifyOnStatusChange: false },
      reimbursement_request: { notifyEmails: "", sendConfirmation: true, notifyOnStatusChange: true },
      social_media_request: { notifyEmails: "", sendConfirmation: true, notifyOnStatusChange: false },
      committee_report: { notifyEmails: "", sendConfirmation: true, notifyOnStatusChange: false },
      event_submission: { notifyEmails: "", sendConfirmation: true, notifyOnStatusChange: false },
      event_proposal_budget_request: { notifyEmails: "", sendConfirmation: true, notifyOnStatusChange: true },
      event_post_report_financial_reconciliation: { notifyEmails: "", sendConfirmation: true, notifyOnStatusChange: true },
    },
  };
}

export async function getNotificationSettings(db) {
  await ensureContentTable(db);
  const payload = await readSection(db, SECTION_KEY);
  if (!payload.found || !payload.data) return defaultNotificationSettings();

  const raw = payload.data || {};
  const rulesIn = raw?.rules && typeof raw.rules === "object" ? raw.rules : {};
  const base = defaultNotificationSettings();

  return {
    ...base,
    enabled: asBool(raw?.enabled),
    defaultNotifyEmails: t(raw?.defaultNotifyEmails, 1200),
    treasurerEmail: t(raw?.treasurerEmail, 200) || base.treasurerEmail,
    rules: {
      budget_submission: normalizeRule(rulesIn?.budget_submission),
      reimbursement_request: normalizeRule(rulesIn?.reimbursement_request),
      social_media_request: normalizeRule(rulesIn?.social_media_request),
      committee_report: normalizeRule(rulesIn?.committee_report),
      event_submission: normalizeRule(rulesIn?.event_submission),
      event_proposal_budget_request: normalizeRule(rulesIn?.event_proposal_budget_request),
      event_post_report_financial_reconciliation: normalizeRule(rulesIn?.event_post_report_financial_reconciliation),
    },
  };
}
