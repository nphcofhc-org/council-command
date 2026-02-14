import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { submitForm, uploadReceipts, type UploadedReceipt } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";

function toMoneyNumber(value: string): number {
  const n = Number(String(value || "").trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export function ReimbursementRequestPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Required fields (matching the Google Form) ---
  const [email, setEmail] = useState(session.email || "");
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState(session.email || "");
  const [memberOrganization, setMemberOrganization] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const [airlineTotal, setAirlineTotal] = useState("0");
  const [lodgingTotal, setLodgingTotal] = useState("0");
  const [durationOfStay, setDurationOfStay] = useState("");
  const [groundTransportationTotal, setGroundTransportationTotal] = useState("0");
  const [registrationFeesTotal, setRegistrationFeesTotal] = useState("0");
  const [mealsTotal, setMealsTotal] = useState("0");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [otherExpensesTotal, setOtherExpensesTotal] = useState("0");

  const computedTotal = useMemo(() => {
    return (
      toMoneyNumber(airlineTotal) +
      toMoneyNumber(lodgingTotal) +
      toMoneyNumber(groundTransportationTotal) +
      toMoneyNumber(registrationFeesTotal) +
      toMoneyNumber(mealsTotal) +
      toMoneyNumber(otherExpensesTotal)
    );
  }, [
    airlineTotal,
    lodgingTotal,
    groundTransportationTotal,
    registrationFeesTotal,
    mealsTotal,
    otherExpensesTotal,
  ]);

  const [signature, setSignature] = useState("");

  // Uploads: optional if uploads aren't configured yet; we also accept Drive links.
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [receiptLinks, setReceiptLinks] = useState("");
  const [uploadedReceipts, setUploadedReceipts] = useState<UploadedReceipt[]>([]);

  const removeFile = (index: number) => {
    setReceiptFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    const required = [
      ["Email", email],
      ["Full Name", fullName],
      ["Email Address", emailAddress],
      ["Member Organization", memberOrganization],
      ["Event/Activity Name", eventName],
      ["Event Start Date", eventStartDate],
      ["Event End Date", eventEndDate],
      ["Purpose of Expenditure", purpose],
      ["Duration of Stay", durationOfStay],
      ["Signature", signature],
    ] as const;

    for (const [label, v] of required) {
      if (!String(v || "").trim()) return `${label} is required.`;
    }

    if (receiptFiles.length === 0 && !receiptLinks.trim()) {
      return "Upload receipts (preferred) or provide receipt link(s).";
    }

    if (receiptFiles.length > 5) return "Upload up to 5 files.";
    return null;
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (!session.authenticated) throw new Error("Unauthenticated. Please refresh and complete Access login.");

      const v = validate();
      if (v) throw new Error(v);

      let uploaded: UploadedReceipt[] = uploadedReceipts;
      if (receiptFiles.length > 0 && uploadedReceipts.length === 0) {
        // Upload on submit to keep the flow simple.
        try {
          uploaded = await uploadReceipts(receiptFiles);
          setUploadedReceipts(uploaded);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Receipt upload failed.";
          // If uploads aren't configured yet, allow a Drive link fallback.
          if (receiptLinks.trim()) {
            uploaded = [];
          } else {
            throw new Error(msg);
          }
        }
      }

      const payload = {
        email,
        fullName,
        emailAddress,
        memberOrganization,
        eventName,
        eventStartDate,
        eventEndDate,
        purpose,
        airlineTotal: toMoneyNumber(airlineTotal),
        lodgingTotal: toMoneyNumber(lodgingTotal),
        durationOfStay,
        groundTransportationTotal: toMoneyNumber(groundTransportationTotal),
        registrationFeesTotal: toMoneyNumber(registrationFeesTotal),
        mealsTotal: toMoneyNumber(mealsTotal),
        otherExpenses,
        otherExpensesTotal: toMoneyNumber(otherExpensesTotal),
        totalRequested: Math.round(computedTotal * 100) / 100,
        receiptFiles: uploaded,
        receiptLinks,
        signature,
        certify:
          "I certify that the information provided is true and accurate, and that these expenses were incurred in accordance with NPHC of Hudson County financial policies.",
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
            <h1 className="text-lg sm:text-xl font-extrabold text-black">Expense Reimbursement</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle>NPHC of Hudson County - Expense Reimbursement Form</CardTitle>
              <CardDescription>
                Please use this form to request reimbursement for expenses incurred on behalf of the NPHC of Hudson County.
                All requests must be accompanied by itemized receipts. Submissions will be reviewed by the Treasurer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-green-700 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-red-700 font-semibold">{error}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Email *</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-1">
                  <Label>Email Address *</Label>
                  <Input value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="you@email.com" />
                </div>
                <div className="space-y-1">
                  <Label>Member Organization *</Label>
                  <Input value={memberOrganization} onChange={(e) => setMemberOrganization(e.target.value)} placeholder="Organization" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Event/Activity Name *</Label>
                  <Input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder='e.g., "National Leadership Conference," "Regional Meeting," "Council Supply Purchase"'
                  />
                </div>
                <div className="space-y-1">
                  <Label>Event Start Date *</Label>
                  <Input value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} placeholder="YYYY-MM-DD" />
                </div>
                <div className="space-y-1">
                  <Label>Event End Date *</Label>
                  <Input value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} placeholder="YYYY-MM-DD" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Purpose of Expenditure *</Label>
                <Textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={4}
                  placeholder="Briefly describe how this expense benefits the NPHC of Hudson County."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Airline Total (Enter $0 if not applicable) *</Label>
                  <Input value={airlineTotal} onChange={(e) => setAirlineTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Lodging Total (Hotel / Airbnb) (Enter $0 if not applicable) *</Label>
                  <Input value={lodgingTotal} onChange={(e) => setLodgingTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Duration of Stay (e.g., "3 Nights, 4 Days" or "N/A") *</Label>
                  <Input value={durationOfStay} onChange={(e) => setDurationOfStay(e.target.value)} placeholder="N/A" />
                </div>
                <div className="space-y-1">
                  <Label>Rental Car / Ground Transportation (Uber, Lyft, Taxi) (Enter $0 if not applicable) *</Label>
                  <Input value={groundTransportationTotal} onChange={(e) => setGroundTransportationTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Event Registration Fees (Enter $0 if not applicable) *</Label>
                  <Input value={registrationFeesTotal} onChange={(e) => setRegistrationFeesTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Meals (Enter $0 if not applicable) *</Label>
                  <Input value={mealsTotal} onChange={(e) => setMealsTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Other Expenses Total (Enter $0 if not applicable) *</Label>
                  <Input value={otherExpensesTotal} onChange={(e) => setOtherExpensesTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Other Expenses (Itemize) *</Label>
                  <Textarea
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(e.target.value)}
                    rows={4}
                    placeholder='Please itemize any other costs, e.g., supplies, parking, tolls. Enter "$0" if not applicable.'
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-widest text-gray-500">Total Reimbursement Amount Requested *</p>
                <p className="text-lg font-extrabold text-black mt-1">${computedTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Auto-calculated as the sum of all totals above.</p>
              </div>

              <div className="space-y-2">
                <Label>Upload Receipts (up to 5 files) *</Label>
                <div className="rounded-lg border border-gray-200 p-3">
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*,.heic,.heif"
                    onChange={(e) => {
                      const list = Array.from(e.target.files || []);
                      setReceiptFiles(list.slice(0, 5));
                      setUploadedReceipts([]);
                    }}
                  />
                  <div className="mt-3 space-y-2">
                    {receiptFiles.map((f, idx) => (
                      <div key={`${f.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-white px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-black truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(f.size / 1024)} KB</p>
                        </div>
                        <button type="button" className="text-gray-500 hover:text-black" onClick={() => removeFile(idx)} aria-label="Remove file">
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                    {uploadedReceipts.length > 0 ? (
                      <p className="text-xs text-gray-500">
                        Uploaded {uploadedReceipts.length} file(s).
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  If uploads are not enabled yet, paste Google Drive links below as a temporary fallback.
                </p>
                <Input
                  value={receiptLinks}
                  onChange={(e) => setReceiptLinks(e.target.value)}
                  placeholder="Receipt links (Drive) — optional if you uploaded files above"
                />
              </div>

              <div className="space-y-1">
                <Label>Signature *</Label>
                <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full name" />
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="bg-black hover:bg-gray-900 w-full sm:w-auto">
                {receiptFiles.length > 0 ? <Upload className="mr-2 size-4" /> : <Save className="mr-2 size-4" />}
                {saving ? "Submitting…" : "Submit Reimbursement"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
