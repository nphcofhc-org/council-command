import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import type { ChapterDuesEntry } from "../data/admin-api";
import { fetchChapterDuesTracker, saveChapterDuesTracker } from "../data/admin-api";

type ChapterDuesTrackerPanelProps = {
  description: string;
};

export function ChapterDuesTrackerPanel({ description }: ChapterDuesTrackerPanelProps) {
  const [chapterDuesEntries, setChapterDuesEntries] = useState<ChapterDuesEntry[]>([]);
  const [chapterDuesLoading, setChapterDuesLoading] = useState(true);
  const [chapterDuesSaving, setChapterDuesSaving] = useState(false);
  const [chapterDuesError, setChapterDuesError] = useState<string | null>(null);
  const [chapterDuesMessage, setChapterDuesMessage] = useState<string | null>(null);
  const [chapterDuesUpdatedAt, setChapterDuesUpdatedAt] = useState<string | null>(null);
  const [chapterDuesUpdatedBy, setChapterDuesUpdatedBy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setChapterDuesLoading(true);
    setChapterDuesError(null);
    void fetchChapterDuesTracker()
      .then((res) => {
        if (cancelled) return;
        setChapterDuesEntries(Array.isArray(res.data?.entries) ? res.data.entries : []);
        setChapterDuesUpdatedAt(res.updatedAt);
        setChapterDuesUpdatedBy(res.updatedBy);
      })
      .catch((err) => {
        if (cancelled) return;
        setChapterDuesError(err instanceof Error ? err.message : "Failed to load chapter dues tracker.");
      })
      .finally(() => {
        if (!cancelled) setChapterDuesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateChapterDuesDate = (entryId: string, paidDate: string) => {
    setChapterDuesEntries((prev) =>
      prev.map((row) => (row.id === entryId ? { ...row, paidDate } : row)),
    );
    setChapterDuesError(null);
    setChapterDuesMessage(null);
  };

  const clearChapterDuesDate = (entryId: string) => {
    updateChapterDuesDate(entryId, "");
  };

  const saveChapterDues = async () => {
    setChapterDuesSaving(true);
    setChapterDuesError(null);
    setChapterDuesMessage(null);
    try {
      const result = await saveChapterDuesTracker(chapterDuesEntries);
      setChapterDuesEntries(result.data.entries);
      setChapterDuesUpdatedAt(result.updatedAt);
      setChapterDuesUpdatedBy(result.updatedBy);
      setChapterDuesMessage("Chapter dues payment dates saved.");
    } catch (err) {
      setChapterDuesError(err instanceof Error ? err.message : "Failed to save chapter dues tracker.");
    } finally {
      setChapterDuesSaving(false);
    }
  };

  return (
    <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Chapter Dues Payment Confirmation
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {chapterDuesLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="size-4 animate-spin" />
            Loading chapter dues tracker...
          </div>
        ) : null}

        {!chapterDuesLoading ? (
          <div className="overflow-x-auto rounded-lg border border-black/10">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-black/10 bg-white/30">
                  <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Chapter</th>
                  <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Paid Date</th>
                  <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {chapterDuesEntries.map((entry) => {
                  const paid = Boolean(entry.paidDate);
                  return (
                    <tr key={entry.id} className="border-b border-black/5 bg-white/10">
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-slate-900">{entry.chapter}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="date"
                          value={entry.paidDate || ""}
                          onChange={(e) => updateChapterDuesDate(entry.id, e.target.value)}
                          className="max-w-[190px]"
                          disabled={chapterDuesSaving}
                          aria-label={`Paid date for ${entry.chapter}`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            paid
                              ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-800"
                              : "border-slate-300/60 bg-slate-500/10 text-slate-700"
                          }`}
                        >
                          {paid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                          onClick={() => clearChapterDuesDate(entry.id)}
                          disabled={chapterDuesSaving || !entry.paidDate}
                        >
                          Clear
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {chapterDuesUpdatedAt
              ? `Last saved ${new Date(chapterDuesUpdatedAt).toLocaleString()}${chapterDuesUpdatedBy ? ` by ${chapterDuesUpdatedBy}` : ""}`
              : "No chapter dues updates saved yet."}
          </p>
          <Button
            type="button"
            onClick={saveChapterDues}
            disabled={chapterDuesLoading || chapterDuesSaving}
            className="gap-2"
          >
            {chapterDuesSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {chapterDuesSaving ? "Saving..." : "Save Dues Dates"}
          </Button>
        </div>

        {chapterDuesError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{chapterDuesError}</p>
        ) : null}
        {chapterDuesMessage ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{chapterDuesMessage}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
