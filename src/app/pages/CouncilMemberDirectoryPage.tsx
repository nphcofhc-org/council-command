import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Users, Save, Plus, Trash2, AlertTriangle, Shield, UserPlus, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { fetchMemberDirectory, fetchSiteMaintenancePayload, saveMemberDirectory, saveSiteMaintenanceOverrides, type AccessOverrideEntry } from "../data/admin-api";
import type { MemberDirectoryEntry } from "../data/member-directory";
import { useCouncilSession } from "../hooks/use-council-session";

function normalizeEmail(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function emptyEntry(): MemberDirectoryEntry {
  return { email: "", displayName: "", designation: "" };
}

type AccessRoleKey = "isCouncilAdmin" | "isSiteEditor" | "isTreasuryAdmin" | "isPresident";
type TriStateValue = "default" | "allow" | "deny";

function emptyOverride(email: string): AccessOverrideEntry {
  return {
    email: normalizeEmail(email),
    isCouncilAdmin: null,
    isSiteEditor: null,
    isTreasuryAdmin: null,
    isPresident: null,
    note: "",
  };
}

function hasAnyOverride(entry: AccessOverrideEntry | undefined | null): boolean {
  if (!entry) return false;
  return (
    entry.isCouncilAdmin !== null ||
    entry.isSiteEditor !== null ||
    entry.isTreasuryAdmin !== null ||
    entry.isPresident !== null ||
    String(entry.note || "").trim().length > 0
  );
}

function flagToTri(value: boolean | null | undefined): TriStateValue {
  if (value === true) return "allow";
  if (value === false) return "deny";
  return "default";
}

function triToFlag(value: string): boolean | null {
  if (value === "allow") return true;
  if (value === "deny") return false;
  return null;
}

function mergeKnownEmails(entries: MemberDirectoryEntry[], knownEmails: string[]) {
  const seen = new Set(entries.map((e) => normalizeEmail(e.email)).filter(Boolean));
  const additions: MemberDirectoryEntry[] = [];
  for (const raw of knownEmails) {
    const email = normalizeEmail(raw);
    if (!email || seen.has(email)) continue;
    seen.add(email);
    additions.push({ email, displayName: "", designation: "" });
  }
  return {
    next: additions.length > 0 ? [...entries, ...additions] : entries,
    addedCount: additions.length,
  };
}

export function CouncilMemberDirectoryPage() {
  const { session } = useCouncilSession();
  const [entries, setEntries] = useState<MemberDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessSaving, setAccessSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [knownUserEmails, setKnownUserEmails] = useState<string[]>([]);
  const [existingOverrides, setExistingOverrides] = useState<AccessOverrideEntry[]>([]);
  const [accessOverridesByEmail, setAccessOverridesByEmail] = useState<Record<string, AccessOverrideEntry>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchMemberDirectory()
      .then((res) => {
        if (cancelled) return;
        setEntries(Array.isArray(res.data?.entries) ? res.data.entries : []);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load member directory");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session.isPresident) return;
    let cancelled = false;
    setAccessLoading(true);
    setAccessError(null);
    void fetchSiteMaintenancePayload()
      .then((payload) => {
        if (cancelled) return;
        const known = Array.isArray(payload.knownUsers) ? payload.knownUsers.map(normalizeEmail).filter(Boolean) : [];
        setKnownUserEmails(known);
        setExistingOverrides(payload.overrides || []);
        setAccessOverridesByEmail(
          Object.fromEntries(
            (payload.overrides || []).map((entry) => [normalizeEmail(entry.email), { ...emptyOverride(entry.email), ...entry }]),
          ),
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setAccessError(e instanceof Error ? e.message : "Failed to load access controls.");
      })
      .finally(() => {
        if (!cancelled) setAccessLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session.isPresident]);

  const deduped = useMemo(() => {
    const seen = new Set<string>();
    const out: MemberDirectoryEntry[] = [];
    for (const e of entries) {
      const email = normalizeEmail(e.email);
      if (!email) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      out.push({ ...e, email });
    }
    return out;
  }, [entries]);

  const syncKnownUsersIntoDirectory = () => {
    const { next, addedCount } = mergeKnownEmails(entries, knownUserEmails);
    if (next !== entries) setEntries(next);
    if (addedCount > 0) {
      setNotice(`Added ${addedCount} email${addedCount === 1 ? "" : "s"} from known portal users. Click Save to persist.`);
    } else {
      setNotice("Member directory already includes all known portal user emails.");
    }
  };

  useEffect(() => {
    if (!session.isPresident) return;
    if (loading || accessLoading) return;
    if (knownUserEmails.length === 0) return;
    setEntries((prev) => mergeKnownEmails(prev, knownUserEmails).next);
  }, [session.isPresident, loading, accessLoading, knownUserEmails]);

  const addRow = () => setEntries((prev) => [...prev, emptyEntry()]);
  const removeRow = (idx: number) => setEntries((prev) => prev.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<MemberDirectoryEntry>) =>
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));

  const save = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await saveMemberDirectory({ entries: deduped });
      setNotice("Saved. Changes apply immediately to header names and greetings.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save member directory");
    } finally {
      setSaving(false);
    }
  };

  const setAccessRole = (emailRaw: string, key: AccessRoleKey, triState: string) => {
    const email = normalizeEmail(emailRaw);
    if (!email) return;
    setAccessNotice(null);
    setAccessError(null);
    setAccessOverridesByEmail((prev) => {
      const current = prev[email] ? { ...prev[email] } : emptyOverride(email);
      current[key] = triToFlag(triState);
      return { ...prev, [email]: current };
    });
  };

  const saveAccessControls = async () => {
    if (!session.isPresident) return;
    setAccessSaving(true);
    setAccessError(null);
    setAccessNotice(null);
    try {
      const directoryEmails = new Set(deduped.map((e) => normalizeEmail(e.email)).filter(Boolean));
      const nextOverrides: AccessOverrideEntry[] = [];

      for (const entry of existingOverrides) {
        const email = normalizeEmail(entry.email);
        if (!directoryEmails.has(email)) {
          nextOverrides.push(entry);
        }
      }

      for (const email of Array.from(directoryEmails)) {
        const candidate = accessOverridesByEmail[email] ? { ...accessOverridesByEmail[email] } : emptyOverride(email);
        candidate.email = email;
        if (hasAnyOverride(candidate)) nextOverrides.push(candidate);
      }

      const result = await saveSiteMaintenanceOverrides(nextOverrides);
      setExistingOverrides(result.entries || []);
      setAccessOverridesByEmail(
        Object.fromEntries(
          (result.entries || []).map((entry) => [normalizeEmail(entry.email), { ...emptyOverride(entry.email), ...entry }]),
        ),
      );
      setAccessNotice("Access role overrides saved. These apply after Cloudflare Access login.");
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : "Failed to save access controls.");
    } finally {
      setAccessSaving(false);
    }
  };

  return (
    <CouncilAdminGate>
      <div className="relative min-h-screen p-4 sm:p-8 max-w-6xl mx-auto">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-slate-500">
                <Users className="size-4 text-primary" />
                Site Administration
              </div>
              <h1 className="text-2xl sm:text-3xl text-slate-900 mt-2">Member Directory</h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Configure how member names + designations show in the header and the welcome animation.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {session.isPresident ? (
                <Button type="button" variant="outline" onClick={syncKnownUsersIntoDirectory} className="border-black/15 bg-white/5 text-slate-900">
                  <UserPlus className="size-4" />
                  Sync Known Users
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={addRow} className="border-black/15 bg-white/5 text-slate-900">
                <Plus className="size-4" />
                Add
              </Button>
              <Button type="button" onClick={save} disabled={saving} className="gap-2">
                <Save className="size-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 space-y-4">
          {notice ? (
            <Alert className="border-emerald-500/30 bg-emerald-500/10">
              <AlertDescription className="text-emerald-700">{notice}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert className="border-rose-500/30 bg-rose-500/10">
              <AlertTriangle className="size-4 text-rose-500" />
              <AlertDescription className="text-rose-700">{error}</AlertDescription>
            </Alert>
          ) : null}

          {session.isPresident ? (
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Shield className="size-4 text-primary" />
                  Access Controls (President)
                </CardTitle>
                <CardDescription>
                  Manage portal role access from here. This controls app roles after login. It does not replace Cloudflare Access allowlist enrollment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accessLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="size-4 animate-spin" />
                    Loading known users and role overrides...
                  </div>
                ) : null}
                {accessError ? (
                  <Alert className="border-rose-500/30 bg-rose-500/10">
                    <AlertTriangle className="size-4 text-rose-500" />
                    <AlertDescription className="text-rose-700">{accessError}</AlertDescription>
                  </Alert>
                ) : null}
                {accessNotice ? (
                  <Alert className="border-emerald-500/30 bg-emerald-500/10">
                    <AlertDescription className="text-emerald-700">{accessNotice}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="rounded-lg border border-black/10 bg-white/5 px-3 py-2 text-xs text-slate-600">
                  Known user emails are sourced from member directory entries, leadership records, saved role overrides, and authenticated portal activity.
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                  <span>{knownUserEmails.length} known user email{knownUserEmails.length === 1 ? "" : "s"} detected</span>
                  <Button type="button" variant="outline" onClick={saveAccessControls} disabled={accessSaving || accessLoading} className="border-black/15 bg-white/5 text-slate-900">
                    {accessSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {accessSaving ? "Saving..." : "Save Access Roles"}
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-black/10">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-black/10 bg-white/30">
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Council Admin</th>
                        <th className="px-3 py-2">Site Editor</th>
                        <th className="px-3 py-2">Treasury</th>
                        <th className="px-3 py-2">President</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deduped.map((row) => {
                        const email = normalizeEmail(row.email);
                        const override = accessOverridesByEmail[email] || emptyOverride(email);
                        const name = String(row.displayName || "").trim();
                        return (
                          <tr key={email || `row-${Math.random()}`} className="border-b border-black/5">
                            <td className="px-3 py-2">
                              <div className="font-medium text-slate-900">{name || email || "Unsaved row"}</div>
                              {name && email ? <div className="text-xs text-slate-500">{email}</div> : null}
                            </td>
                            {(["isCouncilAdmin", "isSiteEditor", "isTreasuryAdmin", "isPresident"] as AccessRoleKey[]).map((key) => (
                              <td key={`${email}-${key}`} className="px-3 py-2">
                                <select
                                  value={flagToTri(override[key])}
                                  onChange={(e) => setAccessRole(email, key, e.target.value)}
                                  disabled={!email || accessLoading || accessSaving}
                                  className="w-full rounded-md border border-black/10 bg-white/70 px-2 py-1 text-xs text-slate-900"
                                  aria-label={`${key} for ${email}`}
                                >
                                  <option value="default">Default</option>
                                  <option value="allow">Allow</option>
                                  <option value="deny">Deny</option>
                                </select>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      {deduped.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                            Add or sync member emails first to manage access here.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <CardHeader>
              <CardTitle className="text-slate-900">Members</CardTitle>
              <CardDescription>
                Use the exact Cloudflare Access login email. Designation is optional (ex: "Mr. President").
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

              {!loading && entries.length === 0 ? (
                <p className="text-sm text-slate-500">No entries yet. Click “Add”.</p>
              ) : null}

              <div className="space-y-4">
                {entries.map((e, idx) => (
                  <div key={`${idx}-${e.email}`} className="nphc-glass rounded-2xl border border-black/10 bg-white/60 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input
                          value={e.email}
                          onChange={(ev) => update(idx, { email: ev.target.value })}
                          placeholder="name@example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Display Name</Label>
                        <Input
                          value={e.displayName}
                          onChange={(ev) => update(idx, { displayName: ev.target.value })}
                          placeholder="Erskine"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Designation (optional)</Label>
                        <Input
                          value={e.designation || ""}
                          onChange={(ev) => update(idx, { designation: ev.target.value })}
                          placeholder="Mr. President"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button type="button" variant="outline" onClick={() => removeRow(idx)} className="border-black/15 bg-white/5 text-slate-900">
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CouncilAdminGate>
  );
}
