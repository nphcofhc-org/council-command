import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { BarChart3, CreditCard, DollarSign, Receipt, Wallet } from "lucide-react";
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useCouncilSession } from "../hooks/use-council-session";
import { TREASURY, TREASURY_TRANSACTIONS, type TreasuryAccount, type TreasuryTxnType } from "../data/treasury";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function monthKey(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  const keys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return keys[d.getMonth()] || "Unknown";
}

const PIE_COLORS = ["#18e0d0", "#22c55e", "#60a5fa", "#f59e0b", "#fb7185", "#a78bfa", "#f97316", "#34d399"];

export function TreasuryPage() {
  const { session } = useCouncilSession();

  const [year, setYear] = useState<string>("2026");
  const [typeFilter, setTypeFilter] = useState<"all" | TreasuryTxnType>("all");
  const [accountFilter, setAccountFilter] = useState<"all" | TreasuryAccount>("all");
  const [search, setSearch] = useState<string>("");

  const lendingClubBalance = TREASURY.balances.lendingClub;
  const cashAppBalance = TREASURY.balances.cashApp;
  const totalBalance = lendingClubBalance + cashAppBalance;

  const yearTxns = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return TREASURY_TRANSACTIONS.filter((t) => {
      const matchesYear = t.date.startsWith(year);
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesAccount = accountFilter === "all" || t.account === accountFilter;
      const matchesSearch = !needle || t.description.toLowerCase().includes(needle) || t.category.toLowerCase().includes(needle);
      return matchesYear && matchesType && matchesAccount && matchesSearch;
    }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [accountFilter, search, typeFilter, year]);

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

  return (
    <div className="relative">
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
                <span className="text-xs tracking-[0.2em] uppercase text-white/60">Treasury</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Treasury</h1>
              <p className="text-sm text-white/70 mt-2 max-w-3xl">
                High-level financial snapshot and reporting tools. Reimbursements and submissions are managed in the portal.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
            >
              <Link to="/forms/reimbursement">
                <Receipt className="mr-2 size-4" />
                Reimbursement Form
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
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
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Total</p>
                  <p className="text-2xl font-extrabold text-white mt-1">{money(totalBalance)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">LendingClub</p>
                  <p className="text-xl font-bold text-white mt-1">{money(lendingClubBalance)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Cash App</p>
                  <p className="text-xl font-bold text-white mt-1">{money(cashAppBalance)}</p>
                </div>
                <p className="text-xs text-white/45 sm:col-span-3">{TREASURY.asOfLabel}</p>
              </CardContent>
            </Card>

            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="size-5" />
                  Cash App
                </CardTitle>
                <CardDescription>Use for quick payments and collection.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">Cashtag</p>
                    <a href={TREASURY.cashApp.payUrl} target="_blank" rel="noreferrer" className="text-lg font-extrabold text-primary hover:underline">
                      {TREASURY.cashApp.cashtag}
                    </a>
                  </div>
                  <img
                    src={TREASURY.cashApp.qrImageUrl}
                    alt="Cash App QR Code"
                    className="size-24 rounded-xl border border-white/10 bg-white p-2"
                    loading="lazy"
                  />
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
                >
                  <a href={TREASURY.cashApp.payUrl} target="_blank" rel="noreferrer">
                    Open Cash App Link
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

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
                      : "bg-white/5 text-white/80 border-white/15 hover:border-primary/60 hover:text-primary"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-white/60">Income ({year})</p>
                <p className="text-xl font-bold text-white mt-1">{money(stats.income)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-white/60">Expenses ({year})</p>
                <p className="text-xl font-bold text-white mt-1">{money(stats.expenses)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-white/60">Net Flow</p>
                <p className={`text-xl font-bold mt-1 ${stats.net >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {money(Math.abs(stats.net))} {stats.net >= 0 ? "Surplus" : "Deficit"}
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">Monthly Cash Flow</p>
                    <p className="text-sm text-white/60 mt-0.5">{stats.count} transactions</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white/80">
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
                        <Legend formatter={(value) => <span className="text-white/80">{value}</span>} />
                        <Bar dataKey="Income" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={52} />
                        <Bar dataKey="Expenses" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={52} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-white/60">No data available for {year}.</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">Expense Breakdown</p>
                    <p className="text-sm text-white/60 mt-0.5">Debits by category</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white/80">
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
                          formatter={(value) => <span className="text-white/80">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-white/60">No expenses recorded for {year}.</div>
                  )}
                </div>
              </div>
            </div>

            {session.isCouncilAdmin ? (
              <Accordion type="single" collapsible className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <AccordionItem value="history" className="border-none">
                  <AccordionTrigger className="px-4 sm:px-6">
                    Detailed Transaction History (Council Admin)
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
                          className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
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
                          className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                        >
                          <option value="all">All</option>
                          <option value="credit">Credits</option>
                          <option value="debit">Debits</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 overflow-auto rounded-lg border border-white/10">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5">
                          <tr className="text-xs uppercase tracking-widest text-white/60">
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
                              <td colSpan={5} className="p-6 text-center text-white/60">
                                No transactions found.
                              </td>
                            </tr>
                          ) : (
                            yearTxns.map((t) => (
                              <tr key={t.id} className="hover:bg-white/5">
                                <td className="p-3 text-white/70 whitespace-nowrap">{t.date}</td>
                                <td className="p-3 text-white/70">{t.account}</td>
                                <td className="p-3 text-white max-w-[420px] truncate" title={t.description}>
                                  {t.description}
                                </td>
                                <td className="p-3 text-white/70">{t.category}</td>
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
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Detailed transaction history is restricted to Council Admins.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
