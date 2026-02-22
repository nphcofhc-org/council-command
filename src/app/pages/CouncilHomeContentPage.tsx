import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "../components/ui/select";
import type { QuickLink, SiteConfig, Update } from "../data/types";
import {
  fetchQuickLinksOverride,
  fetchSiteConfigOverride,
  fetchUpdatesOverride,
  saveQuickLinksOverride,
  saveSiteConfigOverride,
  saveUpdatesOverride,
} from "../data/content-api";
import { fetchHomePageData } from "../data/api";
import { uploadSocialAssets } from "../data/forms-api";
import { toDateInputValue } from "../utils/date-input";

function emptyConfig(): SiteConfig {
  return {
    councilName: "",
    subtitle: "",
    footerText: "",
    footerSubtext: "",
    presidentName: "",
    presidentTitle: "",
    presidentChapter: "",
    presidentImageUrl: "",
    presidentMessage: [],
    presidentClosing: "",
    bannerImageUrl: "",
    instagramHandle: "",
    instagramPostUrls: [],
    alertEnabled: false,
    alertVariant: "warning",
    alertTitle: "",
    alertMessage: "",
    alertLinkLabel: "",
    alertLinkUrl: "",
    showChapterInfo: true,
    showMeetingsDelegates: true,
    showProgramsEvents: true,
    showResources: true,
    showForms: true,
    showForum: true,
    showChat: true,
    showSignatureEventComparison: true,
  };
}

const CORE_UPDATE_TYPES = [
  "NPHC Executive Council",
  "General Chapter Business",
  "Committee Update",
  "Programs and Events",
  "Member Org Chapters",
] as const;

const MEMBER_CHAPTER_UPDATE_TYPES = [
  "Member Org Chapter - Alpha Phi Alpha Fraternity, Inc.",
  "Member Org Chapter - Alpha Kappa Alpha Sorority, Inc.",
  "Member Org Chapter - Kappa Alpha Psi Fraternity, Inc.",
  "Member Org Chapter - Omega Psi Phi Fraternity, Inc.",
  "Member Org Chapter - Delta Sigma Theta Sorority, Inc.",
  "Member Org Chapter - Phi Beta Sigma Fraternity, Inc.",
  "Member Org Chapter - Zeta Phi Beta Sorority, Inc.",
  "Member Org Chapter - Sigma Gamma Rho Sorority, Inc.",
  "Member Org Chapter - Iota Phi Theta Fraternity, Inc.",
] as const;

const ALL_UPDATE_TYPES = [...CORE_UPDATE_TYPES, ...MEMBER_CHAPTER_UPDATE_TYPES] as const;

