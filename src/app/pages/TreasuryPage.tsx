import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { BarChart3, Calculator, Check, Copy, DollarSign, Download, FileText, Landmark, Lock, Plus, RefreshCw, Save, ShieldCheck, Trash2, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useCouncilSession } from "../hooks/use-council-session";
import {
  fetchTreasuryData,
  fetchTreasuryReportingTools,
  saveTreasuryReportingTools,
  type TreasuryAccount,
  type TreasuryOnePagerRecord,
  type TreasuryPayload,
  type TreasuryReportingToolsState,
  type TreasuryStatementArchiveEntry,
  type TreasuryTransaction,
  type TreasuryTxnType,
} from "../data/treasury-api";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function monthKey(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  const keys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return keys[d.getMonth()] || "Unknown";
}

const PIE_COLORS = ["#18e0d0", "#22c55e", "#60a5fa", "#f59e0b", "#fb7185", "#a78bfa", "#f97316", "#34d399"];

const EMPTY_REPORTING: TreasuryReportingToolsState = {
  statements: [],
  onePagers: [],
};

const TREASURY_VOUCHER_STORAGE_KEY = "nphc-treasury-voucher-workflow-v1";

type VoucherNotification = {
  id: string;
  role: "treasurer" | "president" | "financial_secretary";
  title: string;
  message: string;
  createdAt: string;
  acknowledgedRoles?: Array<"treasurer" | "president" | "financial_secretary">;
};

function createVoucherNumber() {
  const random = Math.floor(Math.random() * 900) + 100;
  return `NPHCHC-${new Date().getFullYear()}-${random}`;
}

type StatementDraft = {
  account: "LendingClub" | "Cash App";
  label: string;
  periodStart: string;
  periodEnd: string;
  statementDate: string;
  url: string;
  openingBalance: string;
  closingBalance: string;
  notes: string;
};

function emptyStatementDraft(): StatementDraft {
  return {
    account: "LendingClub",
    label: "",
    periodStart: "",
    periodEnd: "",
    statementDate: "",
    url: "",
    openingBalance: "",
    closingBalance: "",
    notes: "",
  };
}

function amountOrNull(raw: string): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function isoDateSortDesc(a: string, b: string): number {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}

function latestStatementKey(s: TreasuryStatementArchiveEntry): string {
  return String(s.periodEnd || s.statementDate || s.periodStart || s.createdAt || "");
}

