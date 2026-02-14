import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { fetchMySubmissions, type FormSubmissionRow } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";

function labelForFormKey(key: string) {
  if (key === "budget_submission") return "Budget Submission";
  if (key === "reimbursement_request") return "Reimbursement Request";
  if (key === "social_media_request") return "Social Media Request";
  if (key === "committee_report") return "Committee Report";
  return key;
}

function toViewerHref(src: string): string {
  const s = String(src || "").trim();
  if (!s) return "";
  return `/#/viewer?src=${encodeURIComponent(s)}`;
}

export function MySubmissionsPage() {
  const { session } = useCouncilSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<FormSubmissionRow[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMySubmissions();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load submissions.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.authenticated) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.authenticated]);

  return (
    <div className="relative">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
            onClick={load}
            disabled={!session.authenticated || loading}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>Status and review notes for your submitted requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  You must be authenticated to view submissions.
                </div>
              ) : null}
              {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}
              {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

              {rows.length === 0 && session.authenticated && !loading ? (
                <p className="text-sm text-slate-500">No submissions yet.</p>
              ) : null}

              <div className="space-y-2">
                {rows.map((r) => (
                  <div key={r.id} className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{labelForFormKey(r.formKey)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Submitted: {new Date(r.createdAt).toLocaleString()}</p>
                        <p className="text-xs text-slate-400 break-all">ID: {r.id}</p>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 border border-black/15 bg-white/55 rounded-md px-2 py-1 w-fit">
                        {r.status}
                      </p>
                    </div>
                    {r.reviewNotes ? (
                      <div className="mt-3 rounded-md bg-white/55 border border-black/10 p-3">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Review Notes</p>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{r.reviewNotes}</p>
                      </div>
                    ) : null}

                    {Array.isArray((r.payload as any)?.receiptFiles) && (r.payload as any).receiptFiles.length > 0 ? (
                      <div className="mt-3 rounded-md border border-black/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Receipts</p>
                        <div className="mt-2 space-y-2">
                          {(r.payload as any).receiptFiles.map((f: any) => (
                            <a
                              key={String(f?.key || f?.viewUrl || Math.random())}
                              href={toViewerHref(String(f?.viewUrl || ""))}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-md border border-black/10 bg-white/55 px-3 py-2 text-sm text-slate-900 hover:bg-white/5 hover:border-primary/40 transition"
                            >
                              {String(f?.filename || f?.key || "Receipt")}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray((r.payload as any)?.mediaFiles) && (r.payload as any).mediaFiles.length > 0 ? (
                      <div className="mt-3 rounded-md border border-black/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Social Media Assets</p>
                        <div className="mt-2 space-y-2">
                          {(r.payload as any).mediaFiles.map((f: any) => (
                            <a
                              key={String(f?.key || f?.viewUrl || Math.random())}
                              href={toViewerHref(String(f?.viewUrl || ""))}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-md border border-black/10 bg-white/55 px-3 py-2 text-sm text-slate-900 hover:bg-white/5 hover:border-primary/40 transition"
                            >
                              {String(f?.filename || f?.key || "Asset")}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray((r.payload as any)?.attachments) && (r.payload as any).attachments.length > 0 ? (
                      <div className="mt-3 rounded-md border border-black/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Attachments</p>
                        <div className="mt-2 space-y-2">
                          {(r.payload as any).attachments.map((f: any) => (
                            <a
                              key={String(f?.key || f?.viewUrl || Math.random())}
                              href={toViewerHref(String(f?.viewUrl || ""))}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-md border border-black/10 bg-white/55 px-3 py-2 text-sm text-slate-900 hover:bg-white/5 hover:border-primary/40 transition"
                            >
                              {String(f?.filename || f?.key || "Attachment")}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {String((r.payload as any)?.attachmentLinks || "").trim() ? (
                      <div className="mt-3 rounded-md border border-black/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Attachment Links</p>
                        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{String((r.payload as any).attachmentLinks)}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
