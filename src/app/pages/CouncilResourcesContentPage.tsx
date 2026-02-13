import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import type { ResourcesPageData, SharedFormCategory } from "../data/types";
import { fetchResourcesData } from "../data/api";
import { saveResourcesOverride } from "../data/content-api";

export function CouncilResourcesContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<ResourcesPageData>({
    sharedForms: [],
    nationalOrgs: [],
    trainingResources: [],
  });

  useEffect(() => {
    let cancelled = false;
    void fetchResourcesData()
      .then((data) => {
        if (cancelled) return;
        setForm(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load resources content.");
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
      const res = await saveResourcesOverride(form);
      setForm(res.data);
      setMessage("Resources content saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = (idx: number, value: string) => {
    setForm((p) => {
      const next = [...p.sharedForms];
      const current = next[idx];
      if (!current) return p;
      next[idx] = { ...current, category: value };
      return { ...p, sharedForms: next };
    });
  };

  const updateForm = (catIdx: number, formIdx: number, key: "name" | "description" | "link", value: string) => {
    setForm((p) => {
      const cats = [...p.sharedForms];
      const cat = cats[catIdx];
      if (!cat) return p;
      const forms = [...cat.forms];
      const f = forms[formIdx];
      if (!f) return p;
      forms[formIdx] = { ...f, [key]: value };
      cats[catIdx] = { ...cat, forms };
      return { ...p, sharedForms: cats };
    });
  };

  const ensureIds = (categories: SharedFormCategory[]) => categories.map((c, cIdx) => ({
    ...c,
    forms: c.forms.map((f, fIdx) => ({ ...f, id: f.id || `form-${cIdx + 1}-${fIdx + 1}` })),
  }));

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
            <CardTitle>Content Manager — Resources</CardTitle>
            <CardDescription>
              Edit shared forms, national org links, and training resources. (Full add/remove UI is next; this is edit-in-place.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">Tip: avoid long descriptions for mobile.</p>
              <Button onClick={() => {
                setForm((p) => ({ ...p, sharedForms: ensureIds(p.sharedForms) }));
                void save();
              }} disabled={saving || loading} className="bg-black hover:bg-gray-800">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {loading ? <p className="text-sm text-gray-500">Loading...</p> : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shared Forms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.sharedForms.map((cat, idx) => (
                  <div key={`${cat.category}-${idx}`} className="rounded-lg border p-4 space-y-3">
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Input value={cat.category} onChange={(e) => updateCategory(idx, e.target.value)} />
                    </div>
                    {cat.forms.map((f, fIdx) => (
                      <div key={f.id || fIdx} className="rounded-md border bg-gray-50/40 p-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label>Name</Label>
                            <Input value={f.name} onChange={(e) => updateForm(idx, fIdx, "name", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label>Link</Label>
                            <Input value={f.link} onChange={(e) => updateForm(idx, fIdx, "link", e.target.value)} />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea rows={2} value={f.description} onChange={(e) => updateForm(idx, fIdx, "description", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">National Organizations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.nationalOrgs.map((o, idx) => (
                  <div key={o.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Name</Label>
                        <Input value={o.name} onChange={(e) => setForm((p) => {
                          const next = [...p.nationalOrgs];
                          next[idx] = { ...next[idx], name: e.target.value };
                          return { ...p, nationalOrgs: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Website</Label>
                        <Input value={o.website} onChange={(e) => setForm((p) => {
                          const next = [...p.nationalOrgs];
                          next[idx] = { ...next[idx], website: e.target.value };
                          return { ...p, nationalOrgs: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Founded</Label>
                        <Input value={o.founded} onChange={(e) => setForm((p) => {
                          const next = [...p.nationalOrgs];
                          next[idx] = { ...next[idx], founded: e.target.value };
                          return { ...p, nationalOrgs: next };
                        })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Training Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.trainingResources.map((r, idx) => (
                  <div key={r.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input value={r.title} onChange={(e) => setForm((p) => {
                          const next = [...p.trainingResources];
                          next[idx] = { ...next[idx], title: e.target.value };
                          return { ...p, trainingResources: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Type</Label>
                        <Input value={r.type} onChange={(e) => setForm((p) => {
                          const next = [...p.trainingResources];
                          next[idx] = { ...next[idx], type: e.target.value };
                          return { ...p, trainingResources: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Updated</Label>
                        <Input value={r.updated} onChange={(e) => setForm((p) => {
                          const next = [...p.trainingResources];
                          next[idx] = { ...next[idx], updated: e.target.value };
                          return { ...p, trainingResources: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>File URL</Label>
                        <Input value={r.fileUrl || ""} onChange={(e) => setForm((p) => {
                          const next = [...p.trainingResources];
                          next[idx] = { ...next[idx], fileUrl: e.target.value };
                          return { ...p, trainingResources: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea rows={3} value={r.description} onChange={(e) => setForm((p) => {
                          const next = [...p.trainingResources];
                          next[idx] = { ...next[idx], description: e.target.value };
                          return { ...p, trainingResources: next };
                        })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </CouncilAdminGate>
  );
}

