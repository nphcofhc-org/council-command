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
  return key;
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
    <div className="bg-white">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={load} disabled={!session.authenticated || loading}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>Status and review notes for your submitted requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You must be authenticated to view submissions.
                </div>
              ) : null}
              {error ? <p className="text-sm text-red-700 font-semibold">{error}</p> : null}
              {loading ? <p className="text-sm text-gray-500">Loading…</p> : null}

              {rows.length === 0 && session.authenticated && !loading ? (
                <p className="text-sm text-gray-500">No submissions yet.</p>
              ) : null}

              <div className="space-y-2">
                {rows.map((r) => (
                  <div key={r.id} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-black">{labelForFormKey(r.formKey)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Submitted: {new Date(r.createdAt).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 break-all">ID: {r.id}</p>
                      </div>
                      <p className="text-xs font-semibold text-black border border-gray-200 rounded-md px-2 py-1 w-fit">
                        {r.status}
                      </p>
                    </div>
                    {r.reviewNotes ? (
                      <div className="mt-3 rounded-md bg-gray-50 border border-gray-100 p-3">
                        <p className="text-xs uppercase tracking-widest text-gray-500">Review Notes</p>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.reviewNotes}</p>
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

