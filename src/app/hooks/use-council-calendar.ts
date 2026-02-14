import { useEffect, useMemo, useState } from "react";

export type CouncilCalendarMeeting = {
  kind: "general" | "exec";
  dateISO: string; // YYYY-MM-DD
  label: string; // e.g. "Saturday, Jan 24"
  mode?: string; // e.g. "Virtual Meeting" / "In-Person"
};

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseMonthAbbrev(abbrev: string): number | null {
  const map: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  const key = abbrev.trim().toLowerCase().replace(".", "");
  return key in map ? map[key] : null;
}

function safeText(el: Element | null): string {
  return (el?.textContent || "").trim();
}

function inferExecDateISO(year: number, execLine: string): string | null {
  // "Exec: Thu, Jan 22" or "Executive Council Meeting: Thu, Feb 19"
  const m = execLine.match(
    /(?:Exec|Executive Council Meeting)\s*:\s*[A-Za-z]{2,3},\s*([A-Za-z]{3,4})\s+(\d{1,2})/i,
  );
  if (!m) return null;
  const month = parseMonthAbbrev(m[1]);
  const day = Number(m[2]);
  if (month === null || !Number.isFinite(day)) return null;
  const d = new Date(Date.UTC(year, month, day));
  return toISODate(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function useCouncilCalendarSchedule(calendarPath = "/2026-council-calendar.html") {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<CouncilCalendarMeeting[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(calendarPath, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load calendar (${res.status})`);
        const html = await res.text();
        if (cancelled) return;

        const doc = new DOMParser().parseFromString(html, "text/html");
        const cards = Array.from(doc.querySelectorAll("[data-month][data-date]"));

        const parsed: CouncilCalendarMeeting[] = [];
        for (const card of cards) {
          const dateAttr = card.getAttribute("data-date") || "";
          // data-date is ISO in the file; keep it as the source of truth.
          const generalISO = dateAttr.trim();
          if (!/^\d{4}-\d{2}-\d{2}$/.test(generalISO)) continue;

          const year = Number(generalISO.slice(0, 4));
          const label = safeText(card.querySelector(".text-xl.font-bold")) || generalISO;
          const mode = safeText(card.querySelector(".text-sm.font-semibold"));
          parsed.push({ kind: "general", dateISO: generalISO, label, mode: mode || undefined });

          const execLine = safeText(card.querySelector(".mt-4.border-t"));
          const execISO = inferExecDateISO(year, execLine);
          if (execISO) {
            parsed.push({
              kind: "exec",
              dateISO: execISO,
              label:
                execLine.replace(/^(?:Exec|Executive Council Meeting)\s*:\s*/i, "") || execLine,
            });
          }
        }

        parsed.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
        setMeetings(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load calendar");
        setMeetings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [calendarPath]);

  const generalMeetings = useMemo(
    () => meetings.filter((m) => m.kind === "general"),
    [meetings],
  );
  const execMeetings = useMemo(
    () => meetings.filter((m) => m.kind === "exec"),
    [meetings],
  );

  return { loading, error, meetings, generalMeetings, execMeetings };
}
