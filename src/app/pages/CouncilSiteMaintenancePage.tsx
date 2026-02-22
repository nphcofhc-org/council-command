import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ClipboardCheck,
  Database,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Home,
  Inbox,
  Loader2,
  Mail,
  Presentation,
  Save,
  Shield,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { PresidentGate } from "../components/PresidentGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { motion } from "motion/react";
import type { AccessOverrideEntry, ChapterDuesEntry } from "../data/admin-api";
import {
  fetchChapterDuesTracker,
  fetchLeadershipContent,
  fetchSiteMaintenancePayload,
  saveChapterDuesTracker,
  saveSiteMaintenanceOverrides,
} from "../data/admin-api";
import { fetchSiteConfig } from "../data/api";
import { saveSiteConfigOverride } from "../data/content-api";
import type { SiteConfig } from "../data/types";
import { useCouncilSession } from "../hooks/use-council-session";
import { fetchSubmissionsAsAdmin } from "../data/forms-api";
import { fetchTreasuryData, type TreasuryPayload } from "../data/treasury-api";

type AccessKey = "councilAdmin" | "treasuryAdmin" | "president";
type AccessMatrix = Record<AccessKey, Record<string, boolean>>;

type OfficerColumn = {
  email: string;
  name: string;
  title: string;
};

const ACCESS_ITEMS: Array<{ key: AccessKey; label: string; description: string }> = [
  {
    key: "councilAdmin",
    label: "Council Command Center",
    description: "Access to council leadership workspace and meeting deck controls.",
  },
  {
    key: "treasuryAdmin",
    label: "Treasury Dashboard",
    description: "Access to restricted financial data and treasury controls.",
  },
  {
    key: "president",
    label: "The President's Desk",
    description: "President-only controls for role policy, activity metrics, and site administration.",
  },
];

const EMPTY_METRICS = {
  pageViews24h: 0,
  pageViews7d: 0,
  distinctUsers7d: 0,
  activeUsers15m: 0,
  topPages7d: [] as Array<{ path: string; hits: number }>,
  recentActivity: [] as Array<{ email: string | null; eventType: string; path: string | null; createdAt: string | null }>,
};

function createEmptyMatrix(): AccessMatrix {
  return {
    councilAdmin: {},
    treasuryAdmin: {},
    president: {},
  };
}

function normalizeEmail(value: string | null | undefined): string {
  return String(value || "").trim().toLowerCase();
}

function normalizeTitle(value: string | null | undefined): string {
  return String(value || "").trim().toLowerCase();
}

function baseAccessForTitle(titleRaw: string): Record<AccessKey, boolean> {
  const title = normalizeTitle(titleRaw);
  const isPresident = title === "president";
  const isTreasuryRole = isPresident || title === "treasurer" || title === "financial secretary";
  return {
    councilAdmin: true,
    treasuryAdmin: isTreasuryRole,
    president: isPresident,
  };
}

function readOverrideFlag(entry: AccessOverrideEntry | undefined, key: AccessKey): boolean | null {
  if (!entry) return null;
  if (key === "councilAdmin") return entry.isCouncilAdmin;
  if (key === "treasuryAdmin") return entry.isTreasuryAdmin;
  return entry.isPresident;
}

function setOverrideFlag(entry: AccessOverrideEntry, key: AccessKey, value: boolean | null) {
  if (key === "councilAdmin") entry.isCouncilAdmin = value;
  if (key === "treasuryAdmin") entry.isTreasuryAdmin = value;
  if (key === "president") entry.isPresident = value;
}

function hasAnyExplicitOverride(entry: AccessOverrideEntry): boolean {
  return (
    entry.isCouncilAdmin !== null ||
    entry.isTreasuryAdmin !== null ||
    entry.isPresident !== null ||
    String(entry.note || "").trim().length > 0
  );
}