function buildTreasuryOnePagerText(params: {
  year: string;
  treasury: TreasuryPayload | null;
  yearTxnsAll: TreasuryTransaction[];
  recent30: TreasuryTransaction[];
  latestTxn: TreasuryTransaction | null;
  latestStatement: TreasuryStatementArchiveEntry | null;
}) {
  const { year, treasury, yearTxnsAll, recent30, latestTxn, latestStatement } = params;

  const income = yearTxnsAll.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
  const expenses = yearTxnsAll.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);
  const net = Math.round((income - expenses) * 100) / 100;
  const recentCredits = recent30.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
  const recentDebits = recent30.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);
  const recentNet = Math.round((recentCredits - recentDebits) * 100) / 100;

  const topExpenseCategories = Array.from(
    yearTxnsAll
      .filter((t) => t.type === "debit")
      .reduce((map, t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
        return map;
      }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const statementDelta =
    latestStatement && latestStatement.openingBalance !== null && latestStatement.closingBalance !== null
      ? Math.round((latestStatement.closingBalance - latestStatement.openingBalance) * 100) / 100
      : null;

  return [
    `Treasury One-Pager (${year})`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Current Balances",
    `- LendingClub: ${money(Number(treasury?.balances?.lendingClub || 0))}`,
    `- Cash App: ${money(Number(treasury?.balances?.cashApp || 0))}`,
    `- Total Cash On Hand: ${money(Number((treasury?.balances?.lendingClub || 0) + (treasury?.balances?.cashApp || 0)))}`,
    treasury?.asOfLabel ? `- Balance As-Of Note: ${treasury.asOfLabel}` : "",
    "",
    `${year} Transaction Summary (loaded dataset)`,
    `- Total Transactions: ${yearTxnsAll.length}`,
    `- Income: ${money(Math.round(income * 100) / 100)}`,
    `- Expenses: ${money(Math.round(expenses * 100) / 100)}`,
    `- Net Flow: ${money(Math.abs(net))} ${net >= 0 ? "Surplus" : "Deficit"}`,
    "",
    "Recent Activity (Last 30 Days from loaded transactions)",
    `- Transactions: ${recent30.length}`,
    `- Credits: ${money(Math.round(recentCredits * 100) / 100)}`,
    `- Debits: ${money(Math.round(recentDebits * 100) / 100)}`,
    `- Net: ${money(Math.abs(recentNet))} ${recentNet >= 0 ? "Positive" : "Negative"}`,
    latestTxn ? `- Latest Transaction: ${latestTxn.date} | ${latestTxn.account} | ${latestTxn.description} | ${latestTxn.type === "debit" ? "-" : "+"}${money(latestTxn.amount)}` : "- Latest Transaction: N/A",
    "",
    "Latest Statement Record",
    latestStatement
      ? `- ${latestStatement.account}: ${latestStatement.label}`
      : "- No statement record saved yet.",
    latestStatement?.periodStart ? `- Period Start: ${latestStatement.periodStart}` : "",
    latestStatement?.periodEnd ? `- Period End: ${latestStatement.periodEnd}` : "",
    latestStatement?.statementDate ? `- Statement Date: ${latestStatement.statementDate}` : "",
    latestStatement?.url ? `- Statement Link: ${latestStatement.url}` : "",
    statementDelta !== null ? `- Statement Balance Change: ${statementDelta >= 0 ? "+" : ""}${money(statementDelta)}` : "",
    latestStatement?.reconciled ? "- Reconciliation Status: Marked Reconciled" : latestStatement ? "- Reconciliation Status: Pending Review" : "",
    "",
    "Top Expense Categories",
    ...(
      topExpenseCategories.length
        ? topExpenseCategories.map(([name, value]) => `- ${name}: ${money(Math.round(value * 100) / 100)}`)
        : ["- No expense categories in current dataset."]
    ),
    "",
    "Deck Insert Note",
    "- Use this one-pager in the meeting deck treasury slide or presenter notes.",
    "- Refresh before the meeting to recalculate the latest transaction summary.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function TreasuryPage() {
  const { session, loading: sessionLoading } = useCouncilSession();
  const [treasury, setTreasury] = useState<TreasuryPayload | null>(null);
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [year, setYear] = useState<string>("2026");
  const [typeFilter, setTypeFilter] = useState<"all" | TreasuryTxnType>("all");
  const [accountFilter, setAccountFilter] = useState<"all" | TreasuryAccount>("all");
  const [search, setSearch] = useState<string>("");
  const [voucherRole, setVoucherRole] = useState<"treasurer" | "president" | "financial_secretary">("treasurer");
  const [voucherStatus, setVoucherStatus] = useState<"DRAFT" | "SUBMITTED" | "PRESIDENT_APPROVED" | "PAYMENT_SUBMITTED">("DRAFT");
  const [voucherNumber, setVoucherNumber] = useState(() => createVoucherNumber());
  const [voucherPayee, setVoucherPayee] = useState("");
  const [voucherMethod, setVoucherMethod] = useState("");
  const [voucherAmount, setVoucherAmount] = useState("");
  const [voucherPurpose, setVoucherPurpose] = useState("");
  const [voucherCashAppHandle, setVoucherCashAppHandle] = useState("");
  const [voucherPaymentLink, setVoucherPaymentLink] = useState("");
  const [voucherRecipientEmail, setVoucherRecipientEmail] = useState("");
  const [voucherRoutingNumber, setVoucherRoutingNumber] = useState("");
  const [voucherAccountNumber, setVoucherAccountNumber] = useState("");
  const [voucherMailingAddress, setVoucherMailingAddress] = useState("");
  const [treasurerSignatureAt, setTreasurerSignatureAt] = useState<string | null>(null);
  const [presidentSignatureAt, setPresidentSignatureAt] = useState<string | null>(null);
  const [finSecSubmittedAt, setFinSecSubmittedAt] = useState<string | null>(null);
  const [voucherFeedback, setVoucherFeedback] = useState<string | null>(null);
  const [voucherNotifications, setVoucherNotifications] = useState<VoucherNotification[]>([]);
  const [voucherHydrated, setVoucherHydrated] = useState(false);
  const [voucherNotificationModalOpen, setVoucherNotificationModalOpen] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (session.isTreasurer) {
      setVoucherRole("treasurer");
      return;
    }
    if (session.isPresident) {
      setVoucherRole("president");
      return;
    }
    if (session.isFinancialSecretary) {
      setVoucherRole("financial_secretary");
    }
  }, [session.isFinancialSecretary, session.isPresident, session.isTreasurer, sessionLoading]);

  useEffect(() => {
    const raw = window.localStorage.getItem(TREASURY_VOUCHER_STORAGE_KEY);
    if (!raw) {
      setVoucherHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<{
        voucherNumber: string;
        voucherStatus: "DRAFT" | "SUBMITTED" | "PRESIDENT_APPROVED" | "PAYMENT_SUBMITTED";
        voucherPayee: string;
        voucherMethod: string;
        voucherAmount: string;
        voucherPurpose: string;
        voucherCashAppHandle: string;
        voucherPaymentLink: string;
        voucherRecipientEmail: string;
        voucherRoutingNumber: string;
        voucherAccountNumber: string;
        voucherMailingAddress: string;
        treasurerSignatureAt: string | null;
        presidentSignatureAt: string | null;
        finSecSubmittedAt: string | null;
        voucherFeedback: string | null;
        voucherNotifications: VoucherNotification[];
      }>;
      if (parsed.voucherNumber) setVoucherNumber(parsed.voucherNumber);
      if (parsed.voucherStatus) setVoucherStatus(parsed.voucherStatus);
      if (typeof parsed.voucherPayee === "string") setVoucherPayee(parsed.voucherPayee);
      if (typeof parsed.voucherMethod === "string") setVoucherMethod(parsed.voucherMethod);
      if (typeof parsed.voucherAmount === "string") setVoucherAmount(parsed.voucherAmount);
      if (typeof parsed.voucherPurpose === "string") setVoucherPurpose(parsed.voucherPurpose);
      if (typeof parsed.voucherCashAppHandle === "string") setVoucherCashAppHandle(parsed.voucherCashAppHandle);
      if (typeof parsed.voucherPaymentLink === "string") setVoucherPaymentLink(parsed.voucherPaymentLink);
      if (typeof parsed.voucherRecipientEmail === "string") setVoucherRecipientEmail(parsed.voucherRecipientEmail);
      if (typeof parsed.voucherRoutingNumber === "string") setVoucherRoutingNumber(parsed.voucherRoutingNumber);
      if (typeof parsed.voucherAccountNumber === "string") setVoucherAccountNumber(parsed.voucherAccountNumber);
      if (typeof parsed.voucherMailingAddress === "string") setVoucherMailingAddress(parsed.voucherMailingAddress);
      if ("treasurerSignatureAt" in parsed) setTreasurerSignatureAt(parsed.treasurerSignatureAt || null);
      if ("presidentSignatureAt" in parsed) setPresidentSignatureAt(parsed.presidentSignatureAt || null);
      if ("finSecSubmittedAt" in parsed) setFinSecSubmittedAt(parsed.finSecSubmittedAt || null);
      if ("voucherFeedback" in parsed) setVoucherFeedback(parsed.voucherFeedback || null);
      if (Array.isArray(parsed.voucherNotifications)) setVoucherNotifications(parsed.voucherNotifications);
    } catch {
      window.localStorage.removeItem(TREASURY_VOUCHER_STORAGE_KEY);
    } finally {
      setVoucherHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!voucherHydrated) return;
    window.localStorage.setItem(
      TREASURY_VOUCHER_STORAGE_KEY,
      JSON.stringify({
        voucherNumber,
        voucherStatus,
        voucherPayee,
        voucherMethod,
        voucherAmount,
        voucherPurpose,
        voucherCashAppHandle,
        voucherPaymentLink,
        voucherRecipientEmail,
        voucherRoutingNumber,
        voucherAccountNumber,
        voucherMailingAddress,
        treasurerSignatureAt,
        presidentSignatureAt,
        finSecSubmittedAt,
        voucherFeedback,
        voucherNotifications,
      }),
    );
  }, [
    finSecSubmittedAt,
    presidentSignatureAt,
    treasurerSignatureAt,
    voucherAccountNumber,
    voucherAmount,
    voucherCashAppHandle,
    voucherFeedback,
    voucherHydrated,
    voucherMailingAddress,
    voucherMethod,
    voucherNotifications,
    voucherNumber,
    voucherPayee,
    voucherPaymentLink,
    voucherPurpose,
    voucherRecipientEmail,
    voucherRoutingNumber,
    voucherStatus,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (sessionLoading) return;
    if (!session.isTreasuryAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    void fetchTreasuryData()
      .then((data) => {
        if (cancelled) return;
        setTreasury(data.treasury);
        setTransactions(data.transactions);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load treasury data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session.isTreasuryAdmin, sessionLoading]);

  const lendingClubBalance = treasury?.balances?.lendingClub || 0;
  const cashAppBalance = treasury?.balances?.cashApp || 0;
  const totalBalance = lendingClubBalance + cashAppBalance;

  const yearTxns = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesYear = t.date.startsWith(year);
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesAccount = accountFilter === "all" || t.account === accountFilter;
      const matchesSearch = !needle || t.description.toLowerCase().includes(needle) || t.category.toLowerCase().includes(needle);
      return matchesYear && matchesType && matchesAccount && matchesSearch;
    }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [accountFilter, search, transactions, typeFilter, year]);

  const stats = useMemo(() => {
    const income = yearTxns.filter((t) => t.type === "credit").reduce((acc, t) => acc + t.amount, 0);
    const expenses = yearTxns.filter((t) => t.type === "debit").reduce((acc, t) => acc + t.amount, 0);
    return {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      net: Math.round((income - expenses) * 100) / 100,
      count: yearTxns.length,
    };
  }, [yearTxns]);

  const monthlyData = useMemo(() => {
    const order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const map = new Map<string, { name: string; Income: number; Expenses: number }>();
    for (const t of yearTxns) {
      const key = monthKey(t.date);
      const cur = map.get(key) || { name: key, Income: 0, Expenses: 0 };
      if (t.type === "credit") cur.Income += t.amount;
      else cur.Expenses += t.amount;
      map.set(key, cur);
    }
    return Array.from(map.values()).sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  }, [yearTxns]);

  const expenseBreakdown = useMemo(() => {
    const cats = new Map<string, number>();
    for (const t of yearTxns) {
      if (t.type !== "debit") continue;
      cats.set(t.category, (cats.get(t.category) || 0) + t.amount);
    }
    return Array.from(cats.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [yearTxns]);

  const years = ["2026", "2025", "2024", "2023"];

  const voucherMethodRequirement = useMemo(() => {
    if (voucherMethod === "Cash App") {
      const ok = Boolean(voucherCashAppHandle.trim() || voucherPaymentLink.trim());
      return {
        ok,
        message: "Add the recipient Cash App handle or payment link.",
      };
    }
    if (voucherMethod === "Zeffy") {
      const ok = Boolean(voucherRecipientEmail.trim());
      return {
        ok,
        message: "Add the billing contact email used for Zeffy remittance.",
      };
    }
    if (voucherMethod === "ACH") {
      const ok = Boolean(voucherRecipientEmail.trim() && voucherRoutingNumber.trim() && voucherAccountNumber.trim());
      return {
        ok,
        message: "Add ACH recipient email, routing number, and account number.",
      };
    }
    if (voucherMethod === "Business Bill Pay") {
      const ok = Boolean(voucherMailingAddress.trim() || voucherRecipientEmail.trim());
      return {
        ok,
        message: "Add a remittance address or billing contact email.",
      };
    }
    if (voucherMethod === "Check") {
      const ok = Boolean(voucherMailingAddress.trim());
      return {
        ok,
        message: "Add the mailing address for the check remittance.",
      };
    }
    return {
      ok: false,
      message: "Select a payment method.",
    };
  }, [voucherAccountNumber, voucherCashAppHandle, voucherMailingAddress, voucherMethod, voucherPaymentLink, voucherRecipientEmail, voucherRoutingNumber]);

  const voucherReadyToSubmit = Boolean(
    voucherPayee.trim() &&
    voucherMethod &&
    voucherPurpose.trim() &&
    Number(voucherAmount) > 0 &&
    voucherMethodRequirement.ok,
  );

  const pushVoucherNotifications = (notifications: Omit<VoucherNotification, "id" | "createdAt">[]) => {
    const createdAt = new Date().toLocaleString();
    setVoucherNotifications((current) => [
      ...notifications.map((item, idx) => ({
        ...item,
        id: `${Date.now()}-${idx}-${item.role}`,
        createdAt,
      })),
      ...current,
    ].slice(0, 18));
  };

  const resetVoucherWorkflow = () => {
    setVoucherNumber(createVoucherNumber());
    setVoucherStatus("DRAFT");
    setVoucherPayee("");
    setVoucherMethod("");
    setVoucherAmount("");
    setVoucherPurpose("");
    setVoucherCashAppHandle("");
    setVoucherPaymentLink("");
    setVoucherRecipientEmail("");
    setVoucherRoutingNumber("");
    setVoucherAccountNumber("");
    setVoucherMailingAddress("");
    setTreasurerSignatureAt(null);
    setPresidentSignatureAt(null);
    setFinSecSubmittedAt(null);
    setVoucherFeedback("New voucher is ready for submission.");
    setVoucherNotifications([]);
    setVoucherNotificationModalOpen(false);
  };

  const submitVoucherAsTreasurer = () => {
    if (!session.isTreasurer) {
      setVoucherFeedback("Only the Treasurer account can submit this voucher as Initiator.");
      return;
    }
    if (!voucherReadyToSubmit) {
      setVoucherFeedback(`Complete payee, method, amount, purpose, and payment details before submitting. ${voucherMethodRequirement.message}`);
      return;
    }
    const submittedAt = new Date().toLocaleString();
    setTreasurerSignatureAt(submittedAt);
    setVoucherStatus("SUBMITTED");
    setVoucherFeedback("Voucher submitted. President has been alerted for review, and the Treasurer confirmation is recorded on the timeline.");
    pushVoucherNotifications([
      {
        role: "treasurer",
        title: "Voucher initiated",
        message: `Voucher ${voucherNumber} was initiated and routed for President approval.`,
      },
      {
        role: "president",
        title: "Signature required",
        message: `Voucher ${voucherNumber} requires formal approval for ${voucherPayee || "this payee"}.`,
      },
    ]);
  };

  const countersignVoucherAsPresident = () => {
    if (!session.isPresident) {
      setVoucherFeedback("Only the President account can approve and release funds.");
      return;
    }
    if (voucherStatus !== "SUBMITTED") {
      setVoucherFeedback("Treasurer must submit the voucher before presidential countersignature.");
      return;
    }
    const approvedAt = new Date().toLocaleString();
    setPresidentSignatureAt(approvedAt);
    setVoucherStatus("PRESIDENT_APPROVED");
    setVoucherFeedback("President approval complete. Financial Secretary has been alerted to submit the payment.");
    pushVoucherNotifications([
      {
        role: "president",
        title: "Voucher approved",
        message: `Voucher ${voucherNumber} was formally approved at ${approvedAt}.`,
      },
      {
        role: "financial_secretary",
        title: "Payment submission required",
        message: `Voucher ${voucherNumber} is ready for payment submission.`,
      },
      {
        role: "treasurer",
        title: "Voucher approved",
        message: `Voucher ${voucherNumber} has cleared presidential approval.`,
      },
    ]);
  };

  const submitPaymentAsFinancialSecretary = () => {
    if (!session.isFinancialSecretary) {
      setVoucherFeedback("Only the Financial Secretary account can submit the payment after presidential approval.");
      return;
    }
    if (voucherStatus !== "PRESIDENT_APPROVED") {
      setVoucherFeedback("President approval is required before the Financial Secretary can submit the payment.");
      return;
    }
    const submittedAt = new Date().toLocaleString();
    setFinSecSubmittedAt(submittedAt);
    setVoucherStatus("PAYMENT_SUBMITTED");
    setVoucherFeedback("Payment submitted by the Financial Secretary and recorded as disbursed.");
    pushVoucherNotifications([
      {
        role: "financial_secretary",
        title: "Payment submitted",
        message: `Voucher ${voucherNumber} was paid and recorded at ${submittedAt}.`,
      },
      {
        role: "president",
        title: "Voucher paid",
        message: `Voucher ${voucherNumber} has been paid and logged by the Financial Secretary.`,
      },
      {
        role: "treasurer",
        title: "Voucher paid",
        message: `Voucher ${voucherNumber} has been submitted for payment and closed out.`,
      },
    ]);
  };

  const voucherTimeline = useMemo(() => {
    const rows: Array<{ title: string; detail: string; time: string | null; done: boolean }> = [
      {
        title: "Voucher initiated by Treasurer",
        detail: treasurerSignatureAt
          ? "Treasurer submitted the electronic disbursement voucher."
          : "Awaiting Treasurer submission.",
        time: treasurerSignatureAt,
        done: Boolean(treasurerSignatureAt),
      },
      {
        title: "President formal approval",
        detail: presidentSignatureAt
          ? "President approved the voucher for payment processing."
          : voucherStatus === "SUBMITTED"
            ? "President signature required."
            : "Pending prior step.",
        time: presidentSignatureAt,
        done: Boolean(presidentSignatureAt),
      },
      {
        title: "Financial Secretary payment submission",
        detail: finSecSubmittedAt
          ? "Financial Secretary submitted the payment and completed the disbursement step."
          : voucherStatus === "PRESIDENT_APPROVED"
            ? "Financial Secretary payment submission required."
            : "Pending prior step.",
        time: finSecSubmittedAt,
        done: Boolean(finSecSubmittedAt),
      },
    ];

    return rows;
  }, [finSecSubmittedAt, presidentSignatureAt, treasurerSignatureAt, voucherStatus]);

  const voucherNextAction = useMemo(() => {
    if (voucherStatus === "SUBMITTED") {
      return {
        role: "President",
        message: "President signature is required before payment can move forward.",
        activeForViewer: session.isPresident && voucherRole === "president",
      };
    }
    if (voucherStatus === "PRESIDENT_APPROVED") {
      return {
        role: "Financial Secretary",
        message: "Financial Secretary payment submission is required to complete this disbursement.",
        activeForViewer: session.isFinancialSecretary && voucherRole === "financial_secretary",
      };
    }
    if (voucherStatus === "PAYMENT_SUBMITTED") {
      return {
        role: "Completed",
        message: "Voucher workflow is complete.",
        activeForViewer: false,
      };
    }
    return {
      role: "Treasurer",
      message: "Treasurer initiation is required to start the voucher workflow.",
      activeForViewer: session.isTreasurer && voucherRole === "treasurer",
    };
  }, [session.isFinancialSecretary, session.isPresident, session.isTreasurer, voucherRole, voucherStatus]);

  const pendingVoucherNotification = useMemo(
    () =>
      voucherNotifications.find(
        (notification) =>
          notification.role === voucherRole &&
          !(notification.acknowledgedRoles || []).includes(voucherRole),
      ) || null,
    [voucherNotifications, voucherRole],
  );

  useEffect(() => {
    if (pendingVoucherNotification) setVoucherNotificationModalOpen(true);
  }, [pendingVoucherNotification]);

  const acknowledgeVoucherNotification = (notificationId: string, role: "treasurer" | "president" | "financial_secretary") => {
    setVoucherNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              acknowledgedRoles: Array.from(new Set([...(notification.acknowledgedRoles || []), role])),
            }
          : notification,
      ),
    );
  };

  const scrollToVoucher = () => {
    document.getElementById("electronic-disbursement-voucher")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!sessionLoading && !session.isTreasuryAdmin) {
    return (
      <div className="relative p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                Treasury access is restricted to the President, Treasurer, and Financial Secretary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                <Link to="/council-admin">Return to Council Command Center</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Dialog open={voucherNotificationModalOpen && !!pendingVoucherNotification} onOpenChange={setVoucherNotificationModalOpen}>
        <DialogContent className="max-w-md border border-black/10 bg-white">
          <DialogHeader>
            <DialogTitle>{pendingVoucherNotification?.title || "Voucher Notification"}</DialogTitle>
            <DialogDescription>
              {pendingVoucherNotification?.message || "A voucher update requires your review."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-black/10 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-widest text-slate-500">Routed to</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{pendingVoucherNotification?.role.replace("_", " ")}</p>
            <p className="mt-1 text-xs text-slate-500">{pendingVoucherNotification?.createdAt}</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (pendingVoucherNotification) acknowledgeVoucherNotification(pendingVoucherNotification.id, voucherRole);
                setVoucherNotificationModalOpen(false);
              }}
            >
              Dismiss
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pendingVoucherNotification) acknowledgeVoucherNotification(pendingVoucherNotification.id, voucherRole);
                setVoucherNotificationModalOpen(false);
                scrollToVoucher();
              }}
            >
              Open Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 size-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-px bg-primary" />
                <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Council Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Treasury Dashboard</h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                High-level financial snapshot and reporting tools.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
        {loading ? (
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="p-6 text-sm text-slate-600">Loading treasury data...</CardContent>
          </Card>
        ) : null}
        {loadError ? (
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="p-6 text-sm text-rose-300">{loadError}</CardContent>
          </Card>
        ) : null}

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="size-5" />
                  Current Balances
                </CardTitle>
                <CardDescription>Total cash on hand (LendingClub + Cash App).</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Total</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{money(totalBalance)}</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">LendingClub</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{money(lendingClubBalance)}</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Cash App</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{money(cashAppBalance)}</p>
                </div>
                <p className="text-xs text-slate-400 sm:col-span-3">
                  {treasury?.asOfLabel || ""}
                  {treasury?.liveMode ? ` • Live sync (${treasury?.liveSource || "ingest"})` : ""}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="size-5" />
                  Digital Payments
                </CardTitle>
                <CardDescription>Cash App quick link for collection.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">Cashtag</p>
                    <a href={treasury?.cashApp?.payUrl || "#"} target="_blank" rel="noreferrer" className="text-lg font-extrabold text-primary hover:underline">
                      {treasury?.cashApp?.cashtag || "$NPHCofHC"}
                    </a>
                  </div>
                  <img
                    src={treasury?.cashApp?.qrImageUrl || "/assets/cashapp-nphcofhc-qr.png"}
                    alt="Cash App QR Code"
                    className="size-24 rounded-xl border border-black/10 bg-white p-2"
                    loading="lazy"
                  />
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                >
                  <a href={treasury?.cashApp?.payUrl || "#"} target="_blank" rel="noreferrer">
                    Open Payment Link
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Electronic Payments & Voucher Controls
            </CardTitle>
            <CardDescription>Built to align incoming/outgoing electronic payment handling with bylaw-required officer oversight.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-black/10 bg-white/5 p-4 sm:p-5 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Receiving Electronic Payments (Incoming)</p>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li><strong>Financial Secretary</strong> receives all incoming funds and maintains receipts/transaction records.</li>
                  <li>After receipt, funds transfer to the <strong>Treasurer</strong> for bank deposit.</li>
                  <li>Itemized electronic revenue is included in the <strong>State of Council Financial Report</strong>.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-black/10 bg-white/5 p-4 sm:p-5 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Making Electronic Payments (Outgoing)</p>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>Treasurer issues payment <strong>only after an authorized voucher</strong> is submitted.</li>
                  <li><strong>President countersigns</strong> vouchers as the formal approval authority.</li>
                  <li><strong>Financial Secretary submits payment</strong> after presidential approval and records the disbursement.</li>
                  <li>Electronic methods must respect the council&apos;s <strong>multi-officer authorization protocol</strong>.</li>
                </ul>
              </div>
            </div>

            <div id="electronic-disbursement-voucher" className="rounded-xl border border-black/10 bg-white/5 p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Official Electronic Disbursement Voucher</p>
                  <p className="text-lg font-extrabold text-slate-900">Voucher #{voucherNumber}</p>
                  <p className="text-xs text-slate-500 mt-1">Electronic signatures and timestamps are preserved until a new voucher is started.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <div className="flex items-center gap-2">
                    Session
                    <select
                      value={voucherRole}
                      onChange={(e) => setVoucherRole(e.target.value as "treasurer" | "president" | "financial_secretary")}
                      className="rounded-md border border-black/15 bg-white px-2 py-1 text-[11px] text-slate-900"
                    >
                      {session.isTreasurer ? <option value="treasurer">Treasurer (Initiator)</option> : null}
                      {session.isPresident ? <option value="president">President (Approver)</option> : null}
                      {session.isFinancialSecretary ? <option value="financial_secretary">Financial Secretary (Payment Submission)</option> : null}
                    </select>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={resetVoucherWorkflow} className="h-8 border-black/15 bg-white text-[11px] text-slate-700">
                    Start New Voucher
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Payee Name</Label>
                  <Input value={voucherPayee} onChange={(e) => setVoucherPayee(e.target.value)} placeholder="Individual or entity" />
                </div>
                <div className="space-y-1">
                  <Label>Chapter Remittance Method</Label>
                  <select
                    value={voucherMethod}
                    onChange={(e) => setVoucherMethod(e.target.value)}
                    className="w-full rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="">Select method</option>
                    <option value="Cash App">Cash App</option>
                    <option value="Zeffy">Zeffy</option>
                    <option value="ACH">ACH Transfer</option>
                    <option value="Business Bill Pay">Business Bill Pay</option>
                    <option value="Check">Physical Check</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Amount (USD)</Label>
                  <Input value={voucherAmount} onChange={(e) => setVoucherAmount(e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Budget Link / Purpose (Manual for now)</Label>
                  <Textarea value={voucherPurpose} onChange={(e) => setVoucherPurpose(e.target.value)} rows={2} placeholder="Describe the budget purpose and supporting authority." />
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">Payment Destination Details</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {voucherMethod === "Cash App" ? (
                    <>
                      <div className="space-y-1">
                        <Label>Cash App Handle</Label>
                        <Input value={voucherCashAppHandle} onChange={(e) => setVoucherCashAppHandle(e.target.value)} placeholder="$cashtag" />
                      </div>
                      <div className="space-y-1">
                        <Label>Cash App Payment Link</Label>
                        <Input value={voucherPaymentLink} onChange={(e) => setVoucherPaymentLink(e.target.value)} placeholder="https://cash.app/..." />
                      </div>
                    </>
                  ) : null}
                  {voucherMethod === "Zeffy" ? (
                    <div className="space-y-1 md:col-span-2">
                      <Label>Billing Contact Email</Label>
                      <Input value={voucherRecipientEmail} onChange={(e) => setVoucherRecipientEmail(e.target.value)} type="email" placeholder="billing@example.org" />
                    </div>
                  ) : null}
                  {voucherMethod === "ACH" ? (
                    <>
                      <div className="space-y-1">
                        <Label>Recipient Email</Label>
                        <Input value={voucherRecipientEmail} onChange={(e) => setVoucherRecipientEmail(e.target.value)} type="email" placeholder="recipient@example.org" />
                      </div>
                      <div className="space-y-1">
                        <Label>Routing Number</Label>
                        <Input value={voucherRoutingNumber} onChange={(e) => setVoucherRoutingNumber(e.target.value)} placeholder="9-digit routing number" />
                      </div>
                      <div className="space-y-1">
                        <Label>Account Number</Label>
                        <Input value={voucherAccountNumber} onChange={(e) => setVoucherAccountNumber(e.target.value)} placeholder="Account number for transfer" />
                      </div>
                    </>
                  ) : null}
                  {voucherMethod === "Business Bill Pay" ? (
                    <>
                      <div className="space-y-1">
                        <Label>Billing Contact Email</Label>
                        <Input value={voucherRecipientEmail} onChange={(e) => setVoucherRecipientEmail(e.target.value)} type="email" placeholder="billing@example.org" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Remittance Address</Label>
                        <Textarea value={voucherMailingAddress} onChange={(e) => setVoucherMailingAddress(e.target.value)} rows={2} placeholder="Mailing address for bill pay remittance" />
                      </div>
                    </>
                  ) : null}
                  {voucherMethod === "Check" ? (
                    <div className="space-y-1 md:col-span-2">
                      <Label>Mailing Address</Label>
                      <Textarea value={voucherMailingAddress} onChange={(e) => setVoucherMailingAddress(e.target.value)} rows={2} placeholder="Address where the check should be mailed" />
                    </div>
                  ) : null}
                  {!voucherMethod ? (
                    <p className="text-sm text-slate-600 md:col-span-2">Select a payment method to show the required payment destination fields.</p>
                  ) : null}
                </div>
                <p className="mt-3 text-xs text-slate-500">{voucherMethodRequirement.message}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-dashed border-black/20 bg-white p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">1. Treasurer Submission</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {treasurerSignatureAt ? `Signed /s/ Authorized Treasurer • ${treasurerSignatureAt}` : "Electronic signature pending."}
                  </p>
                  <Button
                    type="button"
                    onClick={submitVoucherAsTreasurer}
                    className="mt-4 w-full"
                    disabled={!session.isTreasurer || voucherRole !== "treasurer" || voucherStatus !== "DRAFT"}
                  >
                    Submit for Presidential Approval
                  </Button>
                </div>
                <div className="rounded-lg border border-dashed border-black/20 bg-white p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">2. Presidential Approval</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {presidentSignatureAt ? `Signed /s/ Council President • ${presidentSignatureAt}` : "Awaiting Treasurer submission."}
                  </p>
                  <Button
                    type="button"
                    onClick={countersignVoucherAsPresident}
                    className="mt-4 w-full"
                    disabled={!session.isPresident || voucherRole !== "president" || voucherStatus !== "SUBMITTED"}
                  >
                    Formally Approve Voucher
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-black/20 bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">3. Financial Secretary Payment Submission</p>
                <p className="mt-2 text-sm text-slate-700">
                  {finSecSubmittedAt ? `Submitted /s/ Financial Secretary • ${finSecSubmittedAt}` : "Awaiting Financial Secretary payment submission."}
                </p>
                <div className="mt-4">
                  <Button
                    type="button"
                    onClick={submitPaymentAsFinancialSecretary}
                    className="w-full"
                    disabled={!session.isFinancialSecretary || voucherRole !== "financial_secretary" || voucherStatus !== "PRESIDENT_APPROVED"}
                  >
                    Submit Payment
                  </Button>
                </div>
              </div>

              <div className={`rounded-lg border p-4 ${voucherNextAction.activeForViewer ? "border-primary/40 bg-primary/10" : "border-black/10 bg-slate-50"}`}>
                <p className="text-xs uppercase tracking-widest text-slate-500">Action Alert</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{voucherNextAction.role}</p>
                <p className="mt-1 text-sm text-slate-700">{voucherNextAction.message}</p>
                {voucherNextAction.activeForViewer ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">Action required for this signed-in role.</p>
                ) : null}
              </div>

              <div className="rounded-lg border border-black/10 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Workflow Notifications</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setVoucherNotifications([])} className="h-8 border-black/15 bg-white text-xs text-slate-700">
                    Clear Feed
                  </Button>
                </div>
                <div className="mt-3 space-y-3">
                  {voucherNotifications.length ? voucherNotifications.map((notification) => {
                    const activeNotification = notification.role === voucherRole;
                    return (
                      <div key={notification.id} className={`rounded-lg border p-3 ${activeNotification ? "border-primary/40 bg-primary/10" : "border-black/10 bg-white"}`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                          <span className="rounded-full border border-black/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {notification.role.replace("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{notification.createdAt}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 border-black/15 bg-white text-xs text-slate-700"
                            onClick={() => {
                              acknowledgeVoucherNotification(notification.id, voucherRole);
                              scrollToVoucher();
                            }}
                          >
                            Review Voucher
                          </Button>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-slate-600">Notifications will populate here as the voucher is initiated, approved, and paid.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">Voucher Timeline</p>
                <div className="mt-3 space-y-3">
                  {voucherTimeline.map((item, idx) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${item.done ? "bg-primary text-primary-foreground" : "border border-black/15 bg-white text-slate-500"}`}>
                        {item.done ? <Check className="size-3.5" /> : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-700">{item.detail}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.time || "Pending"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-slate-50 p-3 text-xs uppercase tracking-wider text-slate-500">
                <span className="inline-flex items-center gap-1"><Landmark className="size-3.5" /> Status: {voucherStatus}</span>
                <span>Financial Secretary Record: {finSecSubmittedAt ? "Payment submitted" : "Awaiting payment submission"}</span>
              </div>

              {voucherFeedback ? <p className="text-sm font-medium text-slate-700">{voucherFeedback}</p> : null}
              <p className="text-xs text-slate-500">
                Governance note: LendingClub online banking, ACH, and bill pay are treated as cash management services and do not waive voucher authorization or multi-officer approval requirements.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Financial Dashboard
            </CardTitle>
            <CardDescription>Interactive summary of income and expenses by year. Detailed history is restricted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    y === year
                      ? "bg-primary text-primary-foreground border-primary/60"
                      : "bg-white/5 text-slate-800 border-black/15 hover:border-primary/60 hover:text-primary"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">Income ({year})</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{money(stats.income)}</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">Expenses ({year})</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{money(stats.expenses)}</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">Net Flow</p>
                <p className={`text-xl font-bold mt-1 ${stats.net >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {money(Math.abs(stats.net))} {stats.net >= 0 ? "Surplus" : "Deficit"}
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white/5 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">Monthly Cash Flow</p>
                    <p className="text-sm text-slate-500 mt-0.5">{stats.count} transactions</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-slate-800">
                    Income vs Expenses
                  </Badge>
                </div>

                <div className="h-[320px]">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.12)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                          tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          formatter={(v: any) => money(Number(v || 0))}
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.85)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12,
                            color: "white",
                            backdropFilter: "blur(10px)",
                          }}
                        />
                        <Legend formatter={(value) => <span className="text-slate-800">{value}</span>} />
                        <Bar dataKey="Income" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={52} />
                        <Bar dataKey="Expenses" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={52} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500">No data available for {year}.</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-white/5 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">Expense Breakdown</p>
                    <p className="text-sm text-slate-500 mt-0.5">Debits by category</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-slate-800">
                    {expenseBreakdown.length} categories
                  </Badge>
                </div>

                <div className="h-[320px]">
                  {expenseBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          stroke="rgba(0,0,0,0)"
                          strokeWidth={0}
                        >
                          {expenseBreakdown.map((_, idx) => (
                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => money(Number(v || 0))}
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.85)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12,
                            color: "white",
                            backdropFilter: "blur(10px)",
                          }}
                        />
                        <Legend
                          layout="vertical"
                          verticalAlign="bottom"
                          height={90}
                          wrapperStyle={{ fontSize: 12 }}
                          formatter={(value) => <span className="text-slate-800">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500">No expenses recorded for {year}.</div>
                  )}
                </div>
              </div>
            </div>

            {session.isTreasuryAdmin ? (
              <Accordion type="single" collapsible className="rounded-xl border border-black/10 bg-white/5 backdrop-blur-xl">
                <AccordionItem value="history" className="border-none">
                  <AccordionTrigger className="px-4 sm:px-6">
                    Detailed Transaction History
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-6 pb-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1 md:col-span-1">
                        <Label>Search</Label>
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Description or category" />
                      </div>
                      <div className="space-y-1 md:col-span-1">
                        <Label>Account</Label>
                        <select
                          value={accountFilter}
                          onChange={(e) => setAccountFilter(e.target.value as any)}
                          className="w-full rounded-md border border-black/15 bg-white/55 px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="all">All Accounts</option>
                          <option value="LendingClub">LendingClub</option>
                          <option value="Cash App">Cash App</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-1">
                        <Label>Type</Label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value as any)}
                          className="w-full rounded-md border border-black/15 bg-white/55 px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="all">All</option>
                          <option value="credit">Credits</option>
                          <option value="debit">Debits</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 overflow-auto rounded-lg border border-black/10">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5">
                          <tr className="text-xs uppercase tracking-widest text-slate-500">
                            <th className="p-3 font-semibold">Date</th>
                            <th className="p-3 font-semibold">Account</th>
                            <th className="p-3 font-semibold">Description</th>
                            <th className="p-3 font-semibold">Category</th>
                            <th className="p-3 font-semibold text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-sm">
                          {yearTxns.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-500">
                                No transactions found.
                              </td>
                            </tr>
                          ) : (
                            yearTxns.map((t) => (
                              <tr key={t.id} className="hover:bg-white/5">
                                <td className="p-3 text-slate-600 whitespace-nowrap">{t.date}</td>
                                <td className="p-3 text-slate-600">{t.account}</td>
                                <td className="p-3 text-slate-900 max-w-[420px] truncate" title={t.description}>
                                  {t.description}
                                </td>
                                <td className="p-3 text-slate-600">{t.category}</td>
                                <td className={`p-3 text-right font-semibold ${t.type === "credit" ? "text-emerald-300" : "text-rose-300"}`}>
                                  {t.type === "debit" ? "-" : "+"} {money(t.amount)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="rounded-xl border border-black/10 bg-white/5 p-4 text-sm text-slate-600">
                Detailed transaction history is restricted.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
