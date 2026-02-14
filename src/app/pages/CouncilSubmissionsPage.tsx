import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Download, RefreshCw, Save } from "lucide-react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { fetchSubmissionsAsAdmin, updateSubmissionAsAdmin, type FormSubmissionRow, type FormKey } from "../data/forms-api";

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const FORM_TABS: { key: FormKey; label: string }[] = [
  { key: "budget_submission", label: "Budgets" },
  { key: "reimbursement_request", label: "Reimbursements" },
  { key: "social_media_request", label: "Social Requests" },
  { key: "committee_report", label: "Committee Reports" },
];

function toViewerHref(src: string): string {
  const s = String(src || "").trim();
  if (!s) return "";
  return `/#/viewer?src=${encodeURIComponent(s)}`;
}

export function CouncilSubmissionsPage() {
  const [activeForm, setActiveForm] = useState<FormKey>("budget_submission");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<FormSubmissionRow[]>([]);

  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) || null, [rows, selectedId]);

  const [updateStatus, setUpdateStatus] = useState<string>("Under Review");
  const [updateNotes, setUpdateNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await fetchSubmissionsAsAdmin({
        formKey: activeForm,
        status: statusFilter || undefined,
        limit: 120,
      });
      setRows(data);
      if (data.length && !selectedId) setSelectedId(data[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load submissions.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeForm, statusFilter]);

  useEffect(() => {
    if (!selected) return;
    setUpdateStatus(selected.status || "Under Review");
    setUpdateNotes(selected.reviewNotes || "");
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportAll = () => {
    downloadJson(`portal_${activeForm}_submissions.json`, rows);
  };

  const saveUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateSubmissionAsAdmin({ id: selected.id, status: updateStatus, reviewNotes: updateNotes });
      setMessage("Saved.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CouncilLeaderGate>
      <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/council-admin" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors">
            <ArrowLeft className="size-4" />
            Back to Council Admin
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
              onClick={exportAll}
              disabled={rows.length === 0}
            >
              <Download className="size-4" />
              Export JSON
            </Button>
          </div>
        </div>

        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Submission Review</CardTitle>
            <CardDescription>Review budgets, reimbursements, and social requests stored in the portal backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
            {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}
            {loading ? <p className="text-sm text-white/60">Loading…</p> : null}

            <Tabs value={activeForm} onValueChange={(v) => setActiveForm(v as FormKey)} className="space-y-3">
              <TabsList className="bg-white/5 border border-white/10 backdrop-blur-xl w-full sm:w-auto flex-wrap justify-start">
                {FORM_TABS.map((t) => (
                  <TabsTrigger key={t.key} value={t.key} className="text-xs sm:text-sm">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <Label>Status Filter (optional)</Label>
                    <Input
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      placeholder='e.g. "Submitted" or "Approved"'
                      className="mt-2"
                    />
                  </div>

                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    {rows.length === 0 ? (
                      <div className="p-4 text-sm text-white/60">No submissions found.</div>
                    ) : (
                      <div className="max-h-[60vh] overflow-auto">
                        {rows.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedId(r.id)}
                            className={`w-full text-left p-3 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition ${
                              r.id === selectedId ? "bg-white/10" : "bg-transparent"
                            }`}
                          >
                            <p className="text-sm font-semibold text-white truncate">
                              {r.payload?.title ||
                                r.payload?.eventName ||
                                r.payload?.reportTitle ||
                                r.payload?.committeeName ||
                                r.payload?.projectName ||
                                r.payload?.payeeName ||
                                r.payload?.eventName ||
                                r.id}
                            </p>
                            <p className="text-xs text-white/60 mt-1">{r.status} • {new Date(r.createdAt).toLocaleString()}</p>
                            <p className="text-xs text-white/45 truncate">{r.createdBy || "Unknown sender"}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <TabsContent value={activeForm} className="space-y-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      {!selected ? (
                        <p className="text-sm text-white/60">Select a submission to view details.</p>
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-white/60">Submission</p>
                              <p className="text-sm text-white/70 mt-1">
                                <span className="font-semibold text-white">ID:</span> {selected.id}
                              </p>
                              <p className="text-sm text-white/70">
                                <span className="font-semibold text-white">From:</span> {selected.createdBy || "Unknown"}
                              </p>
                              <p className="text-sm text-white/70">
                                <span className="font-semibold text-white">Created:</span> {new Date(selected.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label>Status</Label>
                              <Input value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} placeholder="Under Review" />
                            </div>
                            <div className="flex items-end">
                              <Button onClick={saveUpdate} disabled={saving} className="w-full sm:w-auto">
                                <Save className="mr-2 size-4" />
                                {saving ? "Saving…" : "Save Status"}
                              </Button>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label>Review Notes</Label>
                              <Textarea value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} rows={5} placeholder="Notes back to submitter, approvals, next steps…" />
                            </div>
                          </div>

                          {Array.isArray((selected.payload as any)?.receiptFiles) && (selected.payload as any).receiptFiles.length > 0 ? (
                            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-widest text-white/60">Receipts</p>
                              <div className="mt-2 space-y-2">
                                {(selected.payload as any).receiptFiles.map((f: any) => (
                                  <a
                                    key={String(f?.key || f?.viewUrl || Math.random())}
                                    href={toViewerHref(String(f?.viewUrl || ""))}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-white/5 hover:border-primary/40 transition"
                                  >
                                    {String(f?.filename || f?.key || "Receipt")}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {String((selected.payload as any)?.receiptLinks || "").trim() ? (
                            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-widest text-white/60">Receipt Links</p>
                              <p className="text-sm text-white/70 mt-2 whitespace-pre-wrap">
                                {String((selected.payload as any).receiptLinks)}
                              </p>
                            </div>
                          ) : null}

                          {Array.isArray((selected.payload as any)?.mediaFiles) && (selected.payload as any).mediaFiles.length > 0 ? (
                            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-widest text-white/60">Social Media Assets</p>
                              <div className="mt-2 space-y-2">
                                {(selected.payload as any).mediaFiles.map((f: any) => (
                                  <a
                                    key={String(f?.key || f?.viewUrl || Math.random())}
                                    href={toViewerHref(String(f?.viewUrl || ""))}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-white/5 hover:border-primary/40 transition"
                                  >
                                    {String(f?.filename || f?.key || "Asset")}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {String((selected.payload as any)?.mediaLinks || "").trim() ? (
                            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-widest text-white/60">Asset Links</p>
                              <p className="text-sm text-white/70 mt-2 whitespace-pre-wrap">
                                {String((selected.payload as any).mediaLinks)}
                              </p>
                            </div>
                          ) : null}

                          {Array.isArray((selected.payload as any)?.attachments) && (selected.payload as any).attachments.length > 0 ? (
                            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-widest text-white/60">Attachments</p>
                              <div className="mt-2 space-y-2">
                                {(selected.payload as any).attachments.map((f: any) => (
                                  <a
                                    key={String(f?.key || f?.viewUrl || Math.random())}
                                    href={toViewerHref(String(f?.viewUrl || ""))}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-white/5 hover:border-primary/40 transition"
                                  >
                                    {String(f?.filename || f?.key || "Attachment")}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {String((selected.payload as any)?.attachmentLinks || "").trim() ? (
                            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-widest text-white/60">Attachment Links</p>
                              <p className="text-sm text-white/70 mt-2 whitespace-pre-wrap">
                                {String((selected.payload as any).attachmentLinks)}
                              </p>
                            </div>
                          ) : null}

                          <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-4">
                            <p className="text-xs uppercase tracking-widest text-white/60">Submitted Payload</p>
                            <pre className="mt-2 text-xs text-white/80 overflow-auto whitespace-pre-wrap">
                              {JSON.stringify(selected.payload, null, 2)}
                            </pre>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </CouncilLeaderGate>
  );
}
