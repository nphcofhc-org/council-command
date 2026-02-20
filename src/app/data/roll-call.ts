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

// Seeded from the provided FY 2024-2026 workbook.
export const ROLL_CALL_SEED_RECORDS: RollCallRecord[] = [
  {
    "meetingKey": "general-2024-01-27",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - January 27, 2024",
    "dateISO": "2024-01-27",
    "officerStatus": {
      "president": "present",
      "vice-president": "excused",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "present",
      "chaplain": "absent",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "present",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "present",
      "phi-beta-sigma": "absent",
      "omega-psi-phi": "absent",
      "sigma-gamma-rho": "absent",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-02-26",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - February 26, 2024",
    "dateISO": "2024-02-26",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "present",
      "chaplain": "na",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "present",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "present",
      "phi-beta-sigma": "present",
      "omega-psi-phi": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-03-25",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - March 25, 2024",
    "dateISO": "2024-03-25",
    "officerStatus": {
      "president": "present",
      "vice-president": "absent",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "absent",
      "chaplain": "na",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "absent",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "absent",
      "phi-beta-sigma": "absent",
      "omega-psi-phi": "absent",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-04-22",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - April 22, 2024",
    "dateISO": "2024-04-22",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "present",
      "chaplain": "na",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "present",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "absent",
      "phi-beta-sigma": "absent",
      "omega-psi-phi": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-05-20",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - May 20, 2024",
    "dateISO": "2024-05-20",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "absent",
      "chaplain": "na",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "present",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "present",
      "phi-beta-sigma": "present",
      "omega-psi-phi": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-06-24",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - June 24, 2024",
    "dateISO": "2024-06-24",
    "officerStatus": {
      "president": "present",
      "vice-president": "absent",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "absent",
      "chaplain": "na",
      "parliamentarian": "excused"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "absent",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "absent",
      "phi-beta-sigma": "absent",
      "omega-psi-phi": "absent",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-09-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - September 01, 2024",
    "dateISO": "2024-09-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "",
      "treasurer": "absent",
      "financial-secretary": "present",
      "chaplain": "",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "present",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "present",
      "phi-beta-sigma": "absent",
      "omega-psi-phi": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-10-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - October 01, 2024",
    "dateISO": "2024-10-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "absent",
      "chaplain": "na",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "absent",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "present",
      "phi-beta-sigma": "present",
      "omega-psi-phi": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-11-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - November 01, 2024",
    "dateISO": "2024-11-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "excused",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "present",
      "chaplain": "",
      "parliamentarian": "na"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "present",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "",
      "phi-beta-sigma": "present",
      "omega-psi-phi": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2024-12-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - December 01, 2024",
    "dateISO": "2024-12-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "absent",
      "secretary": "present",
      "treasurer": "absent",
      "financial-secretary": "absent",
      "chaplain": "",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-kappa-alpha": "present",
      "alpha-phi-alpha": "present",
      "zeta-phi-beta": "present",
      "kappa-alpha-psi": "absent",
      "phi-beta-sigma": "present",
      "omega-psi-phi": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2024 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-01-25",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - January 25, 2025",
    "dateISO": "2025-01-25",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "excused",
      "treasurer": "present",
      "financial-secretary": "absent",
      "chaplain": "absent",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "absent",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "absent"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-02-24",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - February 24, 2025",
    "dateISO": "2025-02-24",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "present",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "present",
      "phi-beta-sigma": "absent",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-03-24",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - March 24, 2025",
    "dateISO": "2025-03-24",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "absent",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "excused",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-04-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - April 01, 2025",
    "dateISO": "2025-04-01",
    "officerStatus": {
      "president": "absent",
      "vice-president": "present",
      "secretary": "absent",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "absent",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "absent",
      "kappa-alpha-psi": "absent",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-05-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - May 01, 2025",
    "dateISO": "2025-05-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "absent",
      "financial-secretary": "na",
      "chaplain": "present",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "absent",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "absent",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-06-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - June 01, 2025",
    "dateISO": "2025-06-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "absent",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "absent",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-09-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - September 01, 2025",
    "dateISO": "2025-09-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "absent",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-phi-alpha": "absent",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-10-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - October 01, 2025",
    "dateISO": "2025-10-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "absent",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "absent",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "absent",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-11-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - November 01, 2025",
    "dateISO": "2025-11-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "absent",
      "parliamentarian": "present"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "present",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2025-12-01",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - December 01, 2025",
    "dateISO": "2025-12-01",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "present",
      "financial-secretary": "na",
      "chaplain": "present",
      "parliamentarian": "absent"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "present",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "present",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "present",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "present"
    },
    "notes": "Imported from FY 2025 roll-call workbook."
  },
  {
    "meetingKey": "general-2026-01-24",
    "meetingKind": "general",
    "meetingLabel": "General Body Meeting - January 24, 2026",
    "dateISO": "2026-01-24",
    "officerStatus": {
      "president": "present",
      "vice-president": "present",
      "secretary": "present",
      "treasurer": "na",
      "financial-secretary": "na",
      "chaplain": "na",
      "parliamentarian": "na"
    },
    "orgStatus": {
      "alpha-phi-alpha": "present",
      "alpha-kappa-alpha": "absent",
      "kappa-alpha-psi": "present",
      "omega-psi-phi": "absent",
      "phi-beta-sigma": "present",
      "zeta-phi-beta": "absent",
      "sigma-gamma-rho": "present",
      "delta-sigma-theta": "absent",
      "iota-phi-theta": "present"
    },
    "notes": "Imported from 2026 roll-call workbook."
  }
];

export const DEFAULT_ROLL_CALL_CONTENT: RollCallContent = {
  quorumMinimum: QUORUM_MINIMUM_DEFAULT,
  records: ROLL_CALL_SEED_RECORDS,
};
