export type AttendanceStatus = "" | "present" | "absent" | "excused" | "na";

export type OfficerRole = {
  key: string;
  title: string;
  fallbackName: string;
};

export type MemberOrganization = {
  key: string;
  name: string;
};

export type RollCallRecord = {
  meetingKey: string;
  meetingKind: "general" | "exec";
  meetingLabel: string;
  dateISO: string;
  officerStatus: Record<string, AttendanceStatus>;
  orgStatus: Record<string, AttendanceStatus>;
  notes: string;
};

export type RollCallContent = {
  quorumMinimum: number;
  records: RollCallRecord[];
};

export const QUORUM_MINIMUM_DEFAULT = 5;

export const OFFICER_ROLES: OfficerRole[] = [
  { key: "president", title: "President", fallbackName: "Christopher DeMarkus" },
  { key: "vice-president", title: "Vice President", fallbackName: "Kimberly Conway" },
  { key: "secretary", title: "Secretary", fallbackName: "April Stitt" },
  { key: "treasurer", title: "Treasurer", fallbackName: "Gibrill Kamara" },
  { key: "financial-secretary", title: "Financial Secretary", fallbackName: "Chris Gadsden" },
  { key: "chaplain", title: "Chaplain", fallbackName: "Dr. Viva White" },
  { key: "parliamentarian", title: "Parliamentarian", fallbackName: "Ayesha Noel-Smith" },
];

export const MEMBER_ORGANIZATIONS: MemberOrganization[] = [
  { key: "alpha-phi-alpha", name: "Alpha Phi Alpha" },
  { key: "alpha-kappa-alpha", name: "Alpha Kappa Alpha" },
  { key: "kappa-alpha-psi", name: "Kappa Alpha Psi" },
  { key: "omega-psi-phi", name: "Omega Psi Phi" },
  { key: "phi-beta-sigma", name: "Phi Beta Sigma" },
  { key: "zeta-phi-beta", name: "Zeta Phi Beta" },
  { key: "sigma-gamma-rho", name: "Sigma Gamma Rho" },
  { key: "delta-sigma-theta", name: "Delta Sigma Theta" },
  { key: "iota-phi-theta", name: "Iota Phi Theta" },
];

// Seeded from the provided FY 2026 workbook ("2026" sheet, January 24 row set).
export const ROLL_CALL_SEED_RECORDS: RollCallRecord[] = [
  {
    meetingKey: "general-2026-01-24",
    meetingKind: "general",
    meetingLabel: "General Body Meeting — Saturday, Jan 24, 2026",
    dateISO: "2026-01-24",
    officerStatus: {
      president: "present",
      "vice-president": "present",
      secretary: "present",
      treasurer: "na",
      "financial-secretary": "na",
      chaplain: "na",
      parliamentarian: "na",
    },
    orgStatus: {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "absent",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "absent",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "absent",
      "iota-phi-theta": "present",
    },
    notes: "Imported from FY 2026 roll-call workbook.",
  },
];

export const DEFAULT_ROLL_CALL_CONTENT: RollCallContent = {
  quorumMinimum: QUORUM_MINIMUM_DEFAULT,
  records: ROLL_CALL_SEED_RECORDS,
};

