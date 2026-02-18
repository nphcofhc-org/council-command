// ─── Cloudflare Workers Sync Layer ──────────────────────────────────────────
// This service connects the meeting room to a Cloudflare Worker + KV backend.
// Deploy the Worker code (shown in the sidebar Setup panel) to your account,
// then paste the Worker URL into the sidebar to go live.

const LS_KEY = 'nphc-worker-url';

export function loadWorkerUrl(): string {
  return localStorage.getItem(LS_KEY) ?? '';
}

export function saveWorkerUrl(url: string): void {
  const clean = url.replace(/\/$/, '');
  localStorage.setItem(LS_KEY, clean);
}

export function clearWorkerUrl(): void {
  localStorage.removeItem(LS_KEY);
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function call(url: string, path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const res = await fetch(`${url}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Worker ${method} ${path} → ${res.status}`);
  return res.json();
}

// ─── State shape ─────────────────────────────────────────────────────────────

export interface CFVoteData  { yay: number; nay: number; }
export interface CFVoteSelection { option: 'yay' | 'nay'; voterId: string; voterLabel: string; updatedAt: string; }
export interface CFHand      { id: string; name: string; time: string; }
export interface CFMotion    { id: string; author: string; text: string; time: string; seconded: boolean; }
export interface CFFloorVote { id: string; question: string; yay: number; nay: number; closed: boolean; createdAt: string; }

export interface CFState {
  votes:      Record<string, CFVoteData>;
  voteSelections: Record<string, Record<string, CFVoteSelection>>;
  hands:      CFHand[];
  motions:    CFMotion[];
  floorVotes: CFFloorVote[];
  floorVoteSelections: Record<string, Record<string, CFVoteSelection>>;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const CF = {
  getState:        (u: string)                          => call(u, '/api/state') as Promise<CFState>,
  castVote:        (u: string, key: string, opt: string, voterId: string, voterLabel: string) => call(u, '/api/vote', 'POST', { key, option: opt, voterId, voterLabel }),
  resetVote:       (u: string, key: string)              => call(u, '/api/vote/reset', 'POST', { key }),
  raiseHand:       (u: string, id: string, name: string, time: string) => call(u, '/api/hand/raise', 'POST', { id, name, time }),
  lowerHand:       (u: string, id: string)               => call(u, '/api/hand/lower', 'POST', { id }),
  lowerAllHands:   (u: string)                           => call(u, '/api/hands', 'DELETE'),
  submitMotion:    (u: string, id: string, author: string, text: string, time: string) => call(u, '/api/motion', 'POST', { id, author, text, time }),
  secondMotion:    (u: string, id: string)               => call(u, '/api/motion/second', 'POST', { id }),
  createFloorVote: (u: string, id: string, question: string, createdAt: string) => call(u, '/api/floor-vote', 'POST', { id, question, createdAt }),
  castFloorVote:   (u: string, id: string, opt: string, voterId: string, voterLabel: string)  => call(u, '/api/floor-vote/cast', 'POST', { id, option: opt, voterId, voterLabel }),
  closeFloorVote:  (u: string, id: string)               => call(u, '/api/floor-vote/close', 'POST', { id }),
  resetAll:        (u: string)                           => call(u, '/api/reset', 'POST'),
};

// ─── Worker source (copy-paste into Cloudflare dashboard) ────────────────────
// Requires one KV namespace binding named: MEETING_KV

export const WORKER_SOURCE = `
// ╔══════════════════════════════════════════════════════╗
// ║  NPHC Meeting Room — Cloudflare Worker               ║
// ║                                                      ║
// ║  1. Create a Worker in your Cloudflare dashboard     ║
// ║  2. Add a KV namespace called MEETING_KV             ║
// ║  3. Bind it to this Worker as "MEETING_KV"           ║
// ║  4. Paste & deploy this code                         ║
// ║  5. Copy the Worker URL into the sidebar             ║
// ╚══════════════════════════════════════════════════════╝

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const empty = () => ({ votes: {}, voteSelections: {}, hands: [], motions: [], floorVotes: [], floorVoteSelections: {} });

const ok  = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const err = (m, s = 400) => ok({ error: m }, s);

const ensureVoteBucket = (state, key) => {
  if (!state.votes[key]) state.votes[key] = { yay: 0, nay: 0 };
  if (!state.voteSelections[key]) state.voteSelections[key] = {};
};

const recalcVote = (state, key) => {
  const bucket = state.voteSelections[key] || {};
  let yay = 0;
  let nay = 0;
  for (const voterId in bucket) {
    const opt = bucket[voterId]?.option;
    if (opt === 'yay') yay += 1;
    if (opt === 'nay') nay += 1;
  }
  state.votes[key] = { yay, nay };
};

const ensureFloorVoteBucket = (state, id) => {
  if (!state.floorVoteSelections[id]) state.floorVoteSelections[id] = {};
};

const recalcFloorVote = (state, id) => {
  const floor = state.floorVotes.find(v => v.id === id);
  if (!floor) return;
  const bucket = state.floorVoteSelections[id] || {};
  let yay = 0;
  let nay = 0;
  for (const voterId in bucket) {
    const opt = bucket[voterId]?.option;
    if (opt === 'yay') yay += 1;
    if (opt === 'nay') nay += 1;
  }
  floor.yay = yay;
  floor.nay = nay;
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const { pathname: p } = new URL(req.url);
    const b = req.method !== 'DELETE' ? await req.json().catch(() => ({})) : {};

    try {
      if (p === '/api/state' && req.method === 'GET') {
        return ok(await env.MEETING_KV.get('state', 'json') ?? empty());
      }

      const s = await env.MEETING_KV.get('state', 'json') ?? empty();
      const save = () => env.MEETING_KV.put('state', JSON.stringify(s));

      if (p === '/api/vote'             && req.method === 'POST') {
        if (!b.key || !['yay', 'nay'].includes(b.option)) return err('Invalid vote payload', 400);
        const voterId = String(b.voterId || '').trim();
        if (!voterId) return err('voterId is required', 400);
        ensureVoteBucket(s, b.key);
        s.voteSelections[b.key][voterId] = {
          option: b.option,
          voterId,
          voterLabel: String(b.voterLabel || voterId).slice(0, 120),
          updatedAt: new Date().toISOString(),
        };
        recalcVote(s, b.key);
        await save();
        return ok({ ok: true, vote: s.votes[b.key] });
      }
      if (p === '/api/vote/reset'       && req.method === 'POST') {
        s.votes[b.key] = { yay: 0, nay: 0 };
        delete s.voteSelections[b.key];
        await save();
        return ok({ ok: true });
      }
      if (p === '/api/hand/raise'       && req.method === 'POST') { s.hands.push({ id: b.id, name: b.name, time: b.time }); await save(); return ok({ ok: true }); }
      if (p === '/api/hand/lower'       && req.method === 'POST') { s.hands = s.hands.filter(h => h.id !== b.id); await save(); return ok({ ok: true }); }
      if (p === '/api/hands'            && req.method === 'DELETE') { s.hands = []; await save(); return ok({ ok: true }); }
      if (p === '/api/motion'           && req.method === 'POST') { s.motions.unshift({ id: b.id, author: b.author, text: b.text, time: b.time, seconded: false }); await save(); return ok({ ok: true }); }
      if (p === '/api/motion/second'    && req.method === 'POST') { s.motions = s.motions.map(m => m.id === b.id ? { ...m, seconded: true } : m); await save(); return ok({ ok: true }); }
      if (p === '/api/floor-vote'       && req.method === 'POST') {
        s.floorVotes.unshift({ id: b.id, question: b.question, yay: 0, nay: 0, closed: false, createdAt: b.createdAt });
        ensureFloorVoteBucket(s, b.id);
        await save();
        return ok({ ok: true });
      }
      if (p === '/api/floor-vote/cast'  && req.method === 'POST') {
        if (!b.id || !['yay', 'nay'].includes(b.option)) return err('Invalid floor vote payload', 400);
        const voterId = String(b.voterId || '').trim();
        if (!voterId) return err('voterId is required', 400);
        const floorVote = s.floorVotes.find(v => v.id === b.id);
        if (!floorVote) return err('Floor vote not found', 404);
        if (floorVote.closed) return err('Floor vote is closed', 409);
        ensureFloorVoteBucket(s, b.id);
        s.floorVoteSelections[b.id][voterId] = {
          option: b.option,
          voterId,
          voterLabel: String(b.voterLabel || voterId).slice(0, 120),
          updatedAt: new Date().toISOString(),
        };
        recalcFloorVote(s, b.id);
        await save();
        return ok({ ok: true });
      }
      if (p === '/api/floor-vote/close' && req.method === 'POST') { s.floorVotes = s.floorVotes.map(v => v.id === b.id ? { ...v, closed: true } : v); await save(); return ok({ ok: true }); }
      if (p === '/api/reset'            && req.method === 'POST') { await env.MEETING_KV.put('state', JSON.stringify(empty())); return ok({ ok: true }); }

      return err('Not found', 404);
    } catch (e) { return err(e.message, 500); }
  },
};
`.trim();
