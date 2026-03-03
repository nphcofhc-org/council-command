import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Clock3, Route, Save, ShieldCheck, Upload, UserCircle2, Wallet, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { submitForm, uploadReceipts, type UploadedReceipt } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";
import { useMemberProfile } from "../hooks/use-member-profile";
import { DIVINE_NINE_ORGANIZATIONS } from "../data/member-profile-api";

function toMoneyNumber(value: string): number {
  const n = Number(String(value || "").trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

type WorkflowStep = {
  role: "Member" | "Financial Secretary" | "Treasurer" | "President";
  status: "done" | "active" | "pending";
  detail: string;
};

export function ReimbursementRequestPage() {
  const { session } = useCouncilSession();
  const { profile } = useMemberProfile(session.authenticated);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Required fields (matching the Google Form) ---
  const [email, setEmail] = useState(session.email || "");
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState(session.email || "");
  const [memberOrganization, setMemberOrganization] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [preferredBudgetLine, setPreferredBudgetLine] = useState("");
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
  const [voucherId] = useState(`NPHC-V${Math.floor(1000 + Math.random() * 9000)}`);

  // Uploads: optional if uploads aren't configured yet; we also accept Drive links.
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [receiptLinks, setReceiptLinks] = useState("");
  const [uploadedReceipts, setUploadedReceipts] = useState<UploadedReceipt[]>([]);

  const [workflowStatus, setWorkflowStatus] = useState("Draft");

  const approvalRoute = useMemo(() => {
    const requested = Math.round(computedTotal * 100) / 100;
    return [
      "Financial Secretary Review",
      "Treasurer Verification",
      ...(requested >= 500 ? ["President Authorization"] : []),
    ];
  }, [computedTotal]);

  const workflowSteps = useMemo<WorkflowStep[]>(() => {
    const hasSubmitted = Boolean(message);
    return [
      {
        role: "Member",
        status: hasSubmitted ? "done" : "active",
        detail: hasSubmitted ? "Request submitted with receipts." : "Complete form and upload receipts.",
      },
      {
        role: "Financial Secretary",
        status: hasSubmitted ? "active" : "pending",
        detail: "Review budget line and supporting receipts.",
      },
      {
        role: "Treasurer",
        status: "pending",
        detail: "Verify funds and disbursement method.",
      },
      {
        role: "President",
        status: computedTotal >= 500 ? "pending" : "done",
        detail: computedTotal >= 500 ? "Final countersignature for high-value requests." : "Auto-skipped for requests under $500.",
      },
    ];
  }, [computedTotal, message]);

  useEffect(() => {
    if (session.email) {
      setEmail(session.email);
      setEmailAddress(session.email);
    }
  }, [session.email]);

  useEffect(() => {
    if (!profile.organization) return;
    if (!memberOrganization) setMemberOrganization(profile.organization);
  }, [memberOrganization, profile.organization]);

  const removeFile = (index: number) => {
    setReceiptFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    const required = [
      ["Email", email],
      ["Full Name", fullName],
      ["Email Address", emailAddress],
      ["Member Organization", memberOrganization],
      ["Payment Delivery", paymentDetails],
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
        voucherId,
        workflowStatus: "Awaiting Financial Secretary Review",
        approvalRoute,
        email,
        fullName,
        emailAddress,
        memberOrganization,
        paymentDetails,
        preferredBudgetLine,
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
      setWorkflowStatus("Awaiting Financial Secretary Review");
      setMessage(`Submitted. Tracking ID: ${res.id}. Routed to ${approvalRoute.join(" → ")}.`);
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
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Expense Reimbursement</h1>
          </div>
        </div>

        <Card className="border border-black/10 bg-white/5">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Voucher Tracking</p>
                <p className="text-base font-extrabold text-slate-900">{voucherId}</p>
              </div>
              <div className="rounded-md border border-blue-300/60 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">
                STATUS: {workflowStatus}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step) => (
                <div
                  key={step.role}
                  className={`rounded-lg border p-3 ${
                    step.status === "done"
                      ? "border-emerald-300 bg-emerald-50"
                      : step.status === "active"
                        ? "border-blue-300 bg-blue-50"
                        : "border-black/10 bg-white"
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    {step.role === "Member" ? <UserCircle2 className="size-3.5" /> : null}
                    {step.role === "Financial Secretary" ? <ShieldCheck className="size-3.5" /> : null}
                    {step.role === "Treasurer" ? <Wallet className="size-3.5" /> : null}
                    {step.role === "President" ? <CheckCircle2 className="size-3.5" /> : null}
                    {step.role}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Route className="size-3.5" /> Approval Routing
              </p>
              <p className="mt-1 text-sm text-slate-700">{approvalRoute.join(" → ")}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock3 className="size-3" /> Review teams can update progress in Council Admin → Submissions.
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>NPHC of Hudson County - Expense Reimbursement Form</CardTitle>
              <CardDescription>
                Please use this form to request reimbursement for expenses incurred on behalf of the NPHC of Hudson County.
                All requests must be accompanied by itemized receipts. Submissions will be reviewed by the Treasurer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm text-slate-700">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Bylaw Workflow Notice</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Outgoing electronic payments require a properly authorized voucher before funds move.</li>
                  <li>The President must countersign disbursement vouchers prior to release.</li>
                  <li>Financial Secretary receipt and ledger records remain required for electronic transactions.</li>
                </ul>
              </div>

              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}

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
                  <select
                    value={memberOrganization}
                    onChange={(e) => setMemberOrganization(e.target.value)}
                    className="w-full rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="">Select organization</option>
                    {DIVINE_NINE_ORGANIZATIONS.map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Payment Delivery ($Cashtag/ACH) *</Label>
                  <Input value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} placeholder="$cashapp or ACH details" />
                </div>
                <div className="space-y-1">
                  <Label>Preferred Budget Line (optional)</Label>
                  <Input value={preferredBudgetLine} onChange={(e) => setPreferredBudgetLine(e.target.value)} placeholder="Programming, Admin, Scholarship, etc." />
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
                  <Input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Event End Date *</Label>
                  <Input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
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
                  <Input type="number" step="0.01" min="0" value={airlineTotal} onChange={(e) => setAirlineTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Lodging Total (Hotel / Airbnb) (Enter $0 if not applicable) *</Label>
                  <Input type="number" step="0.01" min="0" value={lodgingTotal} onChange={(e) => setLodgingTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Duration of Stay (e.g., "3 Nights, 4 Days" or "N/A") *</Label>
                  <Input value={durationOfStay} onChange={(e) => setDurationOfStay(e.target.value)} placeholder="N/A" />
                </div>
                <div className="space-y-1">
                  <Label>Rental Car / Ground Transportation (Uber, Lyft, Taxi) (Enter $0 if not applicable) *</Label>
                  <Input type="number" step="0.01" min="0" value={groundTransportationTotal} onChange={(e) => setGroundTransportationTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Event Registration Fees (Enter $0 if not applicable) *</Label>
                  <Input type="number" step="0.01" min="0" value={registrationFeesTotal} onChange={(e) => setRegistrationFeesTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Meals (Enter $0 if not applicable) *</Label>
                  <Input type="number" step="0.01" min="0" value={mealsTotal} onChange={(e) => setMealsTotal(e.target.value)} inputMode="decimal" />
                </div>
                <div className="space-y-1">
                  <Label>Other Expenses Total (Enter $0 if not applicable) *</Label>
                  <Input type="number" step="0.01" min="0" value={otherExpensesTotal} onChange={(e) => setOtherExpensesTotal(e.target.value)} inputMode="decimal" />
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

              <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">Total Reimbursement Amount Requested *</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">${computedTotal.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">Auto-calculated as the sum of all totals above.</p>
              </div>

              <div className="space-y-2">
                <Label>Upload Receipts (up to 5 files) *</Label>
                <div className="rounded-lg border border-black/10 bg-white/5 p-3">
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
                      <div key={`${f.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-black/10 bg-white/55 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-slate-900 truncate">{f.name}</p>
                          <p className="text-xs text-slate-500">{Math.round(f.size / 1024)} KB</p>
                        </div>
                        <button type="button" className="text-slate-500 hover:text-primary transition-colors" onClick={() => removeFile(idx)} aria-label="Remove file">
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                    {uploadedReceipts.length > 0 ? (
                      <p className="text-xs text-slate-500">
                        Uploaded {uploadedReceipts.length} file(s).
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="text-xs text-slate-500">
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

              <Button onClick={submit} disabled={saving || !session.authenticated} className="w-full sm:w-auto">
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