export function CouncilSiteMaintenancePage() {
  const { session } = useCouncilSession();
  const [officers, setOfficers] = useState<OfficerColumn[]>([]);
  const [missingOfficerEmails, setMissingOfficerEmails] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<AccessMatrix>(createEmptyMatrix());
  const [baseMatrix, setBaseMatrix] = useState<AccessMatrix>(createEmptyMatrix());
  const [existingOverrides, setExistingOverrides] = useState<AccessOverrideEntry[]>([]);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [commandVisibilityConfig, setCommandVisibilityConfig] = useState<SiteConfig | null>(null);
  const [commandVisibilityLoading, setCommandVisibilityLoading] = useState(true);
  const [commandVisibilitySaving, setCommandVisibilitySaving] = useState(false);
  const [commandVisibilityError, setCommandVisibilityError] = useState<string | null>(null);
  const [commandVisibilityMessage, setCommandVisibilityMessage] = useState<string | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [treasury, setTreasury] = useState<TreasuryPayload | null>(null);
  const [chapterDuesEntries, setChapterDuesEntries] = useState<ChapterDuesEntry[]>([]);
  const [chapterDuesLoading, setChapterDuesLoading] = useState(true);
  const [chapterDuesSaving, setChapterDuesSaving] = useState(false);
  const [chapterDuesError, setChapterDuesError] = useState<string | null>(null);
  const [chapterDuesMessage, setChapterDuesMessage] = useState<string | null>(null);
  const [chapterDuesUpdatedAt, setChapterDuesUpdatedAt] = useState<string | null>(null);
  const [chapterDuesUpdatedBy, setChapterDuesUpdatedBy] = useState<string | null>(null);

  const normalizeCommandVisibility = (cfg: SiteConfig): SiteConfig => ({
    ...cfg,
    showCouncilCommandOperations: cfg.showCouncilCommandOperations ?? true,
    showCouncilCommandTreasury: cfg.showCouncilCommandTreasury ?? true,
    showCouncilCommandPresidentsDesk: cfg.showCouncilCommandPresidentsDesk ?? true,
    showCouncilCommandContentManager: cfg.showCouncilCommandContentManager ?? true,
    showCouncilCommandEditors: cfg.showCouncilCommandEditors ?? true,
    showCouncilCommandMemberDirectory: cfg.showCouncilCommandMemberDirectory ?? true,
    showCouncilCommandSubmissions: cfg.showCouncilCommandSubmissions ?? true,
    showCouncilCommandNotifications: cfg.showCouncilCommandNotifications ?? true,
    showCouncilCommandInternalDocuments: cfg.showCouncilCommandInternalDocuments ?? true,
    showCouncilCommandTaskTracker: cfg.showCouncilCommandTaskTracker ?? true,
    meetingDeckLive: cfg.meetingDeckLive ?? false,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [payload, leadership] = await Promise.all([
        fetchSiteMaintenancePayload(),
        fetchLeadershipContent().catch(() => null),
      ]);

      const leadershipRows = leadership?.found ? leadership.data.executiveBoard : [];
      const cols: OfficerColumn[] = [];
      const missing: string[] = [];

      for (const row of leadershipRows || []) {
        const email = normalizeEmail((row as any)?.email);
        const name = String((row as any)?.name || "").trim();
        const title = String((row as any)?.title || "").trim();
        if (!email) {
          if (name || title) missing.push(`${name || "Unnamed"}${title ? ` (${title})` : ""}`);
          continue;
        }
        cols.push({ email, name: name || email, title: title || "Officer" });
      }

      // Fallback if leadership records are unavailable: use known authenticated users.
      if (cols.length === 0) {
        for (const email of payload.knownUsers || []) {
          const normalized = normalizeEmail(email);
          if (!normalized) continue;
          cols.push({ email: normalized, name: normalized, title: "Officer" });
        }
      }

      const uniqueByEmail = new Map<string, OfficerColumn>();
      for (const c of cols) {
        if (!uniqueByEmail.has(c.email)) uniqueByEmail.set(c.email, c);
      }
      const officerColumns = Array.from(uniqueByEmail.values());
      setOfficers(officerColumns);
      setMissingOfficerEmails(missing);
      setExistingOverrides(payload.overrides || []);
      setMetrics(payload.metrics || EMPTY_METRICS);

      const overrideByEmail = new Map(
        (payload.overrides || []).map((entry) => [normalizeEmail(entry.email), entry]),
      );

      const nextBase = createEmptyMatrix();
      const nextMatrix = createEmptyMatrix();

      for (const officer of officerColumns) {
        const base = baseAccessForTitle(officer.title);
        const override = overrideByEmail.get(officer.email);
        for (const item of ACCESS_ITEMS) {
          nextBase[item.key][officer.email] = base[item.key];
          const overrideFlag = readOverrideFlag(override, item.key);
          nextMatrix[item.key][officer.email] = overrideFlag === null ? base[item.key] : overrideFlag;
        }
      }

      setBaseMatrix(nextBase);
      setMatrix(nextMatrix);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load site maintenance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCommandVisibilityLoading(true);
    setCommandVisibilityError(null);
    void fetchSiteConfig()
      .then((cfg) => {
        if (cancelled) return;
        setCommandVisibilityConfig(normalizeCommandVisibility(cfg));
      })
      .catch((err) => {
        if (cancelled) return;
        setCommandVisibilityError(err instanceof Error ? err.message : "Failed to load Council Command topic visibility.");
      })
      .finally(() => {
        if (!cancelled) setCommandVisibilityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!session.isCouncilAdmin) return;
    void fetchSubmissionsAsAdmin({ status: "Submitted", limit: 200 })
      .then((rows) => {
        if (!cancelled) setPendingSubmissions(rows.length);
      })
      .catch(() => {
        if (!cancelled) setPendingSubmissions(0);
      });
    return () => {
      cancelled = true;
    };
  }, [session.isCouncilAdmin]);

  useEffect(() => {
    let cancelled = false;
    if (!session.isTreasuryAdmin) return;
    void fetchTreasuryData()
      .then((payload) => {
        if (!cancelled) setTreasury(payload.treasury);
      })
      .catch(() => {
        if (!cancelled) setTreasury(null);
      });
    return () => {
      cancelled = true;
    };
  }, [session.isTreasuryAdmin]);

  useEffect(() => {
    let cancelled = false;
    setChapterDuesLoading(true);
    setChapterDuesError(null);
    void fetchChapterDuesTracker()
      .then((res) => {
        if (cancelled) return;
        setChapterDuesEntries(Array.isArray(res.data?.entries) ? res.data.entries : []);
        setChapterDuesUpdatedAt(res.updatedAt);
        setChapterDuesUpdatedBy(res.updatedBy);
      })
      .catch((err) => {
        if (cancelled) return;
        setChapterDuesError(err instanceof Error ? err.message : "Failed to load chapter dues tracker.");
      })
      .finally(() => {
        if (!cancelled) setChapterDuesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(matrix) !== JSON.stringify(baseMatrix),
    [matrix, baseMatrix],
  );

  const setAccess = (key: AccessKey, email: string, checked: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [email]: checked,
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const officerEmails = new Set(officers.map((o) => normalizeEmail(o.email)).filter(Boolean));

      const matrixOverrides: AccessOverrideEntry[] = [];
      for (const officer of officers) {
        const email = normalizeEmail(officer.email);
        if (!email) continue;

        const entry: AccessOverrideEntry = {
          email,
          isCouncilAdmin: null,
          isTreasuryAdmin: null,
          isSiteEditor: null,
          isPresident: null,
          note: "",
        };

        for (const item of ACCESS_ITEMS) {
          const base = Boolean(baseMatrix[item.key][email]);
          const current = Boolean(matrix[item.key][email]);
          if (base === current) continue;
          setOverrideFlag(entry, item.key, current);
        }

        if (hasAnyExplicitOverride(entry)) {
          matrixOverrides.push(entry);
        }
      }

      // Preserve overrides for non-officer users that are not part of this matrix.
      const passthrough = existingOverrides.filter((entry) => !officerEmails.has(normalizeEmail(entry.email)));
      const result = await saveSiteMaintenanceOverrides([...passthrough, ...matrixOverrides]);
      setUpdatedAt(result.updatedAt);
      setUpdatedBy(result.updatedBy);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save access matrix.");
    } finally {
      setSaving(false);
    }
  };

  const setCommandVisibility = (key: keyof SiteConfig, checked: boolean) => {
    setCommandVisibilityConfig((prev) => (prev ? { ...prev, [key]: checked } : prev));
    setCommandVisibilityMessage(null);
    setCommandVisibilityError(null);
  };

  const saveCommandVisibility = async () => {
    if (!commandVisibilityConfig) return;
    setCommandVisibilitySaving(true);
    setCommandVisibilityError(null);
    setCommandVisibilityMessage(null);
    try {
      const result = await saveSiteConfigOverride(commandVisibilityConfig);
      setCommandVisibilityConfig(normalizeCommandVisibility(result.data));
      setCommandVisibilityMessage("Council Command topic visibility saved.");
    } catch (err) {
      setCommandVisibilityError(err instanceof Error ? err.message : "Failed to save Council Command topic visibility.");
    } finally {
      setCommandVisibilitySaving(false);
    }
  };

  const updateChapterDuesDate = (entryId: string, paidDate: string) => {
    setChapterDuesEntries((prev) =>
      prev.map((row) => (row.id === entryId ? { ...row, paidDate } : row)),
    );
    setChapterDuesError(null);
    setChapterDuesMessage(null);
  };

  const clearChapterDuesDate = (entryId: string) => {
    updateChapterDuesDate(entryId, "");
  };

  const saveChapterDues = async () => {
    setChapterDuesSaving(true);
    setChapterDuesError(null);
    setChapterDuesMessage(null);
    try {
      const result = await saveChapterDuesTracker(chapterDuesEntries);
      setChapterDuesEntries(result.data.entries);
      setChapterDuesUpdatedAt(result.updatedAt);
      setChapterDuesUpdatedBy(result.updatedBy);
      setChapterDuesMessage("Chapter dues payment dates saved.");
    } catch (err) {
      setChapterDuesError(err instanceof Error ? err.message : "Failed to save chapter dues tracker.");
    } finally {
      setChapterDuesSaving(false);
    }
  };

  const treasuryTotal =
    (treasury?.balances?.lendingClub || 0) +
    (treasury?.balances?.cashApp || 0) +
    (treasury?.balances?.paypal || 0);

  return (
    <PresidentGate>
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
          >
            <Link to="/council-admin">
              <ArrowLeft className="size-4" />
              Back to Council Command Center
            </Link>
          </Button>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Wrench className="size-6 text-primary" />
                The President&apos;s Desk
              </CardTitle>
              <CardDescription>
                President-only command hub for site maintenance, access control, dashboards, content tools, and executive operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Active Users (15m)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.activeUsers15m}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Unique Users (7d)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.distinctUsers7d}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Page Views (24h)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.pageViews24h}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-black/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-widest">Page Views (7d)</CardDescription>
                  <CardTitle className="text-2xl">{metrics.pageViews7d}</CardTitle>
                </CardHeader>
              </Card>
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="size-5 text-primary" />
                One-Stop Control Hub
              </CardTitle>
              <CardDescription>
                All site maintenance, controls, dashboard links, and operational tools in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-4">
                <div className="rounded-xl border border-black/10 bg-white/5 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-slate-500">President Controls</p>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin"><Wrench className="size-4" /> Council Command Center</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/site-maintenance"><Shield className="size-4" /> The President&apos;s Desk</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content"><SlidersHorizontal className="size-4" /> Content Manager</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/notifications"><Mail className="size-4" /> Notification Settings</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content/members"><Users className="size-4" /> Member Directory</Link>
                  </Button>
                </div>

                <div className="rounded-xl border border-black/10 bg-white/5 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Operations & Dashboards</p>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/submissions"><Inbox className="size-4" /> Submission Review</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/attendance"><ClipboardCheck className="size-4" /> Attendance</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/compliance"><ClipboardCheck className="size-4" /> Compliance</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/exec-council-meeting?deck=2026-02-23"><Calendar className="size-4" /> Meeting Deck (2/23)</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/exec-council-meeting?deck=2026-02-19"><FileText className="size-4" /> Deck Archive (2/19)</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/treasury"><Wallet className="size-4" /> Treasury Dashboard</Link>
                  </Button>
                </div>

                <div className="rounded-xl border border-black/10 bg-white/5 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Page Editors</p>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content/home"><Home className="size-4" /> Home Editor</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content/meetings"><Calendar className="size-4" /> Meetings Editor</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content/programs"><TrendingUp className="size-4" /> Programs Editor</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content/resources"><FolderOpen className="size-4" /> Resources Editor</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/council-admin/content/decision-portal"><Target className="size-4" /> Decision Portal Editor</Link>
                  </Button>
                </div>

                <div className="rounded-xl border border-black/10 bg-white/5 p-4 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Portal View</p>
                  <p className="text-xs text-slate-600">
                    Use the bottom-left editor toggle inside the portal pages to switch editing on/off.
                  </p>
                  <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                    <Link to="/">
                      <ExternalLink className="size-4" />
                      Open Council View
                    </Link>
                  </Button>
                  <div className="rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">Pending submissions</p>
                    <p>{pendingSubmissions}</p>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">Treasury snapshot</p>
                    <p>
                      {session.isTreasuryAdmin
                        ? treasuryTotal.toLocaleString("en-US", { style: "currency", currency: "USD" })
                        : "Treasury access restricted"}
                    </p>
                    {session.isTreasuryAdmin && treasury?.asOfLabel ? (
                      <p className="text-[11px] text-slate-500 mt-1">{treasury.asOfLabel}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="size-5 text-primary" />
                Chapter Dues Payment Confirmation
              </CardTitle>
              <CardDescription>
                Track the date each chapter paid dues. This is managed from The President&apos;s Desk and can be shared with Treasurer / Financial Secretary access later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {chapterDuesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="size-4 animate-spin" />
                  Loading chapter dues tracker...
                </div>
              ) : null}

              {!chapterDuesLoading ? (
                <div className="overflow-x-auto rounded-lg border border-black/10">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-black/10 bg-white/30">
                        <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Chapter</th>
                        <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Paid Date</th>
                        <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Status</th>
                        <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chapterDuesEntries.map((entry) => {
                        const paid = Boolean(entry.paidDate);
                        return (
                          <tr key={entry.id} className="border-b border-black/5 bg-white/10">
                            <td className="px-3 py-3">
                              <p className="text-sm font-medium text-slate-900">{entry.chapter}</p>
                            </td>
                            <td className="px-3 py-3">
                              <Input
                                type="date"
                                value={entry.paidDate || ""}
                                onChange={(e) => updateChapterDuesDate(entry.id, e.target.value)}
                                className="max-w-[190px]"
                                disabled={chapterDuesSaving}
                                aria-label={`Paid date for ${entry.chapter}`}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  paid
                                    ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-800"
                                    : "border-slate-300/60 bg-slate-500/10 text-slate-700"
                                }`}
                              >
                                {paid ? "Paid" : "Pending"}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                                onClick={() => clearChapterDuesDate(entry.id)}
                                disabled={chapterDuesSaving || !entry.paidDate}
                              >
                                Clear
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  {chapterDuesUpdatedAt
                    ? `Last saved ${new Date(chapterDuesUpdatedAt).toLocaleString()}${chapterDuesUpdatedBy ? ` by ${chapterDuesUpdatedBy}` : ""}`
                    : "No chapter dues updates saved yet."}
                </p>
                <Button
                  type="button"
                  onClick={saveChapterDues}
                  disabled={chapterDuesLoading || chapterDuesSaving}
                  className="gap-2"
                >
                  {chapterDuesSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {chapterDuesSaving ? "Saving..." : "Save Dues Dates"}
                </Button>
              </div>

              {chapterDuesError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{chapterDuesError}</p>
              ) : null}
              {chapterDuesMessage ? (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{chapterDuesMessage}</p>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="size-5 text-primary" />
                  Officer Access Matrix
                </CardTitle>
                <CardDescription>
                  Access items are listed by row, with officer columns and checkboxes to grant/revoke access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="size-4 animate-spin" />
                    Loading access matrix...
                  </div>
                ) : null}

                {missingOfficerEmails.length > 0 ? (
                  <div className="rounded-lg border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                    Missing officer emails in Chapter Leadership: {missingOfficerEmails.join(", ")}.
                  </div>
                ) : null}

                {!loading && officers.length === 0 ? (
                  <div className="rounded-lg border border-black/10 bg-white/5 px-3 py-4 text-sm text-slate-600">
                    No officer emails found to build the matrix. Add officer emails in Chapter Leadership first.
                  </div>
                ) : null}

                {!loading && officers.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-black/10">
                    <table className="w-full min-w-[980px] text-left">
                      <thead>
                        <tr className="border-b border-black/10 bg-white/30">
                          <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Access Item</th>
                          {officers.map((officer) => (
                            <th key={officer.email} className="px-3 py-2 text-center">
                              <div className="text-xs font-semibold text-slate-900 leading-tight">{officer.name}</div>
                              <div className="text-[10px] uppercase tracking-wide text-slate-500">{officer.title}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ACCESS_ITEMS.map((item) => (
                          <tr key={item.key} className="border-b border-black/5 bg-white/20">
                            <td className="px-3 py-3 align-top">
                              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.description}</p>
                            </td>
                            {officers.map((officer) => (
                              <td key={`${item.key}:${officer.email}`} className="px-3 py-3 text-center align-middle">
                                <input
                                  type="checkbox"
                                  className="size-4 accent-teal-600"
                                  checked={Boolean(matrix[item.key][officer.email])}
                                  onChange={(e) => setAccess(item.key, officer.email, e.target.checked)}
                                  disabled={saving || loading}
                                  aria-label={`${item.label} access for ${officer.name}`}
                                />
                              </td>
                            ))}
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
                      : "No access matrix changes saved yet."}
                  </p>
                  <Button onClick={save} disabled={saving || loading || officers.length === 0 || !dirty} className="gap-2">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Access Matrix
                  </Button>
                </div>

                {error ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Presentation className="size-4 text-primary" />
                    Meeting Deck Live Control
                  </CardTitle>
                  <CardDescription>
                    Members can always preview the deck. Turn this on to unlock live participation (votes, hands, motions, committees) in the member deck.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {commandVisibilityLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="size-4 animate-spin" />
                      Loading meeting deck status...
                    </div>
                  ) : null}
                  {commandVisibilityConfig ? (
                    <div className="rounded-lg border border-black/10 bg-white/5 px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Member Live Mode</p>
                          <p className="text-xs text-slate-600">
                            {commandVisibilityConfig.meetingDeckLive
                              ? "Live mode is ON. Authenticated members can participate."
                              : "Preview-only mode is ON. Members can view slides, but participation is locked."}
                          </p>
                        </div>
                        <Switch
                          checked={Boolean(commandVisibilityConfig.meetingDeckLive)}
                          onCheckedChange={(checked) => setCommandVisibility("meetingDeckLive", Boolean(checked))}
                          aria-label="Meeting deck live mode"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                      <Link to="/meeting-deck">
                        <Presentation className="size-4" />
                        Open Member Deck
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start gap-2 border-black/15 bg-white/5">
                      <Link to="/council-admin/exec-council-meeting?deck=2026-02-23">
                        <Calendar className="size-4" />
                        Open Presenter Deck
                      </Link>
                    </Button>
                  </div>

                  {commandVisibilityError ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{commandVisibilityError}</p>
                  ) : null}
                  {commandVisibilityMessage ? (
                    <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{commandVisibilityMessage}</p>
                  ) : null}

                  <Button
                    type="button"
                    onClick={saveCommandVisibility}
                    disabled={commandVisibilityLoading || commandVisibilitySaving || !commandVisibilityConfig}
                    className="w-full gap-2"
                  >
                    {commandVisibilitySaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {commandVisibilitySaving ? "Saving..." : "Save Deck Status"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="size-4 text-primary" />
                    Council Command Topic Visibility
                  </CardTitle>
                  <CardDescription>
                    Control which topics/cards are visible in the Council Command Center dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {commandVisibilityLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="size-4 animate-spin" />
                      Loading topic visibility...
                    </div>
                  ) : null}
                  {commandVisibilityConfig ? (
                    <div className="space-y-2">
                      {[
                        { key: "showCouncilCommandOperations", label: "Operations cards (compliance, deck, attendance)" },
                        { key: "showCouncilCommandTreasury", label: "Treasury cards/snapshot" },
                        { key: "showCouncilCommandPresidentsDesk", label: "The President's Desk card" },
                        { key: "showCouncilCommandContentManager", label: "Content Manager card" },
                        { key: "showCouncilCommandEditors", label: "Editor tools/cards" },
                        { key: "showCouncilCommandMemberDirectory", label: "Member Directory card" },
                        { key: "showCouncilCommandSubmissions", label: "Submission Review card" },
                        { key: "showCouncilCommandNotifications", label: "Notifications card" },
                        { key: "showCouncilCommandInternalDocuments", label: "Internal Documents tab" },
                        { key: "showCouncilCommandTaskTracker", label: "Task Tracker tab" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white/5 px-3 py-2">
                          <span className="text-xs leading-tight text-slate-700">{item.label}</span>
                          <Switch
                            checked={Boolean(commandVisibilityConfig[item.key as keyof SiteConfig] ?? true)}
                            onCheckedChange={(checked) => setCommandVisibility(item.key as keyof SiteConfig, Boolean(checked))}
                            aria-label={item.label}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    onClick={saveCommandVisibility}
                    disabled={commandVisibilityLoading || commandVisibilitySaving || !commandVisibilityConfig}
                    className="w-full gap-2"
                  >
                    {commandVisibilitySaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {commandVisibilitySaving ? "Saving..." : "Save Topic Visibility"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="size-4 text-primary" />
                    Top Pages (7d)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {metrics.topPages7d.length === 0 ? (
                    <p className="text-slate-500">No activity yet.</p>
                  ) : (
                    metrics.topPages7d.map((item) => (
                      <div key={item.path} className="flex items-center justify-between rounded border border-black/10 bg-white/5 px-3 py-2">
                        <span className="truncate text-slate-700">{item.path || "/"}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-500">{item.hits}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Recent Authenticated Activity</CardTitle>
              <CardDescription>Latest portal events from logged-in users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-slate-500">
                      <th className="px-2 py-2">Time</th>
                      <th className="px-2 py-2">User</th>
                      <th className="px-2 py-2">Event</th>
                      <th className="px-2 py-2">Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentActivity.map((row, idx) => (
                      <tr key={`${row.createdAt || "na"}-${idx}`} className="border-b border-black/5">
                        <td className="px-2 py-2 text-slate-500">
                          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-2 py-2 text-slate-800">{row.email || "Unknown"}</td>
                        <td className="px-2 py-2 text-slate-700">{row.eventType || "page_view"}</td>
                        <td className="px-2 py-2 text-slate-600">{row.path || "—"}</td>
                      </tr>
                    ))}
                    {metrics.recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-2 py-4 text-center text-slate-500">No activity captured yet.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PresidentGate>
  );
}
