import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import type { ProgramsPageData } from "../data/types";
import { fetchProgramsData } from "../data/api";
import { saveProgramsOverride } from "../data/content-api";

export function CouncilProgramsContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<ProgramsPageData>({
    upcomingEvents: [],
    archivedEvents: [],
    eventFlyers: [],
    signupForms: [],
  });

  useEffect(() => {
    let cancelled = false;
    void fetchProgramsData()
      .then((data) => {
        if (cancelled) return;
        setForm(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load programs content.");
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
      const res = await saveProgramsOverride(form);
      setForm(res.data);
      setMessage("Programs content saved.");
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
            Back to Council Command Center
          </Link>
        </div>

        <Card className="border-0 shadow-lg ring-1 ring-black/5">
          <CardHeader>
            <CardTitle>Content Manager — Programs</CardTitle>
            <CardDescription>
              Edit events, archive items, flyers, and signup forms. (Full add/remove UI is next; for now this is edit-in-place.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">Tip: keep descriptions short for mobile.</p>
              <Button onClick={save} disabled={saving || loading} className="bg-primary text-primary-foreground hover:brightness-110">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {loading ? <p className="text-sm text-gray-500">Loading...</p> : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.upcomingEvents.map((e, idx) => (
                  <div key={e.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input value={e.title} onChange={(ev) => setForm((p) => {
                          const next = [...p.upcomingEvents];
                          next[idx] = { ...next[idx], title: ev.target.value };
                          return { ...p, upcomingEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input value={e.date} onChange={(ev) => setForm((p) => {
                          const next = [...p.upcomingEvents];
                          next[idx] = { ...next[idx], date: ev.target.value };
                          return { ...p, upcomingEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Type</Label>
                        <Input value={e.type} onChange={(ev) => setForm((p) => {
                          const next = [...p.upcomingEvents];
                          next[idx] = { ...next[idx], type: ev.target.value };
                          return { ...p, upcomingEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Location</Label>
                        <Input value={e.location} onChange={(ev) => setForm((p) => {
                          const next = [...p.upcomingEvents];
                          next[idx] = { ...next[idx], location: ev.target.value };
                          return { ...p, upcomingEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Registration</Label>
                        <Input value={e.registration} onChange={(ev) => setForm((p) => {
                          const next = [...p.upcomingEvents];
                          next[idx] = { ...next[idx], registration: ev.target.value };
                          return { ...p, upcomingEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea value={e.description} rows={4} onChange={(ev) => setForm((p) => {
                          const next = [...p.upcomingEvents];
                          next[idx] = { ...next[idx], description: ev.target.value };
                          return { ...p, upcomingEvents: next };
                        })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Archived Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.archivedEvents.map((e, idx) => (
                  <div key={e.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input value={e.title} onChange={(ev) => setForm((p) => {
                          const next = [...p.archivedEvents];
                          next[idx] = { ...next[idx], title: ev.target.value };
                          return { ...p, archivedEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input value={e.date} onChange={(ev) => setForm((p) => {
                          const next = [...p.archivedEvents];
                          next[idx] = { ...next[idx], date: ev.target.value };
                          return { ...p, archivedEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Input value={e.status} onChange={(ev) => setForm((p) => {
                          const next = [...p.archivedEvents];
                          next[idx] = { ...next[idx], status: ev.target.value };
                          return { ...p, archivedEvents: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Attendees</Label>
                        <Input value={e.attendees} onChange={(ev) => setForm((p) => {
                          const next = [...p.archivedEvents];
                          next[idx] = { ...next[idx], attendees: ev.target.value };
                          return { ...p, archivedEvents: next };
                        })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Flyers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.eventFlyers.map((f, idx) => (
                  <div key={f.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input value={f.title} onChange={(ev) => setForm((p) => {
                          const next = [...p.eventFlyers];
                          next[idx] = { ...next[idx], title: ev.target.value };
                          return { ...p, eventFlyers: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input value={f.date} onChange={(ev) => setForm((p) => {
                          const next = [...p.eventFlyers];
                          next[idx] = { ...next[idx], date: ev.target.value };
                          return { ...p, eventFlyers: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Type</Label>
                        <Input value={f.type} onChange={(ev) => setForm((p) => {
                          const next = [...p.eventFlyers];
                          next[idx] = { ...next[idx], type: ev.target.value };
                          return { ...p, eventFlyers: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>File URL</Label>
                        <Input value={f.fileUrl || ""} onChange={(ev) => setForm((p) => {
                          const next = [...p.eventFlyers];
                          next[idx] = { ...next[idx], fileUrl: ev.target.value };
                          return { ...p, eventFlyers: next };
                        })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Signup Forms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.signupForms.map((f, idx) => (
                  <div key={f.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input value={f.title} onChange={(ev) => setForm((p) => {
                          const next = [...p.signupForms];
                          next[idx] = { ...next[idx], title: ev.target.value };
                          return { ...p, signupForms: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Deadline</Label>
                        <Input value={f.deadline} onChange={(ev) => setForm((p) => {
                          const next = [...p.signupForms];
                          next[idx] = { ...next[idx], deadline: ev.target.value };
                          return { ...p, signupForms: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Input value={f.status} onChange={(ev) => setForm((p) => {
                          const next = [...p.signupForms];
                          next[idx] = { ...next[idx], status: ev.target.value };
                          return { ...p, signupForms: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Form URL</Label>
                        <Input value={f.formUrl || ""} onChange={(ev) => setForm((p) => {
                          const next = [...p.signupForms];
                          next[idx] = { ...next[idx], formUrl: ev.target.value };
                          return { ...p, signupForms: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea value={f.description} rows={3} onChange={(ev) => setForm((p) => {
                          const next = [...p.signupForms];
                          next[idx] = { ...next[idx], description: ev.target.value };
                          return { ...p, signupForms: next };
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
