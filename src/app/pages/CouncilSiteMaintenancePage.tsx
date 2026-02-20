import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, BarChart3, Database, Loader2, Save, Settings, Shield, SlidersHorizontal, UserCog, Users, Wrench } from "lucide-react";
import { PresidentGate } from "../components/PresidentGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import type { AccessOverrideEntry } from "../data/admin-api";
import { fetchSiteMaintenancePayload, saveSiteMaintenanceOverrides } from "../data/admin-api";

type PermissionMode = "inherit" | "allow" | "deny";

type AccessRow = {
  email: string;
  councilAdmin: PermissionMode;
  treasuryAdmin: PermissionMode;
  siteEditor: PermissionMode;
  president: PermissionMode;
  note: string;
};

const EMPTY_METRICS = {
  pageViews24h: 0,
  pageViews7d: 0,
  distinctUsers7d: 0,
  activeUsers15m: 0,
  topPages7d: [] as Array<{ path: string; hits: number }>,
  recentActivity: [] as Array<{ email: string | null; eventType: string; path: string | null; createdAt: string | null }>,
};

function toMode(value: boolean | null | undefined): PermissionMode {
  if (value === true) return "allow";
  if (value === false) return "deny";
  return "inherit";
}

function toOverrideFlag(mode: PermissionMode): boolean | null {
  if (mode === "allow") return true;
  if (mode === "deny") return false;
  return null;
}

function toRow(input: AccessOverrideEntry | { email: string }): AccessRow {
  return {
    email: String(input.email || "").trim().toLowerCase(),
    councilAdmin: toMode((input as AccessOverrideEntry).isCouncilAdmin),
    treasuryAdmin: toMode((input as AccessOverrideEntry).isTreasuryAdmin),
    siteEditor: toMode((input as AccessOverrideEntry).isSiteEditor),
    president: toMode((input as AccessOverrideEntry).isPresident),
    note: String((input as AccessOverrideEntry).note || "").trim(),
  };
}

function rowToEntry(row: AccessRow): AccessOverrideEntry | null {
  const email = String(row.email || "").trim().toLowerCase();
  if (!email) return null;
  return {
    email,
    isCouncilAdmin: toOverrideFlag(row.councilAdmin),
    isTreasuryAdmin: toOverrideFlag(row.treasuryAdmin),
    isSiteEditor: toOverrideFlag(row.siteEditor),
    isPresident: toOverrideFlag(row.president),
    note: String(row.note || "").trim(),
  };
}

