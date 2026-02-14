import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, RefreshCw, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useCouncilSession } from "../hooks/use-council-session";
import { createForumPost, fetchForumTopic, type ForumPost, type ForumTopicDetail } from "../data/forum-api";

function fmtDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function displayEmail(email: string | null): string {
  if (!email) return "Member";
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}

export function ForumTopicPage() {
  const { id } = useParams();
  const topicId = String(id || "").trim();
  const { session } = useCouncilSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ForumTopicDetail | null>(null);

  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canUse = session.authenticated;

  const load = async () => {
    if (!topicId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await fetchForumTopic(topicId);
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load topic.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canUse) {
      setLoading(false);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUse, topicId]);

  const posts: ForumPost[] = useMemo(() => detail?.posts || [], [detail]);
  const topic = detail?.topic || null;
  const locked = Boolean(topic?.locked);

  const submitReply = async () => {
    const body = reply.trim();
    if (!body) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await createForumPost({ topicId, body });
      setReply("");
      setMessage("Reply posted.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post reply.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors">
          <ArrowLeft className="size-4" />
          Back to Forum
        </Link>
        <Button
          variant="outline"
          className="gap-2 border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
          onClick={load}
          disabled={!canUse || loading}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle>{topic?.title || "Topic"}</CardTitle>
          <CardDescription>
            {topic?.updatedAt ? `Updated ${fmtDateTime(topic.updatedAt)}` : null}
            {locked ? " • Locked" : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canUse ? (
            <p className="text-sm text-white/70">
              You must be authenticated to use the forum. If you see this, refresh and complete Cloudflare Access login.
            </p>
          ) : null}

          {message ? <p className="text-sm text-emerald-300 font-semibold">{message}</p> : null}
          {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}
          {loading ? <p className="text-sm text-white/60">Loading...</p> : null}

          {!loading && posts.length === 0 ? (
            <p className="text-sm text-white/70">No posts.</p>
          ) : null}

          <div className="space-y-3">
            {posts.map((p, idx) => (
              <div
                key={p.id}
                className={`rounded-xl border p-4 sm:p-5 ${
                  idx === 0 ? "border-primary/25 bg-primary/10" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-white/60">
                    {displayEmail(p.createdBy)} • {fmtDateTime(p.createdAt)}
                  </p>
                  {idx === 0 ? (
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary">
                      Original Post
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 p-4 sm:p-5 bg-white/5">
            <p className="text-sm font-semibold text-white mb-2">Add Reply</p>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
              placeholder={locked ? "This topic is locked." : "Write your reply…"}
              disabled={!canUse || locked || saving}
            />
            <div className="mt-3 flex items-center gap-2">
              <Button
                onClick={submitReply}
                disabled={!canUse || locked || saving || reply.trim().length === 0}
                className="gap-2"
              >
                <Send className="size-4" />
                {saving ? "Posting..." : "Post Reply"}
              </Button>
              {locked ? (
                <p className="text-xs text-white/60">Topic is locked.</p>
              ) : (
                <p className="text-xs text-white/60">Keep it respectful and on-topic.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
