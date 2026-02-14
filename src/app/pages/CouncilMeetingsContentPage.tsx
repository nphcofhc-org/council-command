import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { CouncilAdminGate } from "../components/CouncilAdminGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { MeetingsPageData } from "../data/types";
import { fetchMeetingsData } from "../data/api";
import { saveMeetingsOverride } from "../data/content-api";

export function CouncilMeetingsContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<MeetingsPageData>({
    upcomingMeetings: [],
    meetingRecords: [],
    delegateReports: [],
  });

  useEffect(() => {
    let cancelled = false;
    void fetchMeetingsData()
      .then((data) => {
        if (cancelled) return;
        setForm(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load meetings content.");
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
      const res = await saveMeetingsOverride(form);
      setForm(res.data);
      setMessage("Meetings content saved.");
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
            Back to Council Admin
          </Link>
        </div>

        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Content Manager — Meetings</CardTitle>
            <CardDescription>
              Edit upcoming meetings, records, and delegate reports. (Full add/remove UI is next; for now this is an “edit in place” manager.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Tip: keep fields short for mobile.</p>
              <Button onClick={save} disabled={saving || loading}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.upcomingMeetings.map((m, idx) => (
                  <div key={m.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input
                          value={m.title}
                          onChange={(e) => setForm((p) => {
                            const next = [...p.upcomingMeetings];
                            next[idx] = { ...next[idx], title: e.target.value };
                            return { ...p, upcomingMeetings: next };
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input value={m.date} onChange={(e) => setForm((p) => {
                          const next = [...p.upcomingMeetings];
                          next[idx] = { ...next[idx], date: e.target.value };
                          return { ...p, upcomingMeetings: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Time</Label>
                        <Input value={m.time} onChange={(e) => setForm((p) => {
                          const next = [...p.upcomingMeetings];
                          next[idx] = { ...next[idx], time: e.target.value };
                          return { ...p, upcomingMeetings: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Location</Label>
                        <Input value={m.location} onChange={(e) => setForm((p) => {
                          const next = [...p.upcomingMeetings];
                          next[idx] = { ...next[idx], location: e.target.value };
                          return { ...p, upcomingMeetings: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Type</Label>
                        <Input value={m.type} onChange={(e) => setForm((p) => {
                          const next = [...p.upcomingMeetings];
                          next[idx] = { ...next[idx], type: e.target.value };
                          return { ...p, upcomingMeetings: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Join Link URL (Google Meet)</Label>
                        <Input value={m.joinUrl || ""} onChange={(e) => setForm((p) => {
                          const next = [...p.upcomingMeetings];
                          next[idx] = { ...next[idx], joinUrl: e.target.value };
                          return { ...p, upcomingMeetings: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Join Button Label</Label>
                        <Input value={m.joinLabel || ""} onChange={(e) => setForm((p) => {
                          const next = [...p.upcomingMeetings];
                          next[idx] = { ...next[idx], joinLabel: e.target.value };
                          return { ...p, upcomingMeetings: next };
                        })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meeting Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.meetingRecords.map((r, idx) => (
                  <div key={r.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input value={r.date} onChange={(e) => setForm((p) => {
                          const next = [...p.meetingRecords];
                          next[idx] = { ...next[idx], date: e.target.value };
                          return { ...p, meetingRecords: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Input value={r.status} onChange={(e) => setForm((p) => {
                          const next = [...p.meetingRecords];
                          next[idx] = { ...next[idx], status: e.target.value };
                          return { ...p, meetingRecords: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input value={r.title} onChange={(e) => setForm((p) => {
                          const next = [...p.meetingRecords];
                          next[idx] = { ...next[idx], title: e.target.value };
                          return { ...p, meetingRecords: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Agenda File URL</Label>
                        <Input value={r.agendaFile} onChange={(e) => setForm((p) => {
                          const next = [...p.meetingRecords];
                          next[idx] = { ...next[idx], agendaFile: e.target.value };
                          return { ...p, meetingRecords: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Minutes File URL</Label>
                        <Input value={r.minutesFile} onChange={(e) => setForm((p) => {
                          const next = [...p.meetingRecords];
                          next[idx] = { ...next[idx], minutesFile: e.target.value };
                          return { ...p, meetingRecords: next };
                        })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delegate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.delegateReports.map((d, idx) => (
                  <div key={d.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Meeting Cycle</Label>
                        <Input value={d.meetingCycle} onChange={(e) => setForm((p) => {
                          const next = [...p.delegateReports];
                          next[idx] = { ...next[idx], meetingCycle: e.target.value };
                          return { ...p, delegateReports: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Input value={d.status} onChange={(e) => setForm((p) => {
                          const next = [...p.delegateReports];
                          next[idx] = { ...next[idx], status: e.target.value };
                          return { ...p, delegateReports: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Chapter</Label>
                        <Input value={d.chapter} onChange={(e) => setForm((p) => {
                          const next = [...p.delegateReports];
                          next[idx] = { ...next[idx], chapter: e.target.value };
                          return { ...p, delegateReports: next };
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Submitted By</Label>
                        <Input value={d.submittedBy} onChange={(e) => setForm((p) => {
                          const next = [...p.delegateReports];
                          next[idx] = { ...next[idx], submittedBy: e.target.value };
                          return { ...p, delegateReports: next };
                        })} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Date Submitted</Label>
                        <Input value={d.dateSubmitted} onChange={(e) => setForm((p) => {
                          const next = [...p.delegateReports];
                          next[idx] = { ...next[idx], dateSubmitted: e.target.value };
                          return { ...p, delegateReports: next };
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
