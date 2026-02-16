export type TreasuryAccount = "LendingClub" | "Cash App";
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
  balances: {
    lendingClub: number;
    cashApp: number;
  };
  asOfLabel: string;
};

const TREASURY_ENDPOINT = "/api/treasury/data";

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

