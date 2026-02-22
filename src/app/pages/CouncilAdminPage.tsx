import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Shield, FileText, Lock, ClipboardCheck, SlidersHorizontal, Home, Calendar, TrendingUp, FolderOpen, Target, Inbox, Mail, Users, Wallet, Wrench, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { motion } from "motion/react";
import { useCouncilAdminData } from "../hooks/use-site-data";
import { StatusBadge } from "../components/status-badge";
import { DynamicIcon } from "../components/icon-resolver";
import { Link } from "react-router";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { useCouncilSession } from "../hooks/use-council-session";
import { useEditorMode } from "../hooks/use-editor-mode";
import { fetchTreasuryData, type TreasuryPayload } from "../data/treasury-api";
import { fetchSubmissionsAsAdmin } from "../data/forms-api";
import { fetchSiteConfig } from "../data/api";
import { saveSiteConfigOverride } from "../data/content-api";
import type { SiteConfig } from "../data/types";

const ART_MARBLE = "https://images.unsplash.com/photo-1678756466078-1ff0d7b09431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25vY2hyb21lJTIwYWJzdHJhY3QlMjBtYXJibGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MDUxMzIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function CouncilAdminPage() {
  const { data } = useCouncilAdminData();
  const { session } = useCouncilSession();
  const { editorMode, setEditorMode } = useEditorMode();
  const [treasury, setTreasury] = useState<TreasuryPayload | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [memberVisibilityConfig, setMemberVisibilityConfig] = useState<SiteConfig | null>(null);
  const [memberVisibilityLoading, setMemberVisibilityLoading] = useState(true);
  const [memberVisibilitySaving, setMemberVisibilitySaving] = useState(false);
  const [memberVisibilityError, setMemberVisibilityError] = useState<string | null>(null);
  const [memberVisibilityMessage, setMemberVisibilityMessage] = useState<string | null>(null);

  const internalDocuments = data?.internalDocuments || [];
  const tasks = data?.tasks || [];
  const toViewer = (url: string) => `/viewer?src=${encodeURIComponent(url)}`;
  const isInternalFile = (url: string) => url.trim().startsWith("/");
  const normalizeSectionVisibility = (cfg: SiteConfig): SiteConfig => ({
    ...cfg,
    showChapterInfo: cfg.showChapterInfo ?? true,
    showMeetingsDelegates: cfg.showMeetingsDelegates ?? true,
    showProgramsEvents: cfg.showProgramsEvents ?? true,
    showResources: cfg.showResources ?? true,
    showForms: cfg.showForms ?? true,
    showForum: cfg.showForum ?? true,
    showChat: cfg.showChat ?? true,
    showSignatureEventComparison: cfg.showSignatureEventComparison ?? true,
  });

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
    if (!session.isSiteEditor) return;
    setMemberVisibilityLoading(true);
    setMemberVisibilityError(null);
    void fetchSiteConfig()
      .then((cfg) => {
        if (cancelled) return;
        setMemberVisibilityConfig(normalizeSectionVisibility(cfg));
      })
      .catch((err) => {
        if (cancelled) return;
        setMemberVisibilityError(err instanceof Error ? err.message : "Failed to load section visibility.");
      })
      .finally(() => {
        if (!cancelled) setMemberVisibilityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session.isSiteEditor]);

  const updateMemberVisibility = (key: keyof SiteConfig, value: boolean) => {
    setMemberVisibilityConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
    setMemberVisibilityMessage(null);
  };

  const saveMemberVisibility = async () => {
    if (!memberVisibilityConfig) return;
    setMemberVisibilitySaving(true);
    setMemberVisibilityError(null);
    setMemberVisibilityMessage(null);
    try {
      const result = await saveSiteConfigOverride(memberVisibilityConfig);
      setMemberVisibilityConfig(normalizeSectionVisibility(result.data));
      setMemberVisibilityMessage("Council member section visibility saved.");
    } catch (err) {
      setMemberVisibilityError(err instanceof Error ? err.message : "Failed to save section visibility.");
    } finally {
      setMemberVisibilitySaving(false);
    }
  };

  return (
    <CouncilLeaderGate>
      <div className="relative min-h-screen">
        <div className="absolute top-20 right-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
          <img src={ART_MARBLE} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Shield className="size-5 text-primary" />
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Executive Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-slate-900 mb-1">Council Command Center</h1>
          <p className="text-sm sm:text-base text-slate-600">
            Internal documents, financial records, and strategic planning
          </p>
        </motion.div>

        {session.isTreasuryAdmin ? (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.45 }}
            className="mb-6"
          >
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="size-5" />
                  Treasury Snapshot (Restricted)
                </CardTitle>
                <CardDescription>Confidential balances for executive oversight.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Total</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {((treasury?.balances?.lendingClub || 0) + (treasury?.balances?.cashApp || 0) + (treasury?.balances?.paypal || 0)).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">LendingClub</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {(treasury?.balances?.lendingClub || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Cash App</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {(treasury?.balances?.cashApp || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">PayPal</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {(treasury?.balances?.paypal || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </p>
                </div>
                <p className="text-xs text-slate-500 sm:col-span-4">
                  {treasury?.asOfLabel || "Loading treasury snapshot..."}
                  {treasury?.liveMode ? ` • Live sync (${treasury?.liveSource || "ingest"})` : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {!session.isSiteEditor ? (
          <motion.div
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.45 }}
            className="space-y-4"
          >
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base text-slate-900 sm:text-lg">Exec Council Meeting Deck</h3>
                  <p className="text-sm text-slate-600">Open the current meeting deck or retrieve the 2/19 archived copy.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto">
                  <Button asChild className="w-full sm:w-auto">
                    <Link to="/council-admin/exec-council-meeting?deck=2026-02-23">
                      <Calendar className="mr-2 size-4" />
                      Open 2/23 Deck
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                    <Link to="/council-admin/exec-council-meeting?deck=2026-02-19">
                      <FileText className="mr-2 size-4" />
                      Retrieve 2/19 Copy
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base text-slate-900 sm:text-lg">Roll Call & Attendance</h3>
                  <p className="text-sm text-slate-600">Manage attendance and view FY 2024–2026 historical reports.</p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/council-admin/attendance">
                    <ClipboardCheck className="mr-2 size-4" />
                    Open Attendance
                  </Link>
                </Button>
              </CardContent>
            </Card>
            {session.isTreasuryAdmin ? (
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base text-slate-900 sm:text-lg">Treasury Dashboard</h3>
                    <p className="text-sm text-slate-600">
                      Restricted treasury reporting and account records.
                    </p>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link to="/council-admin/treasury">
                      <Wallet className="mr-2 size-4" />
                      Open Treasury
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </motion.div>
        ) : (
        <>
        <Card className="mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3">
              <h3 className="text-base text-slate-900 sm:text-lg">Page Editing Order</h3>
              <p className="text-sm text-slate-600">
                Recommended flow: 1) Home, 2) Meetings, 3) Programs, 4) Resources, 5) Decision Portal, 6) Member Directory.
                You can also use the floating “Edit” button directly on each page when Editor Mode is enabled.
              </p>
            </div>
          </CardContent>
        </Card>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 grid gap-4 lg:grid-cols-2"
        >
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Council View Editor Mode</h3>
                <p className="text-sm text-slate-600">
                  Toggle edit mode for the member-facing portal view. When enabled, use the floating edit controls on each page to update what council members see.
                </p>
              </div>
              {session.isSiteEditor ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant={editorMode ? "default" : "outline"}
                    className={editorMode ? "w-full sm:w-auto" : "w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"}
                    onClick={() => setEditorMode(!editorMode)}
                  >
                    {editorMode ? <ToggleRight className="mr-2 size-4" /> : <ToggleLeft className="mr-2 size-4" />}
                    {editorMode ? "Editor Mode On" : "Editor Mode Off"}
                  </Button>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button asChild variant="outline" className="flex-1 sm:flex-none border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                      <Link to="/">
                        <ExternalLink className="mr-2 size-4" />
                        Open Council View
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base text-slate-900 sm:text-lg">Council Member Section Visibility</h3>
                  <p className="text-sm text-slate-600">
                    Choose which portal sections are visible to council members in the left navigation.
                  </p>
                </div>
                {session.isSiteEditor ? (
                  <Button
                    type="button"
                    onClick={saveMemberVisibility}
                    disabled={memberVisibilityLoading || memberVisibilitySaving || !memberVisibilityConfig}
                    className="w-full sm:w-auto"
                  >
                    {memberVisibilitySaving ? "Saving..." : "Save Visibility"}
                  </Button>
                ) : null}
              </div>

              {!session.isSiteEditor ? (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              ) : memberVisibilityLoading ? (
                <p className="text-sm text-slate-500">Loading visibility settings...</p>
              ) : memberVisibilityConfig ? (
                <div className="space-y-2">
                  {[
                    { key: "showChapterInfo", label: "Chapter Info" },
                    { key: "showMeetingsDelegates", label: "Meetings & Delegates" },
                    { key: "showProgramsEvents", label: "Programs & Events" },
                    { key: "showResources", label: "Resources" },
                    { key: "showForms", label: "Forms" },
                    { key: "showForum", label: "Forum" },
                    { key: "showChat", label: "Chat" },
                    { key: "showSignatureEventComparison", label: "Signature Event Comparison" },
                  ].map((item) => {
                    const checked = Boolean(memberVisibilityConfig[item.key as keyof SiteConfig] ?? true);
                    return (
                      <div key={item.key} className="flex items-center justify-between rounded-lg border border-black/10 bg-white/5 px-3 py-2">
                        <span className="text-sm text-slate-800">{item.label}</span>
                        <Switch
                          checked={checked}
                          onCheckedChange={(next) => updateMemberVisibility(item.key as keyof SiteConfig, Boolean(next))}
                          aria-label={`Toggle ${item.label} visibility`}
                        />
                      </div>
                    );
                  })}
                  {memberVisibilityMessage ? <p className="text-xs font-semibold text-emerald-700">{memberVisibilityMessage}</p> : null}
                  {memberVisibilityError ? <p className="text-xs font-semibold text-rose-700">{memberVisibilityError}</p> : null}
                </div>
              ) : (
                <p className="text-sm text-rose-700">{memberVisibilityError || "Unable to load section visibility."}</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">NPHC Compliance Checklist</h3>
                <p className="text-sm text-slate-600">
                  Open the dedicated compliance tracking page to manage annual reporting readiness.
                </p>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link to="/council-admin/compliance">
                  <ClipboardCheck className="mr-2 size-4" />
                  Open Compliance Page
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Exec Council Deck Library</h3>
                <p className="text-sm text-slate-600">Use the current 2/23 deck or retrieve the archived 2/19 copy.</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/council-admin/exec-council-meeting?deck=2026-02-23">
                    <Calendar className="mr-2 size-4" />
                    Open 2/23 Deck
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/council-admin/exec-council-meeting?deck=2026-02-19">
                    <FileText className="mr-2 size-4" />
                    Retrieve 2/19 Copy
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Roll Call & Attendance</h3>
                <p className="text-sm text-slate-600">
                  Manage attendance in one place and review FY 2024–2026 historical attendance reports.
                </p>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link to="/council-admin/attendance">
                  <ClipboardCheck className="mr-2 size-4" />
                  Open Attendance
                </Link>
              </Button>
            </CardContent>
          </Card>

          {session.isTreasuryAdmin ? (
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base text-slate-900 sm:text-lg">Treasury Dashboard</h3>
                  <p className="text-sm text-slate-600">
                    Restricted treasury reporting and transaction management.
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/council-admin/treasury">
                    <Wallet className="mr-2 size-4" />
                    Open Treasury
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {session.isPresident ? (
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base text-slate-900 sm:text-lg">Site Maintenance</h3>
                  <p className="text-sm text-slate-600">
                    President-only maintenance controls for portal operations.
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/council-admin/site-maintenance">
                    <Wrench className="mr-2 size-4" />
                    Open Maintenance
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {session.isPresident ? (
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base text-slate-900 sm:text-lg">Content Manager</h3>
                  <p className="text-sm text-slate-600">
                    Update leadership names, chapters, emails, and photo URLs.
                  </p>
                </div>
                {session.isSiteEditor ? (
                  <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                    <Link to="/council-admin/content">
                      <SlidersHorizontal className="mr-2 size-4" />
                      Open Content Manager
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                    <Lock className="mr-2 size-4" />
                    Site Administration Only
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Home Page Editor</h3>
                <p className="text-sm text-slate-600">
                  Update banner, president welcome, quick links, and internal news.
                </p>
              </div>
              {session.isSiteEditor ? (
                <Button
                  type="button"
                  variant={editorMode ? "outline" : "default"}
                  className={editorMode ? "w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10" : "w-full sm:w-auto"}
                  onClick={() => setEditorMode(true)}
                  asChild={editorMode}
                >
                  {editorMode ? (
                    <Link to="/council-admin/content/home">
                      <Home className="mr-2 size-4" />
                      Edit Home Page
                    </Link>
                  ) : (
                    <>
                      <Home className="mr-2 size-4" />
                      Enable Editor Mode
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Member Directory</h3>
                <p className="text-sm text-slate-600">
                  Set display names and greetings shown in the header and welcome animation.
                </p>
              </div>
              {session.isSiteEditor ? (
                <Button
                  type="button"
                  variant={editorMode ? "outline" : "default"}
                  className={editorMode ? "w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10" : "w-full sm:w-auto"}
                  onClick={() => setEditorMode(true)}
                  asChild={editorMode}
                >
                  {editorMode ? (
                    <Link to="/council-admin/content/members">
                      <Users className="mr-2 size-4" />
                      Edit Members
                    </Link>
                  ) : (
                    <>
                      <Users className="mr-2 size-4" />
                      Enable Editor Mode
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Meetings Editor</h3>
                <p className="text-sm text-slate-600">
                  Update upcoming meetings, minutes, and delegate report rows.
                </p>
              </div>
              {session.isSiteEditor ? (
                <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/council-admin/content/meetings">
                    <Calendar className="mr-2 size-4" />
                    Edit Meetings
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Programs Editor</h3>
                <p className="text-sm text-slate-600">
                  Update events, flyers, archives, and signup forms.
                </p>
              </div>
              {session.isSiteEditor ? (
                <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/council-admin/content/programs">
                    <TrendingUp className="mr-2 size-4" />
                    Edit Programs
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Resources Editor</h3>
                <p className="text-sm text-slate-600">
                  Update shared forms, org links, and training resources.
                </p>
              </div>
              {session.isSiteEditor ? (
                <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/council-admin/content/resources">
                    <FolderOpen className="mr-2 size-4" />
                    Edit Resources
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Decision Portal Editor</h3>
                <p className="text-sm text-slate-600">
                  Manage the decision brief, option labels, links, and whether voting is open.
                </p>
              </div>
              {session.isSiteEditor ? (
                <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/council-admin/content/decision-portal">
                    <Target className="mr-2 size-4" />
                    Edit Decision Portal
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Submission Review</h3>
                <p className="text-sm text-slate-600">
                  Review budget submissions, reimbursement requests, and social media intake forms.
                </p>
                {pendingSubmissions > 0 ? (
                  <p className="mt-1 text-xs font-semibold text-amber-700">
                    {pendingSubmissions} pending submission{pendingSubmissions === 1 ? "" : "s"} awaiting review
                  </p>
                ) : null}
              </div>
              <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                <Link to="/council-admin/submissions">
                  <Inbox className="mr-2 size-4" />
                  Review Submissions
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-slate-900 sm:text-lg">Notifications</h3>
                <p className="text-sm text-slate-600">
                  Configure email recipients and confirmation emails for portal requests.
                </p>
              </div>
              {session.isSiteEditor ? (
                <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/council-admin/notifications">
                    <Mail className="mr-2 size-4" />
                    Notification Settings
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-400" disabled>
                  <Lock className="mr-2 size-4" />
                  Site Administration Only
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="bg-white/5 border border-black/10 backdrop-blur-xl w-full sm:w-auto flex-wrap justify-start">
            <TabsTrigger value="documents" className="text-xs sm:text-sm">Internal Documents</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">Task Tracker</TabsTrigger>
          </TabsList>

          {/* Internal Documents */}
          <TabsContent value="documents" className="space-y-6">
            {internalDocuments.map((section, sectionIndex) => (
              <motion.div
                key={section.category}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: sectionIndex * 0.1, duration: 0.5 }}
              >
                <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg border border-black/10 bg-white/5 text-primary">
                        <DynamicIcon name={section.iconName} className="size-5" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{section.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.documents.map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ x: -15, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-colors gap-3 group"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg border border-black/10 bg-white/55 text-primary flex-shrink-0 group-hover:border-primary/40 transition-colors">
                              <FileText className="size-4 sm:size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-slate-900 mb-1 text-sm sm:text-base">{doc.name}</h3>
                              <p className="text-xs sm:text-sm text-slate-500">Last updated: {doc.updated}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                            <StatusBadge status={doc.status} />
                            {doc.fileUrl ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-2 w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition-all duration-200"
                              >
                                {doc.fileUrl.startsWith("/council-admin/") ? (
                                  <Link to={doc.fileUrl}>
                                    <Lock className="size-3.5" />
                                    View
                                  </Link>
                                ) : isInternalFile(doc.fileUrl) ? (
                                  <Link to={toViewer(doc.fileUrl)}>
                                    <Lock className="size-3.5" />
                                    View
                                  </Link>
                                ) : (
                                  <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                                    <Lock className="size-3.5" />
                                    View
                                  </a>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="gap-2 w-full sm:w-auto border-black/15 bg-white/5 text-slate-400"
                              >
                                <Lock className="size-3.5" />
                                View
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {section.documents.length === 0 ? (
                        <div className="rounded-lg border border-black/10 bg-white/5 p-4 text-sm text-slate-500">
                          No documents in this category.
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="border border-black/10 bg-white/5 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">
                    <strong className="text-slate-900">Document Security Notice:</strong> All documents in this section are
                    confidential and for authorized council leadership only. Do not share, forward,
                    or discuss contents outside of official council business.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Task Tracker */}
          <TabsContent value="tasks" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Council Leadership Task Management</CardTitle>
                  <CardDescription className="text-sm">
                    Active assignments and administrative priorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-colors gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-slate-900 mb-2">{task.task}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-sm text-slate-500">
                            <span>
                              <strong className="text-slate-800">Assigned to:</strong> {task.assignedTo}
                            </span>
                            <span className="hidden sm:inline text-slate-300">&middot;</span>
                            <span>
                              <strong className="text-slate-800">Due:</strong> {task.dueDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
                          <StatusBadge status={task.priority} />
                          <StatusBadge status={task.status} variant="outline" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                >
                  View Full Task Management System
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
        </>
        )}
        </div>
      </div>
    </CouncilLeaderGate>
  );
}
