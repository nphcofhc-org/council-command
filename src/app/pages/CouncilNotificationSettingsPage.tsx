import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { fetchNotificationSettings, saveNotificationSettings, type NotificationSettings } from "../data/content-api";

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
    },
  };
}

function ruleLabel(formKey: string): string {
  if (formKey === "budget_submission") return "Budget Submission";
  if (formKey === "reimbursement_request") return "Reimbursement Request";
  if (formKey === "social_media_request") return "Social Media Intake";
  if (formKey === "committee_report") return "Committee Report";
  return formKey;
}

export function CouncilNotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [form, setForm] = useState<NotificationSettings>(emptySettings());

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
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await saveNotificationSettings(form);
      setForm(res.data);
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
          <Link to="/council-admin" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors">
            <ArrowLeft className="size-4" />
            Back to Council Admin
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
            {loading ? <p className="text-sm text-white/60">Loading…</p> : null}

            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <p className="font-semibold">Cloudflare Email Sending Must Be Enabled</p>
              <p className="mt-1">
                In Cloudflare Pages, add env vars: <span className="font-mono">EMAIL_ENABLED=true</span> and <span className="font-mono">EMAIL_FROM</span>.
                If you don’t configure email sending, submissions will still save, but no emails will be delivered.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Enable Email Notifications</p>
                  <p className="text-xs text-white/60 mt-0.5">When off, no emails are attempted.</p>
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

              <p className="text-xs text-white/60">
                Last saved: {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : "—"}
              </p>
            </div>

            <div className="grid gap-4">
              {ruleKeys.map((k) => (
                <div key={k} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-white">{ruleLabel(k)}</p>
                      <p className="text-xs text-white/60 mt-0.5">Per-form override (leave blank to use default recipients).</p>
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

                    <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/30 p-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Send Confirmation to Requestor</p>
                        <p className="text-xs text-white/60 mt-0.5">Email “We received your request” to submitter.</p>
                      </div>
                      <Switch
                        checked={Boolean(form.rules?.[k]?.sendConfirmation)}
                        onCheckedChange={(v) => setRuleField(k, "sendConfirmation", Boolean(v))}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/30 p-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Notify on Status Change</p>
                        <p className="text-xs text-white/60 mt-0.5">When admins update status, email the requestor.</p>
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