export function CouncilSiteMaintenancePage() {
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchSiteMaintenancePayload();
      const map = new Map<string, AccessRow>();

      for (const email of payload.knownUsers || []) {
        if (!email) continue;
        map.set(email, toRow({ email }));
      }

      for (const entry of payload.overrides || []) {
        if (!entry.email) continue;
        map.set(entry.email, toRow(entry));
      }

      const sorted = Array.from(map.values()).sort((a, b) => a.email.localeCompare(b.email));
      setRows(sorted);
      setMetrics(payload.metrics || EMPTY_METRICS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load site maintenance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const dirty = useMemo(
    () => rows.some((row) =>
      row.councilAdmin !== "inherit" ||
      row.treasuryAdmin !== "inherit" ||
      row.siteEditor !== "inherit" ||
      row.president !== "inherit" ||
      row.note.length > 0,
    ),
    [rows],
  );

  const setRow = (index: number, patch: Partial<AccessRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    setRows((prev) => {
      if (prev.some((r) => r.email === email)) return prev;
      return [...prev, toRow({ email })].sort((a, b) => a.email.localeCompare(b.email));
    });
    setNewEmail("");
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = rows
        .map(rowToEntry)
        .filter(Boolean)
        .filter((entry) =>
          entry!.isCouncilAdmin !== null ||
          entry!.isTreasuryAdmin !== null ||
          entry!.isSiteEditor !== null ||
          entry!.isPresident !== null ||
          entry!.note.length > 0,
        ) as AccessOverrideEntry[];

      const result = await saveSiteMaintenanceOverrides(payload);
      setUpdatedAt(result.updatedAt);
      setUpdatedBy(result.updatedBy);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save access policy.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PresidentGate>
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
          >
            <Link to="/council-admin">
              <ArrowLeft className="size-4" />
              Back to Council Command Center
            </Link>
          </Button>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Wrench className="size-6 text-primary" />
                Site Maintenance Dashboard
              </CardTitle>
              <CardDescription>
                President-only controls for content operations, access policy, and authenticated site activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Active Users (15m)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.activeUsers15m}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Unique Users (7d)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.distinctUsers7d}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Page Views (24h)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.pageViews24h}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Page Views (7d)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.pageViews7d}</CardTitle>
                </CardHeader>
              </Card>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCog className="size-5 text-primary" />
                  Role & Access Policy
                </CardTitle>
                <CardDescription>
                  Set per-user access to Council Command, Treasury, Site Editor, and President controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Add user email"
                    className="border-black/15 bg-white/5"
                  />
                  <Button type="button" variant="outline" onClick={addEmail} className="border-black/15 bg-white/5">
                    Add User
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="size-4 animate-spin" />
                    Loading access policy...
                  </div>
                ) : null}

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {rows.map((row, idx) => (
                    <div key={row.email} className="rounded-lg border border-black/10 bg-white/5 p-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 break-all">{row.email}</p>
                          <Button type="button" variant="outline" size="sm" className="border-black/15 bg-white/5" onClick={() => removeRow(idx)}>
                            Remove
                          </Button>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">Council</p>
                            <Select value={row.councilAdmin} onValueChange={(value) => setRow(idx, { councilAdmin: value as PermissionMode })}>
                              <SelectTrigger className="border-black/15 bg-white/5"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inherit">Inherit</SelectItem>
                                <SelectItem value="allow">Allow</SelectItem>
                                <SelectItem value="deny">Deny</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">Treasury</p>
                            <Select value={row.treasuryAdmin} onValueChange={(value) => setRow(idx, { treasuryAdmin: value as PermissionMode })}>
                              <SelectTrigger className="border-black/15 bg-white/5"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inherit">Inherit</SelectItem>
                                <SelectItem value="allow">Allow</SelectItem>
                                <SelectItem value="deny">Deny</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">Site Editor</p>
                            <Select value={row.siteEditor} onValueChange={(value) => setRow(idx, { siteEditor: value as PermissionMode })}>
                              <SelectTrigger className="border-black/15 bg-white/5"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inherit">Inherit</SelectItem>
                                <SelectItem value="allow">Allow</SelectItem>
                                <SelectItem value="deny">Deny</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">President</p>
                            <Select value={row.president} onValueChange={(value) => setRow(idx, { president: value as PermissionMode })}>
                              <SelectTrigger className="border-black/15 bg-white/5"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inherit">Inherit</SelectItem>
                                <SelectItem value="allow">Allow</SelectItem>
                                <SelectItem value="deny">Deny</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Input
                          value={row.note}
                          onChange={(e) => setRow(idx, { note: e.target.value })}
                          placeholder="Optional note (reason/role)"
                          className="border-black/15 bg-white/5"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    {updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString()}${updatedBy ? ` by ${updatedBy}` : ""}` : "No access changes saved yet."}
                  </p>
                  <Button onClick={save} disabled={saving || loading || !dirty} className="gap-2">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Access Policy
                  </Button>
                </div>

                {error ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="size-4 text-primary" />
                    Top Pages (7d)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {metrics.topPages7d.length === 0 ? (
                    <p className="text-slate-500">No activity yet.</p>
                  ) : (
                    metrics.topPages7d.map((item) => (
                      <div key={item.path} className="flex items-center justify-between rounded border border-black/10 bg-white/5 px-3 py-2">
                        <span className="truncate text-slate-700">{item.path || "/"}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-500">{item.hits}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="size-4 text-primary" />
                    Maintenance Shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content"><SlidersHorizontal className="size-4" /> Content Manager</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/submissions"><Database className="size-4" /> Submission Review</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/notifications"><Shield className="size-4" /> Notification Settings</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content/members"><Users className="size-4" /> Member Directory</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Recent Authenticated Activity</CardTitle>
              <CardDescription>Latest portal events from logged-in users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-slate-500">
                      <th className="px-2 py-2">Time</th>
                      <th className="px-2 py-2">User</th>
                      <th className="px-2 py-2">Event</th>
                      <th className="px-2 py-2">Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentActivity.map((row, idx) => (
                      <tr key={`${row.createdAt || "na"}-${idx}`} className="border-b border-black/5">
                        <td className="px-2 py-2 text-slate-500">
                          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-2 py-2 text-slate-800">{row.email || "Unknown"}</td>
                        <td className="px-2 py-2 text-slate-700">{row.eventType || "page_view"}</td>
                        <td className="px-2 py-2 text-slate-600">{row.path || "—"}</td>
                      </tr>
                    ))}
                    {metrics.recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-2 py-4 text-center text-slate-500">No activity captured yet.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PresidentGate>
  );
}
