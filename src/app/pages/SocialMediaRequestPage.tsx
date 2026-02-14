import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { submitForm, uploadSocialAssets, type UploadedSocialAsset } from "../data/forms-api";
import { useCouncilSession } from "../hooks/use-council-session";

export function SocialMediaRequestPage() {
  const { session } = useCouncilSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Social Media Intake Form (v2)
  const [email, setEmail] = useState(session.email || "");
  const [eventName, setEventName] = useState("");
  const [caption, setCaption] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [orgAndChapterName, setOrgAndChapterName] = useState("");
  const [chapterHandle, setChapterHandle] = useState("");
  const [hashtags, setHashtags] = useState("N/A");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [assetLinksFallback, setAssetLinksFallback] = useState("");
  const [uploadedAssets, setUploadedAssets] = useState<UploadedSocialAsset[]>([]);

  const removeFile = (index: number) => {
    setAssetFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    const required = [
      ["Email", email],
      ["Event Name", eventName],
      ["Caption", caption],
      ["Date of Event", eventDate],
      ["Organization and Chapter Name", orgAndChapterName],
      ["Chapter Social Media Handle", chapterHandle],
      ["Any Specific Hashtags", hashtags],
    ] as const;

    for (const [label, v] of required) {
      if (!String(v || "").trim()) return `${label} is required.`;
    }

    if (assetFiles.length === 0 && !assetLinksFallback.trim()) {
      return "Please upload your flyers/images (preferred) or provide a Drive link.";
    }

    if (assetFiles.length > 5) return "Upload up to 5 files.";
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

      let uploaded: UploadedSocialAsset[] = uploadedAssets;
      if (assetFiles.length > 0 && uploadedAssets.length === 0) {
        try {
          uploaded = await uploadSocialAssets(assetFiles);
          setUploadedAssets(uploaded);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed.";
          // Allow Drive link fallback if uploads aren't configured yet.
          if (assetLinksFallback.trim()) {
            uploaded = [];
          } else {
            throw new Error(msg);
          }
        }
      }

      const payload = {
        email,
        eventName,
        caption,
        eventDate,
        orgAndChapterName,
        chapterHandle,
        hashtags,
        additionalInfo,
        mediaFiles: uploaded,
        mediaLinks: assetLinksFallback,
        instructions:
          "Please submit your request 48–72 hours in advance of your desired posting date.",
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
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Social Media Intake</h1>
          </div>
        </div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>NPHC | Social Media Intake Form</CardTitle>
              <CardDescription>
                Maximize your chapter&apos;s event visibility and share your announcements with the community. Please submit your request 48–72 hours in advance.
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
                  <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Provide the official name of the event." />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Caption *</Label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={6}
                    placeholder="Write a concise and engaging description of the event. This will be the main text accompanying the post."
                  />
                </div>

                <div className="space-y-1">
                  <Label>Date of Event *</Label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label>Chapter Social Media Handle (IG, Facebook, etc.) *</Label>
                  <Input value={chapterHandle} onChange={(e) => setChapterHandle(e.target.value)} placeholder="@PiThetaOmega" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Organization and Chapter Name *</Label>
                  <Input
                    value={orgAndChapterName}
                    onChange={(e) => setOrgAndChapterName(e.target.value)}
                    placeholder="e.g., Alpha Phi Alpha Fraternity, Inc., Sigma Chi Lambda Chapter"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Any Specific Hashtags *</Label>
                  <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#NPHCHudsonCounty, #Divine9, #[EventSpecificHashtag] or N/A" />
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Upload Flyers / Images *</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload up to 5 files. Max 100MB each. (PDF, JPG, PNG, HEIC accepted)
                    </p>
                  </div>
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
                        setAssetFiles((prev) => [...prev, ...list].slice(0, 5));
                      }}
                    />
                  </label>
                </div>

                {assetFiles.length > 0 ? (
                  <div className="space-y-2">
                    {assetFiles.map((f, idx) => (
                      <div key={`${f.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-black/10 bg-white/55 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-slate-900 truncate">{f.name}</p>
                          <p className="text-xs text-slate-500">{Math.round(f.size / 1024)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-slate-500 hover:text-primary transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">
                    If uploads are temporarily unavailable, paste Drive link(s) here (optional fallback)
                  </Label>
                  <Textarea
                    value={assetLinksFallback}
                    onChange={(e) => setAssetLinksFallback(e.target.value)}
                    rows={2}
                    placeholder="https://drive.google.com/…"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Additional Info (optional)</Label>
                <Textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                  placeholder="For customized posting: specific title to use, names of people in photos, extra context, etc."
                />
              </div>

              <Button onClick={submit} disabled={saving || !session.authenticated} className="w-full sm:w-auto">
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
