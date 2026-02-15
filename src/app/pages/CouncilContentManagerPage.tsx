import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { fetchLeadershipContent, saveLeadershipContent } from "../data/admin-api";
import {
  DEFAULT_LEADERSHIP_CONTENT,
  type LeadershipContent,
  type LeadershipMember,
} from "../data/leadership";

type SectionKey = "executiveBoard" | "additionalChairs";

const SECTION_META: Record<SectionKey, { title: string; prefix: string }> = {
  executiveBoard: { title: "Executive Board", prefix: "eb" },
  additionalChairs: { title: "Standing Committee Chairs", prefix: "ch" },
};

function nextMemberId(items: LeadershipMember[], prefix: string): string {
  const nextNumber = items.length + 1;
  return `${prefix}-${nextNumber}`;
}

export function CouncilContentManagerPage() {
  const [form, setForm] = useState<LeadershipContent>(DEFAULT_LEADERSHIP_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchLeadershipContent()
      .then((payload) => {
        if (cancelled) return;
        if (payload.found) {
          setForm(payload.data);
          setLastSyncedAt(payload.updatedAt);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load content.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCount = useMemo(
    () => form.executiveBoard.length + form.additionalChairs.length,
    [form],
  );

  const onFieldChange = (
    section: SectionKey,
    index: number,
    key: keyof LeadershipMember,
    value: string,
  ) => {
    setForm((prev) => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, [section]: updated };
    });
  };

  const addMember = (section: SectionKey) => {
    const meta = SECTION_META[section];
    setForm((prev) => {
      const next = [...prev[section]];
      next.push({
        id: nextMemberId(next, meta.prefix),
        name: "",
        title: "",
        chapter: "",
        email: "",
        imageUrl: "",
      });
      return { ...prev, [section]: next };
    });
  };

  const removeMember = (section: SectionKey, index: number) => {
    setForm((prev) => {
      const next = prev[section].filter((_, i) => i !== index);
      return { ...prev, [section]: next };
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = await saveLeadershipContent(form);
      setForm(payload.data);
      setLastSyncedAt(payload.updatedAt);
      setMessage("Leadership content saved.");
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
          <Link to="/council-admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Back to Council Admin
          </Link>
        </div>

        <Card className="border-0 shadow-lg ring-1 ring-black/5">
          <CardHeader>
            <CardTitle>Content Manager — Leadership</CardTitle>
            <CardDescription>
              Manage Executive Board and Standing Committee Chairs displayed on Chapter Information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">{totalCount} total leadership records</p>
              <Button onClick={save} disabled={saving || loading} className="bg-primary text-primary-foreground hover:brightness-110">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {lastSyncedAt ? (
              <p className="text-xs text-gray-500">Last synced: {new Date(lastSyncedAt).toLocaleString()}</p>
            ) : null}
            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}

            {loading ? (
              <p className="text-sm text-gray-500">Loading leadership content...</p>
            ) : (
              (Object.keys(SECTION_META) as SectionKey[]).map((section) => (
                <Card key={section}>
                  <CardHeader>
                    <CardTitle className="text-base">{SECTION_META[section].title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form[section].map((member, index) => (
                      <div key={member.id || `${section}-${index}`} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">Record {index + 1}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(section, index)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label>Name</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => onFieldChange(section, index, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Title</Label>
                            <Input
                              value={member.title}
                              onChange={(e) => onFieldChange(section, index, "title", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Chapter</Label>
                            <Input
                              value={member.chapter}
                              onChange={(e) => onFieldChange(section, index, "chapter", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Email</Label>
                            <Input
                              value={member.email || ""}
                              onChange={(e) => onFieldChange(section, index, "email", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label>Photo URL</Label>
                            <Input
                              value={member.imageUrl || ""}
                              onChange={(e) => onFieldChange(section, index, "imageUrl", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={() => addMember(section)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add {SECTION_META[section].title === "Executive Board" ? "Board Member" : "Chair"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </CouncilAdminGate>
  );
}
