import { getSessionState } from "../../_lib/auth";
import { json } from "../../_lib/http";

export async function onRequestGet({ request, env }) {
  const session = await getSessionState(request, env);

  return json({
    authenticated: session.isAuthenticated,
    email: session.email || null,
    isCouncilAdmin: session.isCouncilAdmin,
    isTreasuryAdmin: Boolean(session.isTreasuryAdmin),
    isSiteEditor: Boolean(session.isSiteEditor),
    isPresident: Boolean(session.isPresident),
  });
}
