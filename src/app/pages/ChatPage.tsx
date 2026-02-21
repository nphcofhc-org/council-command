import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, RefreshCw, Send, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { fetchChatMessages, postChatMessage, type ChatMessage } from "../data/chat-api";
import { useCouncilSession } from "../hooks/use-council-session";

function fallbackName(email: string): string {
  const local = String(email || "").split("@")[0] || "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Member";
}

function isImage(url: string): boolean {
  return /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url);
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function ChatPage() {
  const { session } = useCouncilSession();
  const [rows, setRows] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChatMessages(180);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chat.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session.authenticated) {
      setLoading(false);
      return;
    }
    void load();
    const id = window.setInterval(() => {
      void fetchChatMessages(180)
        .then((data) => setRows(data))
        .catch(() => {});
    }, 8000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.authenticated]);

  const submit = async () => {
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await postChatMessage({ body: body.trim(), mediaUrl: mediaUrl.trim() || undefined });
      setBody("");
      setMediaUrl("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message.");
    } finally {
      setSaving(false);
    }
  };

  const canUse = session.authenticated;
  const ordered = useMemo(() => rows, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
        <Button
          variant="outline"
          className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
          onClick={load}
          disabled={!canUse || loading}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            Council Chat
          </CardTitle>
          <CardDescription>
            Group chat for members. You can post text plus optional image/video/GIF link previews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canUse ? (
            <p className="text-sm text-slate-600">
              You must be authenticated to use chat.
            </p>
          ) : null}
          {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}

          <div className="rounded-xl border border-black/10 bg-white/5 p-3 sm:p-4 space-y-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Type message (emoji supported)."
              disabled={!canUse || saving}
            />
            <Input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Optional media URL (image/video/GIF)"
              disabled={!canUse || saving}
            />
            <Button onClick={submit} disabled={!canUse || saving || !body.trim()} className="w-full sm:w-auto gap-2">
              <Send className="size-4" />
              {saving ? "Sending..." : "Send Message"}
            </Button>
          </div>

          <div className="rounded-xl border border-black/10 bg-white/5 p-3 sm:p-4 space-y-3 max-h-[60vh] overflow-auto">
            {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
            {!loading && ordered.length === 0 ? (
              <p className="text-sm text-slate-500">No chat messages yet.</p>
            ) : null}
            {ordered.map((msg) => {
              const media = String(msg.mediaUrl || "").trim();
              return (
                <div key={msg.id} className="rounded-lg border border-black/10 bg-white/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {msg.displayName || fallbackName(msg.createdBy)}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(msg.createdAt)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{msg.body}</p>
                  {media ? (
                    <div className="mt-2">
                      {isImage(media) ? (
                        <img src={media} alt="Shared media" className="max-h-72 w-auto rounded-lg border border-black/10" />
                      ) : isVideo(media) ? (
                        <video controls className="max-h-72 w-full rounded-lg border border-black/10" src={media} />
                      ) : (
                        <a href={media} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                          Open media link
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
