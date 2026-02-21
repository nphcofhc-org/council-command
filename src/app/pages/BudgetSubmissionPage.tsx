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

export function BudgetSubmissionPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [committee, setCommittee] = useState("");
  const [projectName, setProjectName] = useState("");
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [justification, setJustification] = useState("");
  const [lineItems, setLineItems] = useState("");
  const [supportingLink, setSupportingLink] = useState("");
  const [contactEmail, setContactEmail] = useState(session.email || "");

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        committee,
        projectName,
        fiscalYear,
        requestedAmount,
        neededBy,
        justification,
        lineItems,
        supportingLink,
        contactEmail,
      };
      const res = await submitForm("budget_submission", payload);
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
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Budget Submission</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Submit Proposed Budget</CardTitle>
              <CardDescription>
                Provide line items, justification, and supporting links (Drive/quotes) for review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Committee / Area</Label>
                  <Input value={committee} onChange={(e) => setCommittee(e.target.value)} placeholder="Service, Scholarship, Fundraising, Programs…" />
                </div>
                <div className="space-y-1">
                  <Label>Fiscal Year</Label>
                  <Input value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} placeholder="2026" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Project / Event Name</Label>
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Neighborhood Block Party (Back-to-School)" />
                </div>
                <div className="space-y-1">
                  <Label>Requested Amount (USD)</Label>
                  <Input value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} placeholder="5000" />
                </div>
                <div className="space-y-1">
                  <Label>Needed By (date)</Label>
                  <Input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Line Items (paste or list)</Label>
                <Textarea
                  value={lineItems}
                  onChange={(e) => setLineItems(e.target.value)}
                  placeholder={"Example:\n- Backpacks (100) @ $20 = $2,000\n- Permits/Insurance = $800\n- Marketing = $400"}
                  rows={6}
                />
              </div>

              <div className="space-y-1">
                <Label>Justification</Label>
                <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={5} placeholder="Why this spend is required and how it supports council priorities." />
              </div>

              <div className="space-y-1">
                <Label>Supporting Docs Link (Drive/quotes)</Label>
                <Input value={supportingLink} onChange={(e) => setSupportingLink(e.target.value)} placeholder="https://drive.google.com/…" />
              </div>

              <div className="space-y-1">
                <Label>Contact Email</Label>
                <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" />
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="w-full sm:w-auto">
                <Save className="mr-2 size-4" />
                {saving ? "Submitting…" : "Submit Budget"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
