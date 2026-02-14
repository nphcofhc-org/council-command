import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { submitForm, uploadCommitteeReportFiles, type UploadedCommitteeReportAsset } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";

export function CommitteeReportPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(session.email || "");
  const [committeeName, setCommitteeName] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [summary, setSummary] = useState("");
  const [keyUpdates, setKeyUpdates] = useState("");
  const [requestsOrNeeds, setRequestsOrNeeds] = useState("");
  const [actionItems, setActionItems] = useState("");

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentLinksFallback, setAttachmentLinksFallback] = useState("");
  const [uploadedAttachments, setUploadedAttachments] = useState<UploadedCommitteeReportAsset[]>([]);

  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    const required = [
      ["Email", email],
      ["Committee Name", committeeName],
      ["Report Title", reportTitle],
      ["Reporting Period", reportingPeriod],
      ["Summary", summary],
    ] as const;

    for (const [label, v] of required) {
      if (!String(v || "").trim()) return `${label} is required.`;
    }

    if (attachmentFiles.length > 5) return "Upload up to 5 files.";
    return null;
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!session.authenticated) throw new Error("Unauthenticated. Please refresh and complete Access login.");
      const v = validate();
      if (v) throw new Error(v);

      let uploaded: UploadedCommitteeReportAsset[] = uploadedAttachments;
      if (attachmentFiles.length > 0 && uploadedAttachments.length === 0) {
        try {
          uploaded = await uploadCommitteeReportFiles(attachmentFiles);
          setUploadedAttachments(uploaded);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed.";
          if (attachmentLinksFallback.trim()) {
            uploaded = [];
          } else {
            throw new Error(msg);
          }
        }
      }

      const payload = {
        email,
        committeeName,
        reportTitle,
        reportingPeriod,
        summary,
        keyUpdates,
        requestsOrNeeds,
        actionItems,
        attachments: uploaded,
        attachmentLinks: attachmentLinksFallback,
      };

      const res = await submitForm("committee_report", payload);
      setMessage(`Submitted. Tracking ID: ${res.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Form</p>
            <h1 className="text-lg sm:text-xl font-extrabold text-black">Committee Report Submission</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle>Submit a Committee Report</CardTitle>
              <CardDescription>
                Committee chairs submit updates for review and recordkeeping. Attach documents if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-green-700 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-red-700 font-semibold">{error}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Email *</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div className="space-y-1">
                  <Label>Committee Name *</Label>
                  <Input value={committeeName} onChange={(e) => setCommitteeName(e.target.value)} placeholder="Scholarship, Service, Fundraising…" />
                </div>
                <div className="space-y-1">
                  <Label>Reporting Period *</Label>
                  <Input value={reportingPeriod} onChange={(e) => setReportingPeriod(e.target.value)} placeholder="e.g., Feb 2026 / Q1 2026" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Report Title *</Label>
                  <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Short title for this report" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Summary *</Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} placeholder="High-level summary of progress, outcomes, and key points." />
              </div>

              <div className="space-y-1">
                <Label>Key Updates (optional)</Label>
                <Textarea value={keyUpdates} onChange={(e) => setKeyUpdates(e.target.value)} rows={4} placeholder="Milestones, metrics, decisions, partnerships, deliverables." />
              </div>

              <div className="space-y-1">
                <Label>Requests / Needs (optional)</Label>
                <Textarea value={requestsOrNeeds} onChange={(e) => setRequestsOrNeeds(e.target.value)} rows={4} placeholder="Support needed from Exec Council or general body (funding, volunteers, approvals, assets)." />
              </div>

              <div className="space-y-1">
                <Label>Action Items (optional)</Label>
                <Textarea value={actionItems} onChange={(e) => setActionItems(e.target.value)} rows={4} placeholder="Next steps and who owns them (if known)." />
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-black">Attachments (optional)</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload up to 5 files. Max 100MB each. (PDF, DOCX, JPG, PNG, HEIC accepted)
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border border-gray-200 bg-white px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <Upload className="size-4" />
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,image/*,.heic,.heif"
                      className="hidden"
                      onChange={(e) => {
                        const list = Array.from(e.target.files || []);
                        setAttachmentFiles((prev) => [...prev, ...list].slice(0, 5));
                      }}
                    />
                  </label>
                </div>

                {attachmentFiles.length > 0 ? (
                  <div className="space-y-2">
                    {attachmentFiles.map((f, idx) => (
                      <div key={`${f.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-black truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(f.size / 1024)} KB</p>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="text-gray-500 hover:text-black" aria-label="Remove file">
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">
                    If uploads are temporarily unavailable, paste Drive link(s) here (optional fallback)
                  </Label>
                  <Textarea value={attachmentLinksFallback} onChange={(e) => setAttachmentLinksFallback(e.target.value)} rows={2} placeholder="https://drive.google.com/…" />
                </div>
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="bg-black hover:bg-gray-900 w-full sm:w-auto">
                <Save className="mr-2 size-4" />
                {saving ? "Submitting…" : "Submit Report"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

