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
import type { DecisionPortalContent } from "../data/types";
import { fetchDecisionPortalOverride, saveDecisionPortalOverride } from "../data/content-api";

function emptyDecisionPortal(): DecisionPortalContent {
  return {
    decisionKey: "2026-block-party-vs-unity-bbq",
    title: "2026 Summer Signature Event Decision",
    subtitle: "Review the brief, then submit your confidential vote.",
    summary: "",
    options: [
      { id: "block", label: "Neighborhood Block Party", description: "" },
      { id: "unity", label: "Unity BBQ", description: "" },
    ],
    links: [
      { id: "lnk-web", label: "Open Interactive Report", url: "#/reports/signature-event-comparison" },
    ],
    isOpen: true,
  };
}

export function CouncilDecisionPortalContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [form, setForm] = useState<DecisionPortalContent>(emptyDecisionPortal());

  useEffect(() => {
    let cancelled = false;
    void fetchDecisionPortalOverride()
      .then((res) => {
        if (cancelled) return;
        if (res.found && res.data) {
          setForm(res.data);
          setLastSavedAt(res.updatedAt);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load decision portal content.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await saveDecisionPortalOverride(form);
      setForm(res.data);
      setLastSavedAt(res.updatedAt);
      setMessage("Decision portal content saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const links = useMemo(() => form.links || [], [form.links]);
  const setLinkField = (idx: number, key: "label" | "url", value: string) => {
    setForm((prev) => {
      const next = [...(prev.links || [])];
      const current = next[idx];
      if (!current) return prev;
      next[idx] = { ...current, [key]: value };
      return { ...prev, links: next };
    });
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...(prev.links || []), { id: `lnk-${(prev.links || []).length + 1}`, label: "", url: "" }],
    }));
  };

  const removeLink = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== idx),
    }));
  };

  const setOptionField = (id: "block" | "unity", key: "label" | "description", value: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === id ? { ...o, [key]: value } : o)),
    }));
  };

  return (
    <CouncilAdminGate>
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <div className="mb-6">
          <Link to="/council-admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Back to Council Admin
          </Link>
        </div>

        <Card className="border-0 shadow-lg ring-1 ring-black/5">
          <CardHeader>
            <CardTitle>Content Manager — Decision Portal</CardTitle>
            <CardDescription>
              This is the brief members see above the vote buttons. Set the decision text, links, and whether voting is open.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Editor access only. Changes apply immediately.</p>
                {lastSavedAt ? (
                  <p className="text-xs text-gray-500">Last saved: {new Date(lastSavedAt).toLocaleString()}</p>
                ) : null}
              </div>
              <Button onClick={save} disabled={saving || loading} className="bg-black hover:bg-gray-800">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {loading ? <p className="text-sm text-gray-500">Loading...</p> : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
                <CardDescription>Close voting when the decision window ends.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">Voting Open</p>
                  <p className="text-xs text-gray-500">When off, vote buttons are disabled.</p>
                </div>
                <Switch checked={!!form.isOpen} onCheckedChange={(v) => setForm((p) => ({ ...p, isOpen: !!v }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Decision Metadata</CardTitle>
                <CardDescription>
                  The Decision Key separates vote datasets. Only change it if you are starting a new vote.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <Label>Decision Key</Label>
                  <Input value={form.decisionKey} onChange={(e) => setForm((p) => ({ ...p, decisionKey: e.target.value }))} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Subtitle</Label>
                  <Input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Summary / Brief</Label>
                  <Textarea value={form.summary} rows={8} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vote Options</CardTitle>
                <CardDescription>These labels appear on the vote buttons.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Option A (block)</p>
                  <div className="space-y-1">
                    <Label>Label</Label>
                    <Input
                      value={form.options.find((o) => o.id === "block")?.label || ""}
                      onChange={(e) => setOptionField("block", "label", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      value={form.options.find((o) => o.id === "block")?.description || ""}
                      rows={5}
                      onChange={(e) => setOptionField("block", "description", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Option B (unity)</p>
                  <div className="space-y-1">
                    <Label>Label</Label>
                    <Input
                      value={form.options.find((o) => o.id === "unity")?.label || ""}
                      onChange={(e) => setOptionField("unity", "label", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      value={form.options.find((o) => o.id === "unity")?.description || ""}
                      rows={5}
                      onChange={(e) => setOptionField("unity", "description", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Links</CardTitle>
                <CardDescription>Add Google Docs/Drive links to the agenda, proposals, budgets, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {links.map((lnk, idx) => (
                  <div key={lnk.id || idx} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-700">Link {idx + 1}</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeLink(idx)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Label</Label>
                        <Input value={lnk.label} onChange={(e) => setLinkField(idx, "label", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>URL</Label>
                        <Input value={lnk.url} onChange={(e) => setLinkField(idx, "url", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addLink}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </CouncilAdminGate>
  );
}
