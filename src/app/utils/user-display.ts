import type { CouncilSession } from "../data/admin-api";
import type { MemberDirectory } from "../data/member-directory";

function titleCaseWord(w: string): string {
  const s = (w || "").trim();
  if (!s) return "";
  return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}

export function nameFromEmail(email: string | null | undefined): string {
  const raw = String(email || "").trim();
  if (!raw.includes("@")) return raw || "Member";
  const local = raw.split("@")[0] || "";
  const first = local.split(/[._-]/g).filter(Boolean)[0] || local;
  const cleaned = first.replace(/[^a-zA-Z]/g, "");
  return cleaned ? titleCaseWord(cleaned) : titleCaseWord(first) || "Member";
}

export function lookupDirectoryEntry(directory: MemberDirectory | null | undefined, email: string | null | undefined) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return null;
  const list = directory?.entries || [];
  return list.find((x) => String(x?.email || "").trim().toLowerCase() === e) || null;
}

export function sessionRoleLabel(session: CouncilSession): string {
  if (session.isSiteEditor) return "Site Administration";
  if (session.isCouncilAdmin) return "Council Leadership";
  return "Member";
}

export function sessionDisplayName(session: CouncilSession, directory?: MemberDirectory | null): { name: string; designation?: string } {
  const entry = lookupDirectoryEntry(directory || null, session.email);
  const name = (entry?.displayName || "").trim() || nameFromEmail(session.email);
  const designation = (entry?.designation || "").trim() || undefined;
  return { name, designation };
}

