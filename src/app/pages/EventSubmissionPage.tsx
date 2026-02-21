import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, MapPin, Save, Upload, X, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { autofillFromFlyer, submitForm, uploadSocialAssets, type UploadedSocialAsset } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";
import { useMemberProfile } from "../hooks/use-member-profile";
import { DIVINE_NINE_ORGANIZATIONS } from "../data/member-profile-api";

export function EventSubmissionPage() {
  const { session } = useCouncilSession();
  const { profile } = useMemberProfile(session.authenticated);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(session.email || "");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [description, setDescription] = useState("");
  const [eventLinkUrl, setEventLinkUrl] = useState("");
  const [alsoSubmitSocial, setAlsoSubmitSocial] = useState(false);

  const [flyerFiles, setFlyerFiles] = useState<File[]>([]);
  const [flyerLinksFallback, setFlyerLinksFallback] = useState("");
  const [uploadedFlyers, setUploadedFlyers] = useState<UploadedSocialAsset[]>([]);
  const [autofillBusy, setAutofillBusy] = useState(false);

  useEffect(() => {
    if (session.email) setEmail(session.email);
  }, [session.email]);

  useEffect(() => {
    if (!profile.organization) return;
    if (!organization) setOrganization(profile.organization);
  }, [organization, profile.organization]);

  const removeFile = (index: number) => {
    setFlyerFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    const required = [
      ["Email", email],
      ["Event Name", eventName],
      ["Event Date", eventDate],
      ["Location", location],
      ["Organization", organization],
      ["Chapter Name", chapterName],
      ["Description", description],
    ] as const;
    for (const [label, v] of required) {
      if (!String(v || "").trim()) return `${label} is required.`;
    }
    if (!flyerFiles.length && !flyerLinksFallback.trim()) {
      return "Please upload an event flyer (preferred) or provide a Drive link.";
    }
    if (flyerFiles.length > 5) return "Upload up to 5 files.";
    return null;
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!session.authenticated) throw new Error("Unauthenticated. Please refresh and complete Access login.");

      const v = validate();
      if (v) throw new Error(v);

      let uploaded: UploadedSocialAsset[] = uploadedFlyers;
      if (flyerFiles.length > 0 && uploadedFlyers.length === 0) {
        try {
          uploaded = await uploadSocialAssets(flyerFiles);
          setUploadedFlyers(uploaded);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed.";
          if (flyerLinksFallback.trim()) {
            uploaded = [];
          } else {
            throw new Error(msg);
          }
        }
      }

      const payload = {
        email,
        eventName,
        eventDate,
        startTime,
        endTime,
        location,
        hostingOrgChapter: `${organization}${chapterName ? ` — ${chapterName}` : ""}`.trim(),
        description,
        eventLinkUrl,
        flyerFiles: uploaded,
        flyerLinks: flyerLinksFallback,
        submitToSocialMediaAlso: alsoSubmitSocial,
        note:
          "Event submissions are reviewed by Site Administration. Approved submissions will appear in the Programs & Events calendar and (if within 2 weeks) the Home page Internal News section.",
      };

      const res = await submitForm("event_submission", payload);
      let socialId = "";
      if (alsoSubmitSocial) {
        const uploadLinks = uploaded.map((f) => f.viewUrl).filter(Boolean).join("\n");
        const mediaLinks = [flyerLinksFallback, uploadLinks].filter(Boolean).join("\n").trim();
        const social = await submitForm("social_media_request", {
          email,
          eventName,
          caption: description,
          eventDate,
          orgAndChapterName: `${organization}${chapterName ? ` — ${chapterName}` : ""}`.trim(),
          chapterHandle: "",
          hashtags: "N/A",
          additionalInfo: `Auto-submitted from Event Submission (${res.id}).`,
          mediaFiles: [],
          mediaLinks,
          linkedEventSubmissionId: res.id,
        });
        socialId = social.id;
      }

      setMessage(
        socialId
          ? `Submitted for review. Event ID: ${res.id} · Social Request ID: ${socialId}`
          : `Submitted for review. Tracking ID: ${res.id}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSaving(false);
    }
  };

  const parseLinks = (raw: string) =>
    String(raw || "")
      .split(/[\s,\n]+/)
      .map((part) => part.trim())
      .filter(Boolean);

  const runAutofill = async () => {
    setAutofillBusy(true);
    setError(null);
    setMessage(null);
    try {
      let uploaded = uploadedFlyers;
      if (flyerFiles.length > 0 && uploaded.length === 0) {
        uploaded = await uploadSocialAssets(flyerFiles);
        setUploadedFlyers(uploaded);
      }

      const candidates = [
        ...uploaded.map((f) => f.viewUrl).filter(Boolean),
        ...parseLinks(flyerLinksFallback),
      ];
      const flyerUrl = candidates[0];
      if (!flyerUrl) throw new Error("Upload a flyer image or paste a flyer link before running autofill.");

      const fields = await autofillFromFlyer({
        flyerUrl,
        formType: "event_submission",
      });

      let applied = 0;
      if (!eventName && fields.eventName) {
        setEventName(fields.eventName);
        applied += 1;
      }
      if (!eventDate && fields.eventDate) {
        setEventDate(fields.eventDate);
        applied += 1;
      }
      if (!startTime && fields.startTime) {
        setStartTime(fields.startTime);
        applied += 1;
      }
      if (!endTime && fields.endTime) {
        setEndTime(fields.endTime);
        applied += 1;
      }
      if (!location && fields.location) {
        setLocation(fields.location);
        applied += 1;
      }
      if (!description && (fields.description || fields.caption)) {
        setDescription(fields.description || fields.caption);
        applied += 1;
      }
      if (!eventLinkUrl && fields.eventLinkUrl) {
        setEventLinkUrl(fields.eventLinkUrl);
        applied += 1;
      }
      if (!organization && fields.organization && DIVINE_NINE_ORGANIZATIONS.includes(fields.organization)) {
        setOrganization(fields.organization);
        applied += 1;
      }
      if (!chapterName && fields.chapterName) {
        setChapterName(fields.chapterName);
        applied += 1;
      }
      setMessage(applied > 0 ? `Flyer autofill applied ${applied} field${applied === 1 ? "" : "s"}.` : "No blank fields were updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Flyer autofill failed.");
    } finally {
      setAutofillBusy(false);
    }
  };

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Form</p>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Event Submission</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-5" />
                Submit an Upcoming Event
              </CardTitle>
              <CardDescription>
                Share a chapter event so members can see it in the portal calendar. Submissions require approval before publishing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Email *</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Event Name *</Label>
                  <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Official name for the event calendar." />
                </div>

                <div className="space-y-1">
                  <Label>Event Date *</Label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label>Start Time (optional)</Label>
                  <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="e.g., 3:30 PM" />
                </div>

                <div className="space-y-1">
                  <Label>End Time (optional)</Label>
                  <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="e.g., 5:30 PM" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="size-4 text-slate-500" />
                    Location *
                  </Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue / address / city." />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Organization *</Label>
                  <select
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="">Select organization</option>
                    {DIVINE_NINE_ORGANIZATIONS.map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Chapter Name *</Label>
                  <Input value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="e.g., Sigma Chi Lambda Chapter" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Event Description *</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Short description for members: purpose, who should attend, what to bring, etc." />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="flex items-center gap-2">
                    <ExternalLink className="size-4 text-slate-500" />
                    Event Link (optional)
                  </Label>
                  <Input value={eventLinkUrl} onChange={(e) => setEventLinkUrl(e.target.value)} placeholder="Registration link, flyer link, or chapter post link." />
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Upload Flyer *</p>
                    <p className="text-xs text-slate-500 mt-0.5">Upload up to 5 files (PDF, JPG, PNG, HEIC). Or paste a Drive link below.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border border-black/15 bg-white/55 px-3 py-2 cursor-pointer hover:bg-white/5 hover:border-primary/40 transition">
                      <Upload className="size-4" />
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept=".pdf,image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => {
                          const list = Array.from(e.target.files || []);
                          setFlyerFiles((prev) => [...prev, ...list].slice(0, 5));
                        }}
                      />
                    </label>
                    <Button type="button" variant="outline" onClick={runAutofill} disabled={autofillBusy || !session.authenticated}>
                      <Sparkles className="mr-2 size-4" />
                      {autofillBusy ? "Autofilling…" : "Autofill from Flyer"}
                    </Button>
                  </div>
                </div>

                {flyerFiles.length > 0 ? (
                  <div className="space-y-2">
                    {flyerFiles.map((f, idx) => (
                      <div key={`${f.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-black/10 bg-white/55 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-slate-900 truncate">{f.name}</p>
                          <p className="text-xs text-slate-500">{Math.round(f.size / 1024)} KB</p>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="text-slate-500 hover:text-primary transition-colors" aria-label="Remove file">
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Drive link(s) fallback (optional)</Label>
                  <Textarea value={flyerLinksFallback} onChange={(e) => setFlyerLinksFallback(e.target.value)} rows={2} placeholder="https://drive.google.com/…" />
                </div>
              </div>

              <label className="flex items-start gap-2 rounded-lg border border-black/10 bg-white/5 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-primary"
                  checked={alsoSubmitSocial}
                  onChange={(e) => setAlsoSubmitSocial(e.target.checked)}
                />
                <span>
                  Also create a Social Media Request from this same submission (no duplicate form entry required).
                </span>
              </label>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="w-full sm:w-auto">
                <Save className="mr-2 size-4" />
                {saving ? "Submitting…" : "Submit for Review"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
