import { json } from "../../_lib/http";
import { getSessionState } from "../../_lib/auth";
import treasuryData from "../../_lib/treasury-data.json";
import { readLiveTreasuryState } from "../../_lib/treasury-store";

function requireMethods(request, allowed) {
  if (!allowed.includes(request.method)) {
    return json({ error: `Method ${request.method} not allowed.` }, { status: 405 });
  }
  return null;
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET"]);
  if (methodResponse) return methodResponse;

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }
  if (!session.isTreasuryAdmin) {
    return json({ error: "Forbidden: treasury access requires President, Treasurer, or Financial Secretary role." }, { status: 403 });
  }

  const fallbackTreasury = treasuryData?.TREASURY || {};
  const fallbackBalances = fallbackTreasury?.balances || {};
  const fallbackTransactions = Array.isArray(treasuryData?.TREASURY_TRANSACTIONS) ? treasuryData.TREASURY_TRANSACTIONS : [];

  let live = null;
  if (env.DB) {
    try {
      live = await readLiveTreasuryState(env.DB, 600);
    } catch {
      live = null;
    }
  }

  const liveBalances = live?.balances || null;
  const treasury = {
    ...fallbackTreasury,
    paypal: {
      handle: String(fallbackTreasury?.paypal?.handle || "NPHC of Hudson County"),
      payUrl: String(fallbackTreasury?.paypal?.payUrl || ""),
      qrImageUrl: String(fallbackTreasury?.paypal?.qrImageUrl || ""),
    },
    balances: {
      lendingClub: liveBalances ? Number(liveBalances.lendingClub || 0) : Number(fallbackBalances?.lendingClub || 0),
      cashApp: liveBalances ? Number(liveBalances.cashApp || 0) : Number(fallbackBalances?.cashApp || 0),
      paypal: liveBalances ? Number(liveBalances.paypal || 0) : Number(fallbackBalances?.paypal || 0),
    },
    asOfLabel: liveBalances?.asOfLabel || String(fallbackTreasury?.asOfLabel || ""),
    liveMode: Boolean(live?.hasLiveData),
    liveSource: liveBalances?.source || null,
  };

  const transactions = live?.transactions?.length
    ? live.transactions
    : fallbackTransactions;

  return json({
    ok: true,
    treasury,
    transactions,
  });
}
