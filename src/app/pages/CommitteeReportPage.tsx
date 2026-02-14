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
    <div className="relative">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2 border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">Form</p>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">Committee Report Submission</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Submit a Committee Report</CardTitle>
              <CardDescription>
                Committee chairs submit updates for review and recordkeeping. Attach documents if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}

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

              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-white">Attachments (optional)</p>
                    <p className="text-xs text-white/60 mt-0.5">
                      Upload up to 5 files. Max 100MB each. (PDF, DOCX, JPG, PNG, HEIC accepted)
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border border-white/15 bg-black/30 px-3 py-2 cursor-pointer hover:bg-white/5 hover:border-primary/40 transition">
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
                      <div key={`${f.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/30 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{f.name}</p>
                          <p className="text-xs text-white/60">{Math.round(f.size / 1024)} KB</p>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="text-white/60 hover:text-primary transition-colors" aria-label="Remove file">
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-1">
                  <Label className="text-xs text-white/60">
                    If uploads are temporarily unavailable, paste Drive link(s) here (optional fallback)
                  </Label>
                  <Textarea value={attachmentLinksFallback} onChange={(e) => setAttachmentLinksFallback(e.target.value)} rows={2} placeholder="https://drive.google.com/…" />
                </div>
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="w-full sm:w-auto">
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
