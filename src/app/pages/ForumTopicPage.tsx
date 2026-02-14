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
        <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black">
          <ArrowLeft className="size-4" />
          Back to Forum
        </Link>
        <Button variant="outline" className="gap-2" onClick={load} disabled={!canUse || loading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader>
          <CardTitle>{topic?.title || "Topic"}</CardTitle>
          <CardDescription>
            {topic?.updatedAt ? `Updated ${fmtDateTime(topic.updatedAt)}` : null}
            {locked ? " • Locked" : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canUse ? (
            <p className="text-sm text-gray-700">
              You must be authenticated to use the forum. If you see this, refresh and complete Cloudflare Access login.
            </p>
          ) : null}

          {message ? <p className="text-sm text-green-700 font-semibold">{message}</p> : null}
          {error ? <p className="text-sm text-red-700 font-semibold">{error}</p> : null}
          {loading ? <p className="text-sm text-gray-500">Loading...</p> : null}

          {!loading && posts.length === 0 ? (
            <p className="text-sm text-gray-600">No posts.</p>
          ) : null}

          <div className="space-y-3">
            {posts.map((p, idx) => (
              <div key={p.id} className={`rounded-xl border p-4 sm:p-5 ${idx === 0 ? "border-black/15 bg-gray-50/60" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    {displayEmail(p.createdBy)} • {fmtDateTime(p.createdAt)}
                  </p>
                  {idx === 0 ? (
                    <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[11px] text-gray-600">
                      Original Post
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 p-4 sm:p-5 bg-gray-50/40">
            <p className="text-sm font-semibold text-black mb-2">Add Reply</p>
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
                className="bg-black hover:bg-gray-800 gap-2"
              >
                <Send className="size-4" />
                {saving ? "Posting..." : "Post Reply"}
              </Button>
              {locked ? (
                <p className="text-xs text-gray-600">Topic is locked.</p>
              ) : (
                <p className="text-xs text-gray-600">Keep it respectful and on-topic.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

