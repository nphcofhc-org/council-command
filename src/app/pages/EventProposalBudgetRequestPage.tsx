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

export function EventProposalBudgetRequestPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [requestorName, setRequestorName] = useState("");
  const [email, setEmail] = useState(session.email || "");
  const [organization, setOrganization] = useState("");
  const [eventName, setEventName] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [location, setLocation] = useState("");
  const [requestedBudget, setRequestedBudget] = useState("");
  const [purpose, setPurpose] = useState("");
  const [lineItems, setLineItems] = useState("");
  const [supportingLinks, setSupportingLinks] = useState("");

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        requestorName,
        email,
        organization,
        eventName,
        proposedDate,
        location,
        requestedBudget,
        purpose,
        lineItems,
        supportingLinks,
      };
      const res = await submitForm("event_proposal_budget_request", payload);
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
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Event Proposal &amp; Budget Request</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Submit a New Event Proposal</CardTitle>
              <CardDescription>
                Request approval for a proposed event and associated budget in one submission.
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
                  <Label>Organization / Chapter</Label>
                  <Input value={organization} onChange={(e) => setOrganization(e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Event Name</Label>
                  <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Proposed Date</Label>
                  <Input type="date" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Requested Budget (USD)</Label>
                  <Input value={requestedBudget} onChange={(e) => setRequestedBudget(e.target.value)} placeholder="2500" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Purpose & Expected Impact</Label>
                <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={5} />
              </div>
              <div className="space-y-1">
                <Label>Proposed Line Items</Label>
                <Textarea value={lineItems} onChange={(e) => setLineItems(e.target.value)} rows={5} />
              </div>
              <div className="space-y-1">
                <Label>Supporting Links (quotes, docs, flyers)</Label>
                <Textarea value={supportingLinks} onChange={(e) => setSupportingLinks(e.target.value)} rows={3} />
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="w-full sm:w-auto">
                <Save className="mr-2 size-4" />
                {saving ? "Submitting…" : "Submit Proposal"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
