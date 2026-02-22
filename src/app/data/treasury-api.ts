export type TreasuryAccount = "LendingClub" | "Cash App" | "PayPal";
export type TreasuryTxnType = "credit" | "debit";

export type TreasuryTransaction = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TreasuryTxnType;
  category: string;
  account: TreasuryAccount;
};

export type TreasuryPayload = {
  cashApp: {
    cashtag: string;
    payUrl: string;
    qrImageUrl: string;
  };
  paypal?: {
    handle: string;
    payUrl: string;
    qrImageUrl?: string;
  };
  balances: {
    lendingClub: number;
    cashApp: number;
    paypal?: number;
  };
  asOfLabel: string;
  liveMode?: boolean;
  liveSource?: string | null;
};

export type TreasuryStatementArchiveEntry = {
  id: string;
  account: "LendingClub" | "Cash App";
  label: string;
  periodStart: string;
  periodEnd: string;
  statementDate: string;
  url: string;
  notes: string;
  openingBalance: number | null;
  closingBalance: number | null;
  reconciled: boolean;
  createdAt: string;
};

export type TreasuryOnePagerRecord = {
  id: string;
  title: string;
  year: string;
  body: string;
  generatedAt: string;
};

export type TreasuryReportingToolsState = {
  statements: TreasuryStatementArchiveEntry[];
  onePagers: TreasuryOnePagerRecord[];
};

const TREASURY_ENDPOINT = "/api/treasury/data";
const TREASURY_REPORTING_ENDPOINT = "/api/treasury/reporting";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

export async function fetchTreasuryData(): Promise<{ treasury: TreasuryPayload; transactions: TreasuryTransaction[] }> {
  const res = await fetch(TREASURY_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return {
    treasury: data?.treasury as TreasuryPayload,
    transactions: Array.isArray(data?.transactions) ? (data.transactions as TreasuryTransaction[]) : [],
  };
}

export async function fetchTreasuryReportingTools(): Promise<{
  found: boolean;
  data: TreasuryReportingToolsState;
  updatedAt: string | null;
  updatedBy: string | null;
}> {
  const res = await fetch(TREASURY_REPORTING_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return {
    found: Boolean(data?.found),
    data: {
      statements: Array.isArray(data?.data?.statements) ? (data.data.statements as TreasuryStatementArchiveEntry[]) : [],
      onePagers: Array.isArray(data?.data?.onePagers) ? (data.data.onePagers as TreasuryOnePagerRecord[]) : [],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function saveTreasuryReportingTools(payload: TreasuryReportingToolsState): Promise<{
  found: boolean;
  data: TreasuryReportingToolsState;
  updatedAt: string | null;
  updatedBy: string | null;
}> {
  const res = await fetch(TREASURY_REPORTING_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return {
    found: Boolean(data?.found),
    data: {
      statements: Array.isArray(data?.data?.statements) ? (data.data.statements as TreasuryStatementArchiveEntry[]) : [],
      onePagers: Array.isArray(data?.data?.onePagers) ? (data.data.onePagers as TreasuryOnePagerRecord[]) : [],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}
