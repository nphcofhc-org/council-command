export type FormKey =
  | "budget_submission"
  | "reimbursement_request"
  | "social_media_request"
  | "committee_report";

export type FormSubmissionRow = {
  id: string;
  formKey: string;
  payload: any;
  createdAt: string;
  createdBy: string | null;
  status: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
};

const SUBMIT_ENDPOINT = "/api/forms/submit";
const MY_ENDPOINT = "/api/forms/my";
const ADMIN_LIST_ENDPOINT = "/api/forms/admin/list";
const ADMIN_UPDATE_ENDPOINT = "/api/forms/admin/update";
const RECEIPTS_UPLOAD_ENDPOINT = "/api/uploads/receipts";
const SOCIAL_UPLOAD_ENDPOINT = "/api/uploads/social";
const COMMITTEE_REPORTS_UPLOAD_ENDPOINT = "/api/uploads/committee-reports";

export type UploadedReceipt = {
  key: string;
  filename: string;
  contentType: string;
  size: number;
  viewUrl: string;
};

export type UploadedSocialAsset = UploadedReceipt;
export type UploadedCommitteeReportAsset = UploadedReceipt;

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

export async function submitForm(formKey: FormKey, payload: unknown): Promise<{ ok: true; id: string; createdAt: string; status: string }> {
  const res = await fetch(SUBMIT_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ formKey, payload }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return { ok: true, id: String(data.id), createdAt: String(data.createdAt), status: String(data.status) };
}

export async function fetchMySubmissions(formKey?: FormKey): Promise<FormSubmissionRow[]> {
  const url = new URL(MY_ENDPOINT, window.location.origin);
  if (formKey) url.searchParams.set("formKey", formKey);
  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data?.rows) ? (data.rows as FormSubmissionRow[]) : [];
}

export async function fetchSubmissionsAsAdmin(params: { formKey?: FormKey; status?: string; limit?: number }): Promise<FormSubmissionRow[]> {
  const url = new URL(ADMIN_LIST_ENDPOINT, window.location.origin);
  if (params.formKey) url.searchParams.set("formKey", params.formKey);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data?.rows) ? (data.rows as FormSubmissionRow[]) : [];
}

export async function updateSubmissionAsAdmin(input: { id: string; status: string; reviewNotes?: string }): Promise<{ ok: true; id: string; status: string }> {
  const res = await fetch(ADMIN_UPDATE_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ id: input.id, status: input.status, reviewNotes: input.reviewNotes || "" }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return { ok: true, id: String(data.id), status: String(data.status) };
}

export async function uploadReceipts(files: File[]): Promise<UploadedReceipt[]> {
  const form = new FormData();
  for (const f of files.slice(0, 5)) form.append("files", f);

  const res = await fetch(RECEIPTS_UPLOAD_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data?.files) ? (data.files as UploadedReceipt[]) : [];
}

export async function uploadSocialAssets(files: File[]): Promise<UploadedSocialAsset[]> {
  const form = new FormData();
  for (const f of files.slice(0, 5)) form.append("files", f);

  const res = await fetch(SOCIAL_UPLOAD_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data?.files) ? (data.files as UploadedSocialAsset[]) : [];
}

export async function uploadCommitteeReportFiles(files: File[]): Promise<UploadedCommitteeReportAsset[]> {
  const form = new FormData();
  for (const f of files.slice(0, 5)) form.append("files", f);

  const res = await fetch(COMMITTEE_REPORTS_UPLOAD_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data?.files) ? (data.files as UploadedCommitteeReportAsset[]) : [];
}
