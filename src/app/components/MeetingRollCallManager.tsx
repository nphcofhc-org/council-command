import { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { CheckCircle2, Save, ShieldAlert, Users } from "lucide-react";
import { useCouncilSession } from "../hooks/use-council-session";
import {
  DEFAULT_ROLL_CALL_CONTENT,
  MEMBER_ORGANIZATIONS,
  OFFICER_ROLES,
  type AttendanceStatus,
  type RollCallContent,
  type RollCallRecord,
} from "../data/roll-call";
import { fetchRollCallContent, saveRollCallContent } from "../data/content-api";
import { DEFAULT_LEADERSHIP_CONTENT, type LeadershipContent } from "../data/leadership";
import { fetchLeadershipContent } from "../data/admin-api";

type MeetingOption = {
  meetingKey: string;
  meetingKind: "general" | "exec";
  meetingLabel: string;
  dateISO: string;
};

const STATUS_META: Array<{
  value: AttendanceStatus;
  label: string;
  className: string;
}> = [
  { value: "present", label: "Present", className: "border-emerald-300/50 bg-emerald-500/10 text-emerald-800" },
  { value: "absent", label: "Absent", className: "border-rose-300/50 bg-rose-500/10 text-rose-800" },
  { value: "excused", label: "Excused", className: "border-amber-300/50 bg-amber-500/10 text-amber-800" },
  { value: "na", label: "N/A", className: "border-slate-300/50 bg-slate-500/10 text-slate-700" },
  { value: "", label: "—", className: "border-black/10 bg-white/40 text-slate-600" },
];

function normalizeTitle(value: string | null | undefined): string {
  return String(value || "").trim().toLowerCase();
}

function normalizeDriveImageUrl(raw: string | null | undefined): string {
  const input = String(raw || "").trim();
  if (!input) return "";
  try {
    const u = new URL(input);
    if (u.hostname.toLowerCase() !== "drive.google.com") return input;
    const m = u.pathname.match(/\/file\/d\/([^/]+)\//);
    const fileId = m?.[1] || u.searchParams.get("id");
    if (!fileId) return input;
    return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;
  } catch {
    return input;
  }
}

function PhotoThumb({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const normalized = normalizeDriveImageUrl(imageUrl);
  if (normalized && !failed) {
    return (
      <img
        src={normalized}
        alt={name}
        className="size-12 rounded-xl border border-black/10 object-cover bg-white"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="size-12 rounded-xl border border-black/10 bg-gradient-to-br from-primary/15 via-white/50 to-black/[0.03] flex items-center justify-center text-slate-700 text-sm font-semibold">
      {initials}
    </div>
  );
}

function statusMeta(value: AttendanceStatus) {
  return STATUS_META.find((s) => s.value === value) || STATUS_META[STATUS_META.length - 1];
}

function mergeSeedWithSaved(saved: RollCallContent | null | undefined): RollCallContent {
  const mergedByKey = new Map<string, RollCallRecord>();
  for (const seed of DEFAULT_ROLL_CALL_CONTENT.records) {
    mergedByKey.set(seed.meetingKey, seed);
  }
  for (const row of saved?.records || []) {
    mergedByKey.set(row.meetingKey, row);
  }
  return {
    quorumMinimum: Number.isFinite(Number(saved?.quorumMinimum))
      ? Math.max(1, Math.min(9, Math.trunc(Number(saved?.quorumMinimum))))
      : DEFAULT_ROLL_CALL_CONTENT.quorumMinimum,
    records: Array.from(mergedByKey.values()).sort((a, b) => (a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0)),
  };
}

export function MeetingRollCallManager({ meetingOptions }: { meetingOptions: MeetingOption[] }) {
  const { session } = useCouncilSession();
  const canEdit = session.isCouncilAdmin;

  const [rollCall, setRollCall] = useState(DEFAULT_ROLL_CALL_CONTENT);
  const [selectedMeetingKey, setSelectedMeetingKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [leadership, setLeadership] = useState<LeadershipContent>(DEFAULT_LEADERSHIP_CONTENT);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchRollCallContent().catch(() => null), fetchLeadershipContent().catch(() => null)])
      .then(([rollCallPayload, leadershipPayload]) => {
        if (cancelled) return;
        setRollCall(mergeSeedWithSaved(rollCallPayload?.found ? rollCallPayload.data : null));
        if (leadershipPayload?.found && leadershipPayload.data) {
          setLeadership(leadershipPayload.data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (meetingOptions.length === 0) return;
    if (selectedMeetingKey) return;
    const today = new Date().toISOString().slice(0, 10);
    const nextGeneral =
      meetingOptions.find((m) => m.meetingKind === "general" && m.dateISO >= today) ||
      meetingOptions.find((m) => m.meetingKind === "general") ||
      meetingOptions[0];
    setSelectedMeetingKey(nextGeneral.meetingKey);
  }, [meetingOptions, selectedMeetingKey]);

  const leadershipByTitle = useMemo(() => {
    const map = new Map<string, { name: string; imageUrl?: string | null }>();
    for (const member of leadership.executiveBoard) {
      map.set(normalizeTitle(member.title), { name: member.name, imageUrl: member.imageUrl || "" });
    }
    return map;
  }, [leadership.executiveBoard]);

  const officerRoster = useMemo(
    () =>
      OFFICER_ROLES.map((role) => {
        const found = leadershipByTitle.get(normalizeTitle(role.title));
        return {
          ...role,
          name: found?.name || role.fallbackName,
          imageUrl: found?.imageUrl || "",
        };
      }),
    [leadershipByTitle],
  );

  const selectedMeeting = useMemo(
    () => meetingOptions.find((m) => m.meetingKey === selectedMeetingKey) || null,
    [meetingOptions, selectedMeetingKey],
  );

  const selectedRecord = useMemo<RollCallRecord>(() => {
    if (!selectedMeeting) return DEFAULT_ROLL_CALL_CONTENT.records[0];
    const found = rollCall.records.find((r) => r.meetingKey === selectedMeeting.meetingKey);
    if (found) return found;
    const seeded = DEFAULT_ROLL_CALL_CONTENT.records.find((r) => r.meetingKey === selectedMeeting.meetingKey);
    if (seeded) return seeded;
    return {
      meetingKey: selectedMeeting.meetingKey,
      meetingKind: selectedMeeting.meetingKind,
      meetingLabel: selectedMeeting.meetingLabel,
      dateISO: selectedMeeting.dateISO,
      officerStatus: {},
      orgStatus: {},
      notes: "",
    };
  }, [rollCall.records, selectedMeeting]);

  const presentOrganizations = useMemo(() => {
    let count = 0;
    for (const org of MEMBER_ORGANIZATIONS) {
      if ((selectedRecord.orgStatus[org.key] || "") === "present") count += 1;
    }
    return count;
  }, [selectedRecord.orgStatus]);

  const quorumMinimum = Number.isFinite(Number(rollCall.quorumMinimum))
    ? Math.max(1, Math.min(9, Math.trunc(Number(rollCall.quorumMinimum))))
    : 5;
  const quorumMet = presentOrganizations >= quorumMinimum;

  const presentCountForRecord = (record: RollCallRecord) => {
    let count = 0;
    for (const org of MEMBER_ORGANIZATIONS) {
      if ((record.orgStatus[org.key] || "") === "present") count += 1;
    }
    return count;
  };

  const historicalRecords = useMemo(
    () => [...rollCall.records].sort((a, b) => (a.dateISO > b.dateISO ? -1 : a.dateISO < b.dateISO ? 1 : 0)),
    [rollCall.records],
  );

  const yearlyReport = useMemo(() => {
    const yearMap = new Map<string, RollCallRecord[]>();
    for (const record of historicalRecords) {
      const year = String(record.dateISO || "").slice(0, 4);
      if (!year) continue;
      const list = yearMap.get(year) || [];
      list.push(record);
      yearMap.set(year, list);
    }

    return Array.from(yearMap.entries())
      .sort((a, b) => (a[0] > b[0] ? -1 : 1))
      .map(([year, records]) => {
        const totalMeetings = records.length;
        const quorumMetMeetings = records.filter((r) => presentCountForRecord(r) >= quorumMinimum).length;
        const avgPresent = totalMeetings
          ? Math.round((records.reduce((acc, r) => acc + presentCountForRecord(r), 0) / totalMeetings) * 10) / 10
          : 0;
        return { year, records, totalMeetings, quorumMetMeetings, avgPresent };
      });
  }, [historicalRecords, quorumMinimum]);

  const upsertSelectedRecord = (patch: Partial<RollCallRecord>) => {
    if (!selectedMeeting) return;
    setRollCall((prev) => {
      const nextRecords = [...prev.records];
      const nextValue: RollCallRecord = {
        ...selectedRecord,
        ...patch,
        meetingKey: selectedMeeting.meetingKey,
        meetingKind: selectedMeeting.meetingKind,
        meetingLabel: selectedMeeting.meetingLabel,
        dateISO: selectedMeeting.dateISO,
      };
      const index = nextRecords.findIndex((r) => r.meetingKey === selectedMeeting.meetingKey);
      if (index >= 0) {
        nextRecords[index] = nextValue;
      } else {
        nextRecords.push(nextValue);
      }
      return { ...prev, records: nextRecords };
    });
    setSaveMessage("");
  };

  const setOfficerStatus = (roleKey: string, status: AttendanceStatus) => {
    upsertSelectedRecord({
      officerStatus: { ...selectedRecord.officerStatus, [roleKey]: status },
    });
  };

  const setOrgStatus = (orgKey: string, status: AttendanceStatus) => {
    upsertSelectedRecord({
      orgStatus: { ...selectedRecord.orgStatus, [orgKey]: status },
    });
  };

  const saveAll = async () => {
    if (!canEdit) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const payload = await saveRollCallContent({
        quorumMinimum,
        records: rollCall.records,
      });
      if (payload.data) {
        setRollCall(payload.data);
      }
      setSaveMessage("Attendance saved.");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-black/10">
        <CardContent className="p-6 text-sm text-slate-500">Loading roll call manager…</CardContent>
      </Card>
    );
  }

  if (meetingOptions.length === 0) {
    return (
      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-black/10">
        <CardContent className="p-6 text-sm text-slate-500">
          No meetings found in the calendar. Add General Body and Executive Council dates first.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-black/10">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Interactive Roll Call Manager</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Secretary workspace for attendance tracking across General Body and Executive Council meetings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`border ${quorumMet ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-700" : "border-rose-300/50 bg-rose-500/10 text-rose-700"}`}>
                Quorum: {presentOrganizations}/{MEMBER_ORGANIZATIONS.length} present
              </Badge>
              <Badge variant="secondary" className="border border-black/10 bg-white/50 text-slate-700">
                Minimum {quorumMinimum}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-slate-500">Meeting</p>
              <Select value={selectedMeetingKey} onValueChange={setSelectedMeetingKey}>
                <SelectTrigger className="w-full bg-white/60 border-black/10">
                  <SelectValue placeholder="Select a meeting" />
                </SelectTrigger>
                <SelectContent>
                  {meetingOptions.map((m) => (
                    <SelectItem key={m.meetingKey} value={m.meetingKey}>
                      {m.dateISO} · {m.meetingKind === "exec" ? "Executive Council" : "General Body"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end gap-2">
              <Button onClick={saveAll} disabled={!canEdit || saving} className="gap-2">
                <Save className="size-4" />
                {saving ? "Saving…" : "Save Attendance"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white/40 px-3 py-2 text-xs text-slate-600">
            Quorum rule: at least <strong>{quorumMinimum}</strong> member organizations marked <strong>Present</strong>.
            {selectedMeeting ? (
              <span>
                {" "}
                Currently viewing: <strong>{selectedMeeting.meetingLabel}</strong>.
              </span>
            ) : null}
          </div>

          {saveMessage ? (
            <div className="rounded-xl border border-black/10 bg-white/55 px-3 py-2 text-xs text-slate-700">{saveMessage}</div>
          ) : null}

          {!canEdit ? (
            <div className="rounded-xl border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
              <ShieldAlert className="size-4" />
              View-only mode. Council leadership can edit and save attendance.
            </div>
          ) : null}
        </CardHeader>
      </Card>

      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-black/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Officer Roll Call</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {officerRoster.map((officer) => (
            <div key={officer.key} className="rounded-xl border border-black/10 bg-white/35 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <PhotoThumb name={officer.name} imageUrl={officer.imageUrl} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{officer.title}</p>
                    <p className="text-sm text-slate-600">{officer.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_META.slice(0, 4).map((option) => {
                    const active = (selectedRecord.officerStatus[officer.key] || "") === option.value;
                    return (
                      <button
                        key={option.value || "unset"}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setOfficerStatus(officer.key, option.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${option.className} ${
                          active ? "ring-2 ring-primary/35" : "opacity-70 hover:opacity-100"
                        } ${!canEdit ? "cursor-not-allowed opacity-55" : ""}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-black/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Member Organization Roll Call</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {MEMBER_ORGANIZATIONS.map((org) => {
              const value = selectedRecord.orgStatus[org.key] || "";
              const meta = statusMeta(value);
              return (
                <div key={org.key} className="rounded-xl border border-black/10 bg-white/35 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-900">{org.name}</p>
                    </div>
                    <Badge className={`border ${meta.className}`}>{meta.label}</Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STATUS_META.slice(0, 4).map((option) => {
                      const active = value === option.value;
                      return (
                        <button
                          key={option.value || "unset"}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => setOrgStatus(org.key, option.value)}
                          className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition ${option.className} ${
                            active ? "ring-2 ring-primary/35" : "opacity-70 hover:opacity-100"
                          } ${!canEdit ? "cursor-not-allowed opacity-55" : ""}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`rounded-xl border px-3 py-2 text-sm ${quorumMet ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-800" : "border-rose-300/50 bg-rose-500/10 text-rose-800"}`}>
            <div className="flex items-center gap-2">
              {quorumMet ? <CheckCircle2 className="size-4" /> : <ShieldAlert className="size-4" />}
              {quorumMet
                ? `Quorum met (${presentOrganizations} organizations present).`
                : `No quorum (${presentOrganizations} organizations present; ${quorumMinimum} required).`}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-black/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Historical Attendance Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {yearlyReport.map((year) => (
              <div key={year.year} className="rounded-xl border border-black/10 bg-white/35 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-900">FY {year.year}</p>
                  <Badge variant="secondary" className="border border-black/10 bg-white/50 text-slate-700">
                    {year.totalMeetings} meetings
                  </Badge>
                </div>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  <p>
                    Quorum met: <strong>{year.quorumMetMeetings}/{year.totalMeetings}</strong>
                  </p>
                  <p>
                    Avg orgs present: <strong>{year.avgPresent}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {historicalRecords.map((record) => {
              const present = presentCountForRecord(record);
              const met = present >= quorumMinimum;
              return (
                <div key={record.meetingKey} className="rounded-xl border border-black/10 bg-white/35 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{record.dateISO}</p>
                      <p className="text-xs text-slate-500">{record.meetingKind === "exec" ? "Executive Council" : "General Body"}</p>
                    </div>
                    <Badge className={`border ${met ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-700" : "border-rose-300/50 bg-rose-500/10 text-rose-700"}`}>
                      {met ? "Quorum" : "No Quorum"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{record.meetingLabel}</p>
                  <p className="mt-2 text-xs text-slate-700">
                    Present organizations: <strong>{present}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-black/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Secretary Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={selectedRecord.notes || ""}
            onChange={(e) => upsertSelectedRecord({ notes: e.target.value })}
            rows={5}
            placeholder="Add attendance notes, guest context, late arrivals, or quorum clarification."
            disabled={!canEdit}
            className="bg-white/60 border-black/10"
          />
        </CardContent>
      </Card>
    </div>
  );
}
