import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageSquarePlus, RefreshCw, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useCouncilSession } from "../hooks/use-council-session";
import { createForumTopic, fetchForumTopics, type ForumTopic } from "../data/forum-api";

function fmtDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ForumPage() {
  const { session } = useCouncilSession();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const canUse = session.authenticated;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchForumTopics(120);
      setTopics(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load forum topics.");
      setTopics([]);
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
  }, [canUse]);

  const replyCount = useMemo(() => {
    return new Map(topics.map((t) => [t.id, Math.max(0, (t.postCount || 0) - 1)]));
  }, [topics]);

  const create = async () => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    setSaving(true);
    setError(null);
    try {
      const res = await createForumTopic({ title: t, body: b });
      setTitle("");
      setBody("");
      setCreateOpen(false);
      navigate(`/forum/${encodeURIComponent(res.topicId)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create topic.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors">
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
            onClick={load}
            disabled={!canUse || loading}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={() => setCreateOpen((v) => !v)} disabled={!canUse}>
            <MessageSquarePlus className="size-4" />
            New Topic
          </Button>
        </div>
      </div>

      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Discussion Forum</CardTitle>
          <CardDescription>
            Members can create topics for debate, questions, and council discussion. Posts are visible to authenticated portal members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canUse ? (
            <p className="text-sm text-white/70">
              You must be authenticated to use the forum. If you see this, refresh and complete Cloudflare Access login.
            </p>
          ) : null}

          {createOpen ? (
            <div className="rounded-xl border border-white/10 p-4 sm:p-5 space-y-3 bg-white/5">
              <div className="space-y-1">
                <Label>Topic Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: 2026 signature event discussion" />
              </div>
              <div className="space-y-1">
                <Label>First Post</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Start the discussion. Keep it respectful." />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={create} disabled={saving || title.trim().length === 0 || body.trim().length === 0}>
                  {saving ? "Posting..." : "Post Topic"}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
                  onClick={() => setCreateOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-300 font-semibold">{error}</p> : null}
          {loading ? <p className="text-sm text-white/60">Loading...</p> : null}

          {!loading && topics.length === 0 ? (
            <p className="text-sm text-white/70">No topics yet. Create the first one.</p>
          ) : null}

          <div className="grid gap-4">
            {topics.map((topic) => (
              <Link key={topic.id} to={`/forum/${encodeURIComponent(topic.id)}`} className="group">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-primary/40 hover:bg-white/10 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{topic.title}</p>
                      <p className="text-xs text-white/60 mt-1">
                        Updated {fmtDate(topic.updatedAt)} • Replies {replyCount.get(topic.id) ?? 0}
                      </p>
                    </div>
                    {topic.locked ? (
                      <span className="shrink-0 rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 text-[11px] text-white/70">
                        Locked
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