export function CouncilHomeContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [config, setConfig] = useState<SiteConfig>(emptyConfig());
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [uploadingUpdateIndex, setUploadingUpdateIndex] = useState<number | null>(null);

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError(null);
      setMessage(null);
      try {
        // Load current effective content (includes static + any overrides).
        const home = await fetchHomePageData();
        if (cancelled) return;

        setConfig(home.config);
        setQuickLinks(home.quickLinks);
        setUpdates(home.updates);

        // Also fetch override timestamps for display.
        const [cfgO, linksO, updO] = await Promise.all([
          fetchSiteConfigOverride().catch(() => null),
          fetchQuickLinksOverride().catch(() => null),
          fetchUpdatesOverride().catch(() => null),
        ]);
        const newest = [cfgO?.updatedAt, linksO?.updatedAt, updO?.updatedAt].filter(Boolean).sort().pop() || null;
        setLastSavedAt(newest);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load home content.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const messageText = useMemo(() => config.presidentMessage.join("\n\n"), [config.presidentMessage]);
  const instagramUrlsText = useMemo(
    () => (Array.isArray(config.instagramPostUrls) ? config.instagramPostUrls : []).join("\n"),
    [config.instagramPostUrls],
  );

  const onConfigField = (key: keyof SiteConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const onConfigBool = (key: keyof SiteConfig, value: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const onMessageText = (value: string) => {
    const paragraphs = value
      .split(/\n\s*\n/g)
      .map((p) => p.trim())
      .filter(Boolean);
    setConfig((prev) => ({ ...prev, presidentMessage: paragraphs }));
  };

  const onInstagramUrlsText = (value: string) => {
    const urls = value
      .split(/\n+/g)
      .map((u) => u.trim())
      .filter(Boolean);
    setConfig((prev) => ({ ...prev, instagramPostUrls: urls }));
  };

  const addQuickLink = () => {
    setQuickLinks((prev) => [
      ...prev,
      {
        id: `ql-${prev.length + 1}`,
        icon: "Link",
        label: "",
        shortLabel: "",
        url: "",
        row: 1,
      },
    ]);
  };

  const updateQuickLink = (index: number, key: keyof QuickLink, value: string) => {
    setQuickLinks((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      if (key === "row") {
        next[index] = { ...current, row: value === "2" ? 2 : 1 };
      } else {
        next[index] = { ...current, [key]: value } as QuickLink;
      }
      return next;
    });
  };

  const removeQuickLink = (index: number) => {
    setQuickLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const addUpdate = () => {
    setUpdates((prev) => [
      ...prev,
      {
        id: `update-${prev.length + 1}`,
        date: "",
        title: "",
        type: "NPHC Executive Council",
        body: "",
      },
    ]);
  };

  const updateUpdate = (index: number, key: keyof Update, value: string) => {
    setUpdates((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      next[index] = { ...current, [key]: value };
      return next;
    });
  };

  const removeUpdate = (index: number) => {
    setUpdates((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadUpdateFlyer = async (index: number, files: File[]) => {
    const file = files[0];
    if (!file) return;

    setError(null);
    setMessage(null);
    setUploadingUpdateIndex(index);
    try {
      const uploaded = await uploadSocialAssets([file]);
      const flyerUrl = String(uploaded?.[0]?.viewUrl || "").trim();
      if (!flyerUrl) throw new Error("Flyer upload failed.");
      updateUpdate(index, "flyerUrl", flyerUrl);
      setMessage(`Flyer uploaded for update ${index + 1}. Click Save Changes to publish.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Flyer upload failed.");
    } finally {
      setUploadingUpdateIndex(null);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const [cfg, links, upd] = await Promise.all([
        saveSiteConfigOverride(config),
        saveQuickLinksOverride(quickLinks),
        saveUpdatesOverride(updates),
      ]);
      setConfig(cfg.data as SiteConfig);
      setQuickLinks(links.data as QuickLink[]);
      setUpdates(upd.data as Update[]);
      setLastSavedAt([cfg.updatedAt, links.updatedAt, upd.updatedAt].filter(Boolean).sort().pop() || null);
      setMessage("Home content saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CouncilAdminGate>
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <div className="mb-6">
          <Link to="/council-admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Council Command Center
          </Link>
        </div>

        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Content Manager — Home</CardTitle>
            <CardDescription>
              Update the home banner, president welcome, quick links, and internal news. Changes are mobile-safe and apply immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-slate-600">Editor access only. Members will see the updated Home page.</p>
                {lastSavedAt ? (
                  <p className="text-xs text-slate-500">Last saved: {new Date(lastSavedAt).toLocaleString()}</p>
                ) : null}
              </div>
              <Button onClick={saveAll} disabled={saving || loading}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Home Banner</CardTitle>
                  <CardDescription>Paste an image or MP4 video URL (Google Drive/R2 link works if it’s public).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label>Banner Media URL</Label>
                    <Input value={config.bannerImageUrl} onChange={(e) => onConfigField("bannerImageUrl", e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Instagram Feed</CardTitle>
                  <CardDescription>
                    For a reliable feed (no API keys), paste specific Instagram post URLs (one per line) to embed on Home.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label>Instagram Handle (optional)</Label>
                    <Input
                      value={config.instagramHandle || ""}
                      onChange={(e) => onConfigField("instagramHandle", e.target.value)}
                      placeholder="Example: nphcofhudsoncounty"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Post URLs (one per line)</Label>
                    <Textarea
                      value={instagramUrlsText}
                      onChange={(e) => onInstagramUrlsText(e.target.value)}
                      rows={6}
                      placeholder={"https://www.instagram.com/p/POST_ID/\nhttps://www.instagram.com/reel/REEL_ID/"}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">President Block</CardTitle>
                  <CardDescription>Edits reflect on the home page “President’s Welcome”.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input value={config.presidentName} onChange={(e) => onConfigField("presidentName", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input value={config.presidentTitle} onChange={(e) => onConfigField("presidentTitle", e.target.value)} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Chapter</Label>
                      <Input value={config.presidentChapter} onChange={(e) => onConfigField("presidentChapter", e.target.value)} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Photo URL</Label>
                      <Input value={config.presidentImageUrl} onChange={(e) => onConfigField("presidentImageUrl", e.target.value)} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Closing Line</Label>
                      <Input value={config.presidentClosing} onChange={(e) => onConfigField("presidentClosing", e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Welcome Message (separate paragraphs with a blank line)</Label>
                    <Textarea
                      value={messageText}
                      onChange={(e) => onMessageText(e.target.value)}
                      rows={10}
                      className="min-h-[220px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alerts / Notifications Banner</CardTitle>
                <CardDescription>
                  Optional banner shown on the Home page for time-sensitive announcements. Keep it short for mobile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">Enable Banner</p>
                    <p className="text-xs text-slate-500">Turn on/off without deleting your message.</p>
                  </div>
                  <Switch
                    checked={!!config.alertEnabled}
                    onCheckedChange={(checked) => onConfigBool("alertEnabled", !!checked)}
                    aria-label="Enable alert banner"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Style</Label>
                    <Select
                      value={config.alertVariant || "warning"}
                      onValueChange={(v) => onConfigField("alertVariant", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Title (optional)</Label>
                    <Input value={config.alertTitle} onChange={(e) => onConfigField("alertTitle", e.target.value)} />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label>Message</Label>
                    <Textarea
                      value={config.alertMessage}
                      onChange={(e) => onConfigField("alertMessage", e.target.value)}
                      rows={4}
                      className="min-h-[120px]"
                      placeholder="Example: Meeting link updated. Please review the agenda by Friday 5pm."
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Button Label (optional)</Label>
                    <Input value={config.alertLinkLabel} onChange={(e) => onConfigField("alertLinkLabel", e.target.value)} />
                  </div>

                  <div className="space-y-1">
                    <Label>Button URL (optional)</Label>
                    <Input value={config.alertLinkUrl} onChange={(e) => onConfigField("alertLinkUrl", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
                <CardDescription>These are the buttons under the banner. Keep labels short for mobile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickLinks.map((link, idx) => (
                  <div key={link.id || idx} className="nphc-editor-block rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-800">Link {idx + 1}</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeQuickLink(idx)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Icon (Lucide name)</Label>
                        <Input value={link.icon} onChange={(e) => updateQuickLink(idx, "icon", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Row (1 or 2)</Label>
                        <Input value={String(link.row)} onChange={(e) => updateQuickLink(idx, "row", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Label (desktop)</Label>
                        <Input value={link.label} onChange={(e) => updateQuickLink(idx, "label", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Short Label (mobile)</Label>
                        <Input value={link.shortLabel} onChange={(e) => updateQuickLink(idx, "shortLabel", e.target.value)} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>URL</Label>
                        <Input value={link.url} onChange={(e) => updateQuickLink(idx, "url", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addQuickLink}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Quick Link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Internal News / Updates</CardTitle>
                <CardDescription>These are the items in the “Internal News and Council Updates” list.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {updates.map((u, idx) => (
                  <div key={u.id || idx} className="nphc-editor-block rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-800">Update {idx + 1}</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeUpdate(idx)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input type="date" value={toDateInputValue(u.date)} onChange={(e) => updateUpdate(idx, "date", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Type</Label>
                        <Select
                          value={u.type || "__unset__"}
                          onValueChange={(value) => updateUpdate(idx, "type", value === "__unset__" ? "" : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select update type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__unset__">Select update type</SelectItem>
                            <SelectGroup>
                              <SelectLabel>Core</SelectLabel>
                              {CORE_UPDATE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Member Org Chapters (Founding Order)</SelectLabel>
                              {MEMBER_CHAPTER_UPDATE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            {u.type && !ALL_UPDATE_TYPES.includes(u.type as (typeof ALL_UPDATE_TYPES)[number]) ? (
                              <>
                                <SelectSeparator />
                                <SelectGroup>
                                  <SelectLabel>Current Custom Value</SelectLabel>
                                  <SelectItem value={u.type}>{u.type}</SelectItem>
                                </SelectGroup>
                              </>
                            ) : null}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input value={u.title} onChange={(e) => updateUpdate(idx, "title", e.target.value)} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Body (optional)</Label>
                        <Textarea
                          value={u.body || ""}
                          onChange={(e) => updateUpdate(idx, "body", e.target.value)}
                          rows={4}
                          placeholder="Add the full update details shown below the title on Home."
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Flyer URL (optional)</Label>
                        <Input
                          value={u.flyerUrl || ""}
                          onChange={(e) => updateUpdate(idx, "flyerUrl", e.target.value)}
                          placeholder="/api/uploads/social/..."
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Upload Flyer (optional)</Label>
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          disabled={uploadingUpdateIndex === idx}
                          onChange={(e) => {
                            const files = Array.from(e.currentTarget.files || []);
                            e.currentTarget.value = "";
                            void uploadUpdateFlyer(idx, files);
                          }}
                        />
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {uploadingUpdateIndex === idx ? <span>Uploading flyer...</span> : null}
                          {u.flyerUrl ? (
                            <>
                              <a href={u.flyerUrl} target="_blank" rel="noreferrer" className="underline">
                                View current flyer
                              </a>
                              <button
                                type="button"
                                className="underline"
                                onClick={() => updateUpdate(idx, "flyerUrl", "")}
                              >
                                Remove flyer
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addUpdate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Update
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </CouncilAdminGate>
  );
}
