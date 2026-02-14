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

export function ReimbursementRequestPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [payeeName, setPayeeName] = useState("");
  const [payeeEmail, setPayeeEmail] = useState(session.email || "");
  const [expenseDate, setExpenseDate] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [receiptLink, setReceiptLink] = useState("");
  const [eventOrProgram, setEventOrProgram] = useState("");
  const [paymentPreference, setPaymentPreference] = useState("");

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        payeeName,
        payeeEmail,
        expenseDate,
        amount,
        category,
        description,
        receiptLink,
        eventOrProgram,
        paymentPreference,
        certify: true,
      };
      const res = await submitForm("reimbursement_request", payload);
      setMessage(`Submitted. Tracking ID: ${res.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Form</p>
            <h1 className="text-lg sm:text-xl font-extrabold text-black">Reimbursement Request</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle>Submit Out-of-Pocket Expenses</CardTitle>
              <CardDescription>
                Submit receipts via a Drive link. The treasurer/finance team will review and update the status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-green-700 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-red-700 font-semibold">{error}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Payee Name</Label>
                  <Input value={payeeName} onChange={(e) => setPayeeName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-1">
                  <Label>Payee Email</Label>
                  <Input value={payeeEmail} onChange={(e) => setPayeeEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div className="space-y-1">
                  <Label>Expense Date</Label>
                  <Input value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} placeholder="2026-02-01" />
                </div>
                <div className="space-y-1">
                  <Label>Amount (USD)</Label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="125.50" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Supplies, Printing, Food, Transportation…" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Event / Program (if applicable)</Label>
                  <Input value={eventOrProgram} onChange={(e) => setEventOrProgram(e.target.value)} placeholder="Program name" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="What was purchased and why." />
              </div>

              <div className="space-y-1">
                <Label>Receipt Link (Drive)</Label>
                <Input value={receiptLink} onChange={(e) => setReceiptLink(e.target.value)} placeholder="https://drive.google.com/…" />
              </div>

              <div className="space-y-1">
                <Label>Payment Preference (optional)</Label>
                <Input value={paymentPreference} onChange={(e) => setPaymentPreference(e.target.value)} placeholder="Zelle, check, etc." />
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="bg-black hover:bg-gray-900 w-full sm:w-auto">
                <Save className="mr-2 size-4" />
                {saving ? "Submitting…" : "Submit Request"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

