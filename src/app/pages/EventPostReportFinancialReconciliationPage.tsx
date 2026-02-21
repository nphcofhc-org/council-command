import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { submitForm } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";

export function EventPostReportFinancialReconciliationPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [requestorName, setRequestorName] = useState("");
  const [email, setEmail] = useState(session.email || "");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [attendanceCount, setAttendanceCount] = useState("");
  const [budgetApproved, setBudgetApproved] = useState("");
  const [actualSpend, setActualSpend] = useState("");
  const [reconciliationNotes, setReconciliationNotes] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [followUpActions, setFollowUpActions] = useState("");
  const [supportingLinks, setSupportingLinks] = useState("");

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        requestorName,
        email,
        eventName,
        eventDate,
        attendanceCount,
        budgetApproved,
        actualSpend,
        reconciliationNotes,
        outcomes,
        followUpActions,
        supportingLinks,
      };
      const res = await submitForm("event_post_report_financial_reconciliation", payload);
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
          <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Form</p>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Event Post-Report &amp; Financial Reconciliation</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Close Out Event Outcomes &amp; Financials</CardTitle>
              <CardDescription>
                Submit final attendance, outcomes, and reconciliation details after each event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Requestor Name</Label>
                  <Input value={requestorName} onChange={(e) => setRequestorName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Event Name</Label>
                  <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Event Date</Label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Attendance Count</Label>
                  <Input value={attendanceCount} onChange={(e) => setAttendanceCount(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Approved Budget (USD)</Label>
                  <Input value={budgetApproved} onChange={(e) => setBudgetApproved(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Actual Spend (USD)</Label>
                  <Input value={actualSpend} onChange={(e) => setActualSpend(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Reconciliation Notes</Label>
                <Textarea value={reconciliationNotes} onChange={(e) => setReconciliationNotes(e.target.value)} rows={4} />
              </div>
              <div className="space-y-1">
                <Label>Outcomes & Impact</Label>
                <Textarea value={outcomes} onChange={(e) => setOutcomes(e.target.value)} rows={4} />
              </div>
              <div className="space-y-1">
                <Label>Follow-Up Actions</Label>
                <Textarea value={followUpActions} onChange={(e) => setFollowUpActions(e.target.value)} rows={4} />
              </div>
              <div className="space-y-1">
                <Label>Supporting Links (receipts, gallery, reports)</Label>
                <Textarea value={supportingLinks} onChange={(e) => setSupportingLinks(e.target.value)} rows={3} />
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="w-full sm:w-auto">
                <Save className="mr-2 size-4" />
                {saving ? "Submitting…" : "Submit Post-Report"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
