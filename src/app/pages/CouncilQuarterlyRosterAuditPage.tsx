import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckSquare, Loader2, Save, Users } from "lucide-react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  fetchMemberDirectory,
  fetchMembershipRosterAudit,
  saveMembershipRosterAudit,
  type MembershipRosterAuditEntry,
} from "../data/admin-api";

type AuditRow = MembershipRosterAuditEntry;

function sortRows(rows: AuditRow[]): AuditRow[] {
  return rows.slice().sort((a, b) => {
    const designationA = String(a.designation || "");
    const designationB = String(b.designation || "");
    if (designationA && designationB && designationA !== designationB) {
      const byDesignation = designationA.localeCompare(designationB);
      if (byDesignation !== 0) return byDesignation;
    }
    return String(a.displayName || "").localeCompare(String(b.displayName || ""));
  });
}

export function CouncilQuarterlyRosterAuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.all([fetchMemberDirectory(), fetchMembershipRosterAudit()])
      .then(([directoryRes, auditRes]) => {
        if (cancelled) return;
        const auditMap = new Map(
          (auditRes.data.entries || []).map((entry) => [entry.email.trim().toLowerCase(), entry]),
        );

        const directoryRows: AuditRow[] = (directoryRes.data.entries || [])
          .map((entry) => {
            const email = String(entry.email || "").trim().toLowerCase();
            if (!email) return null;
            const existing = auditMap.get(email);
            return {
              email,
              displayName: String(entry.displayName || "").trim() || email,
              designation: String(entry.designation || "").trim() || undefined,
              status: existing?.status === "remove" ? "remove" : "current",
            } satisfies AuditRow;
          })
          .filter(Boolean) as AuditRow[];

        setRows(sortRows(directoryRows));
        setUpdatedAt(auditRes.updatedAt);
        setUpdatedBy(auditRes.updatedBy);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load roster audit sheet.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const current = rows.filter((row) => row.status === "current").length;
    const remove = rows.filter((row) => row.status === "remove").length;
    return { total: rows.length, current, remove };
  }, [rows]);

  const setStatus = (email: string, status: "current" | "remove") => {
    setRows((prev) => prev.map((row) => (row.email === email ? { ...row, status } : row)));
    setError(null);
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await saveMembershipRosterAudit(rows);
      setRows(sortRows(result.data.entries));
      setUpdatedAt(result.updatedAt);
      setUpdatedBy(result.updatedBy);
      setMessage("Quarterly membership roster audit saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save roster audit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CouncilLeaderGate>
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
          >
            <Link to="/council-admin/attendance">
              <ArrowLeft className="size-4" />
              Back to Roll Call & Attendance
            </Link>
          </Button>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <CheckSquare className="size-6 text-primary" />
                Quarterly Membership Roster Update
              </CardTitle>
              <CardDescription>
                Secretary audit sheet: review all current members and mark whether each person remains a current member or should be removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">Total Members</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</p>
              </div>
              <div className="rounded-lg border border-emerald-300/40 bg-emerald-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-emerald-700">Current</p>
                <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.current}</p>
              </div>
              <div className="rounded-lg border border-amber-300/50 bg-amber-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-amber-700">Marked Remove</p>
                <p className="mt-1 text-2xl font-bold text-amber-800">{summary.remove}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="size-5 text-primary" />
                Membership Audit Sheet
              </CardTitle>
              <CardDescription>
                Checking &quot;Should Remove&quot; does not delete the member automatically. It flags them for follow-up cleanup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="size-4 animate-spin" />
                  Loading current member roster...
                </div>
              ) : null}

              {!loading && rows.length === 0 ? (
                <div className="rounded-lg border border-black/10 bg-white/5 p-4 text-sm text-slate-600">
                  No members found in the Member Directory yet. Add members in the Member Directory first, then return to run the quarterly audit.
                </div>
              ) : null}

              {!loading && rows.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-black/10">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-black/10 bg-white/25">
                        <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Name</th>
                        <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Email</th>
                        <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Designation</th>
                        <th className="px-3 py-2 text-center text-xs uppercase tracking-widest text-slate-500">Current Member</th>
                        <th className="px-3 py-2 text-center text-xs uppercase tracking-widest text-slate-500">Should Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.email} className="border-b border-black/5 bg-white/10">
                          <td className="px-3 py-3 font-medium text-slate-900">{row.displayName || row.email}</td>
                          <td className="px-3 py-3 text-slate-700">{row.email}</td>
                          <td className="px-3 py-3 text-slate-600">{row.designation || "—"}</td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              className="size-4 accent-emerald-600"
                              checked={row.status === "current"}
                              onChange={(e) => {
                                if (e.target.checked) setStatus(row.email, "current");
                              }}
                              aria-label={`Mark ${row.displayName || row.email} as current member`}
                              disabled={saving}
                            />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              className="size-4 accent-amber-600"
                              checked={row.status === "remove"}
                              onChange={(e) => {
                                if (e.target.checked) setStatus(row.email, "remove");
                              }}
                              aria-label={`Mark ${row.displayName || row.email} for removal`}
                              disabled={saving}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  {updatedAt
                    ? `Last saved ${new Date(updatedAt).toLocaleString()}${updatedBy ? ` by ${updatedBy}` : ""}`
                    : "No roster audit saved yet."}
                </p>
                <Button onClick={save} disabled={loading || saving || rows.length === 0} className="gap-2">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {saving ? "Saving..." : "Save Audit Sheet"}
                </Button>
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}
              {message ? (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </CouncilLeaderGate>
  );
}
