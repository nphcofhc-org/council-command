import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Users, Save, Plus, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { fetchMemberDirectory, saveMemberDirectory } from "../data/admin-api";
import type { MemberDirectoryEntry } from "../data/member-directory";

function normalizeEmail(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function emptyEntry(): MemberDirectoryEntry {
  return { email: "", displayName: "", designation: "" };
}

export function CouncilMemberDirectoryPage() {
  const [entries, setEntries] = useState<MemberDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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

            <div className="flex items-center gap-2">
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

