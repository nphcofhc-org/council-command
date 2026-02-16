import { json } from "../../_lib/http";
import { getSessionState } from "../../_lib/auth";
import treasuryData from "../../_lib/treasury-data.json";

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
    return json({ error: "Forbidden: treasury access requires President, Vice President, or Treasurer role." }, { status: 403 });
  }

  return json({
    ok: true,
    treasury: treasuryData.TREASURY,
    transactions: treasuryData.TREASURY_TRANSACTIONS,
  });
}

