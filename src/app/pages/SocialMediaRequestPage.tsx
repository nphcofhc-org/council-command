import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { submitForm } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";

export function SocialMediaRequestPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [requestType, setRequestType] = useState("");
  const [title, setTitle] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [copyText, setCopyText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [platforms, setPlatforms] = useState("Instagram, Facebook");
  const [assetsLink, setAssetsLink] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState(session.email || "");
  const [boardReviewNeeded, setBoardReviewNeeded] = useState("No");

  const submit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        requestType,
        title,
        neededBy,
        eventDate,
        eventTime,
        location,
        copyText,
        ctaLink,
        platforms,
        assetsLink,
        submitterName,
        submitterEmail,
        boardReviewNeeded,
      };
      const res = await submitForm("social_media_request", payload);
      setMessage(`Submitted. Tracking ID: ${res.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/forms">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Form</p>
            <h1 className="text-lg sm:text-xl font-extrabold text-black">Social Media Request</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle>Request Flyers / Announcements</CardTitle>
              <CardDescription>
                Submit your request with copy, dates, and a Drive link to assets. The team will review and schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session.authenticated ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You must be authenticated to submit. If you see this message, refresh and complete Access login.
                </div>
              ) : null}

              {message ? <p className="text-sm text-green-700 font-semibold">{message}</p> : null}
              {error ? <p className="text-sm text-red-700 font-semibold">{error}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Request Type</Label>
                  <Input value={requestType} onChange={(e) => setRequestType(e.target.value)} placeholder="Flyer, announcement, recap, reminder…" />
                </div>
                <div className="space-y-1">
                  <Label>Needed By (date)</Label>
                  <Input value={neededBy} onChange={(e) => setNeededBy(e.target.value)} placeholder="2026-03-01" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Title / Headline</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event name or announcement headline" />
                </div>
                <div className="space-y-1">
                  <Label>Event Date</Label>
                  <Input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="2026-03-15" />
                </div>
                <div className="space-y-1">
                  <Label>Event Time</Label>
                  <Input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="6:30 PM" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Virtual / address" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Platforms</Label>
                  <Input value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="Instagram, Facebook, Email…" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Assets Link (Drive)</Label>
                  <Input value={assetsLink} onChange={(e) => setAssetsLink(e.target.value)} placeholder="https://drive.google.com/…" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>CTA Link (optional)</Label>
                  <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="RSVP link / registration / donation link" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Copy Text (what should be posted)</Label>
                <Textarea value={copyText} onChange={(e) => setCopyText(e.target.value)} rows={7} placeholder="Paste the full caption/message here." />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Submitter Name</Label>
                  <Input value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-1">
                  <Label>Submitter Email</Label>
                  <Input value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Board Review Needed?</Label>
                  <Input value={boardReviewNeeded} onChange={(e) => setBoardReviewNeeded(e.target.value)} placeholder="Yes / No" />
                </div>
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="bg-black hover:bg-gray-900 w-full sm:w-auto">
                <Save className="mr-2 size-4" />
                {saving ? "Submitting…" : "Submit Request"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

