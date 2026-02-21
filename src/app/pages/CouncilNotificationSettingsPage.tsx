import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  fetchMemberAlerts,
  fetchNotificationSettings,
  saveMemberAlerts,
  saveNotificationSettings,
  type MemberAlerts,
  type NotificationSettings,
} from "../data/content-api";

function emptySettings(): NotificationSettings {
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

function emptyMemberAlerts(): MemberAlerts {
  return {
    enabled: false,
    style: "banner",
    severity: "info",
    title: "",
    message: "",
    ctaLabel: "",
    ctaUrl: "",
    alertId: "",
  };
}

function ruleLabel(formKey: string): string {
  if (formKey === "budget_submission") return "Budget Submission";
  if (formKey === "reimbursement_request") return "Reimbursement Request";
  if (formKey === "social_media_request") return "Social Media Intake";
  if (formKey === "committee_report") return "Committee Report";
  if (formKey === "event_submission") return "Event Submission";
  if (formKey === "event_proposal_budget_request") return "Event Proposal & Budget Request";
  if (formKey === "event_post_report_financial_reconciliation") return "Event Post-Report & Financial Reconciliation";
  return formKey;
}

export function CouncilNotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [form, setForm] = useState<NotificationSettings>(emptySettings());
  const [memberAlerts, setMemberAlerts] = useState<MemberAlerts>(emptyMemberAlerts());

  useEffect(() => {
    let cancelled = false;
    void fetchNotificationSettings()
      .then((res) => {
        if (cancelled) return;
        if (res.found && res.data) {
          setForm(res.data);
          setLastSavedAt(res.updatedAt);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load notification settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    void fetchMemberAlerts()
      .then((res) => {
        if (cancelled) return;
        if (res.data) setMemberAlerts({ ...emptyMemberAlerts(), ...res.data });
      })
      .catch(() => {
        // keep defaults
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const nextAlerts = {
        ...memberAlerts,
        alertId: memberAlerts.enabled
          ? (memberAlerts.alertId || `alert-${Date.now()}`)
          : memberAlerts.alertId,
      };
      const [res] = await Promise.all([
        saveNotificationSettings(form),
        saveMemberAlerts(nextAlerts),
      ]);
      setForm(res.data);
      setMemberAlerts(nextAlerts);
      setLastSavedAt(res.updatedAt);
      setMessage("Notification settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const ruleKeys = useMemo(() => Object.keys(form.rules || {}), [form.rules]);
  const setRuleField = (key: string, field: "notifyEmails" | "sendConfirmation" | "notifyOnStatusChange", value: any) => {
    setForm((prev) => ({
      ...prev,
      rules: {
        ...(prev.rules || {}),
        [key]: {
          notifyEmails: String(prev.rules?.[key]?.notifyEmails || ""),
          sendConfirmation: Boolean(prev.rules?.[key]?.sendConfirmation),
          notifyOnStatusChange: Boolean(prev.rules?.[key]?.notifyOnStatusChange),
          [field]: value,
        },
      },
    }));
  };

  return (
    <CouncilAdminGate>
      <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/council-admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="size-4" />
            Back to Council Command Center
          </Link>
          <Button onClick={save} disabled={saving || loading} className="gap-2">
            <Save className="size-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>

        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure who receives emails when a request is submitted and whether requestors get confirmation emails.
              This controls portal behavior, but Cloudflare must also be configured to send email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
            {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}
            {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <p className="font-semibold">Cloudflare Email Sending Must Be Enabled</p>
              <p className="mt-1">
                In Cloudflare Pages, add env vars: <span className="font-mono">EMAIL_ENABLED=true</span> and <span className="font-mono">EMAIL_FROM</span>.
                If you don’t configure email sending, submissions will still save, but no emails will be delivered.
              </p>
            </div>

            <div className="rounded-lg border border-black/10 bg-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Member Push Alert (Portal Banner / Alert)</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Publish a site-wide notification to all signed-in members who consented to portal notifications.
                  </p>
                </div>
                <Switch
                  checked={Boolean(memberAlerts.enabled)}
                  onCheckedChange={(v) => setMemberAlerts((prev) => ({ ...prev, enabled: Boolean(v) }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Display Style</Label>
                  <select
                    value={memberAlerts.style}
                    onChange={(e) => setMemberAlerts((prev) => ({ ...prev, style: e.target.value as MemberAlerts["style"] }))}
                    className="w-full rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="banner">Banner</option>
                    <option value="alert">Alert Modal</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Severity</Label>
                  <select
                    value={memberAlerts.severity}
                    onChange={(e) => setMemberAlerts((prev) => ({ ...prev, severity: e.target.value as MemberAlerts["severity"] }))}
                    className="w-full rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="info">Info</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Alert Title</Label>
                  <Input
                    value={memberAlerts.title}
                    onChange={(e) => setMemberAlerts((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Council Update"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Alert Message</Label>
                  <textarea
                    value={memberAlerts.message}
                    onChange={(e) => setMemberAlerts((prev) => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm text-slate-900"
                    placeholder="Write the member notice..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>CTA Label (optional)</Label>
                  <Input
                    value={memberAlerts.ctaLabel}
                    onChange={(e) => setMemberAlerts((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                    placeholder="View details"
                  />
                </div>
                <div className="space-y-1">
                  <Label>CTA URL (optional)</Label>
                  <Input
                    value={memberAlerts.ctaUrl}
                    onChange={(e) => setMemberAlerts((prev) => ({ ...prev, ctaUrl: e.target.value }))}
                    placeholder="/meetings-delegates or https://..."
                  />
                </div>
              </div>

              <div className="rounded-md border border-black/10 bg-white/60 p-3 text-xs text-slate-600">
                Member consent notice currently used at sign-in:{" "}
                <span className="font-medium">
                  “I authorize NPHC of Hudson County to send official portal notifications, including meeting alerts, council updates,
                  deadlines, and governance notices through in-portal banners/alerts and related member communications.”
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Enable Email Notifications</p>
                  <p className="text-xs text-slate-500 mt-0.5">When off, no emails are attempted.</p>
                </div>
                <Switch checked={Boolean(form.enabled)} onCheckedChange={(v) => setForm((prev) => ({ ...prev, enabled: Boolean(v) }))} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Default Recipient Emails (comma-separated)</Label>
                  <Input
                    value={String(form.defaultNotifyEmails || "")}
                    onChange={(e) => setForm((prev) => ({ ...prev, defaultNotifyEmails: e.target.value }))}
                    placeholder="president@..., secretary@..., etc."
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Treasurer Email (used for reimbursement disbursement notifications)</Label>
                  <Input
                    value={String(form.treasurerEmail || "")}
                    onChange={(e) => setForm((prev) => ({ ...prev, treasurerEmail: e.target.value }))}
                    placeholder="treasurer.nphcofhc@gmail.com"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Last saved: {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : "—"}
              </p>
            </div>

            <div className="grid gap-4">
              {ruleKeys.map((k) => (
                <div key={k} className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{ruleLabel(k)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Per-form override (leave blank to use default recipients).</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Recipient Emails (comma-separated)</Label>
                      <Input
                        value={String(form.rules?.[k]?.notifyEmails || "")}
                        onChange={(e) => setRuleField(k, "notifyEmails", e.target.value)}
                        placeholder="chair@..., committee@..."
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-md border border-black/10 bg-white/55 p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Send Confirmation to Requestor</p>
                        <p className="text-xs text-slate-500 mt-0.5">Email “We received your request” to submitter.</p>
                      </div>
                      <Switch
                        checked={Boolean(form.rules?.[k]?.sendConfirmation)}
                        onCheckedChange={(v) => setRuleField(k, "sendConfirmation", Boolean(v))}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-md border border-black/10 bg-white/55 p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Notify on Status Change</p>
                        <p className="text-xs text-slate-500 mt-0.5">When admins update status, email the requestor.</p>
                      </div>
                      <Switch
                        checked={Boolean(form.rules?.[k]?.notifyOnStatusChange)}
                        onCheckedChange={(v) => setRuleField(k, "notifyOnStatusChange", Boolean(v))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CouncilAdminGate>
  );
}
