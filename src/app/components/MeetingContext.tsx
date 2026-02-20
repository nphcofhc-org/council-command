import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CF, loadWorkerUrl, saveWorkerUrl, clearWorkerUrl } from '../services/CloudflareSync';
import type { CFState, CFVoteSelection } from '../services/CloudflareSync';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VoteData   { yay: number; nay: number; }
export type VoteChoice = 'yay' | 'nay';
export interface HandRaise  { id: string; name: string; time: string; }
export interface Motion     { id: string; author: string; text: string; time: string; seconded: boolean; }
export interface FloorVote  { id: string; question: string; yay: number; nay: number; closed: boolean; createdAt: string; }

export const VOTE_LABELS: Record<string, { label: string; desc: string }> = {
  'agenda-adoption':      { label: 'Adoption of the Agenda',  desc: 'Motion to approve the order of business' },
  'treasurer':            { label: 'Treasurer',                desc: 'Ratify the Treasurer appointment' },
  'financial-secretary':  { label: 'Financial Secretary',      desc: 'Ratify the Financial Secretary appointment' },
  'parliamentarian':      { label: 'Parliamentarian',          desc: 'Ratify the Parliamentarian appointment' },
  'd9-sponsorship':       { label: '$500 D9 Sponsorship',      desc: 'Approve funding for Trenton delegation' },
};

export const SLIDE_VOTES: Record<number, string[]> = {
  1: ['agenda-adoption'],
  3: ['treasurer', 'financial-secretary', 'parliamentarian'],
  4: ['d9-sponsorship'],
};

// ─── Context type ────────────────────────────────────────────────────────────

interface Ctx {
  canControl: boolean;
  voterId: string;
  memberName:  string;
  setMemberName: (n: string) => void;
  // Cloudflare sync
  workerUrl:   string;
  setWorkerUrl: (url: string) => void;
  disconnectWorker: () => void;
  connected:   boolean;
  syncing:     boolean;
  syncError:   string;
  lastSynced:  Date | null;
  // Votes
  votes:       Record<string, VoteData>;
  voteSelections: Record<string, Record<string, CFVoteSelection>>;
  myVotes: Record<string, VoteChoice>;
  castVote:    (key: string, opt: VoteChoice) => void;
  resetVote:   (key: string) => void;
  // Hands
  hands:       HandRaise[];
  myHandId:    string | null;
  raiseHand:   (name: string) => void;
  lowerMyHand: () => void;
  lowerAllHands: () => void;
  // Motions
  motions:     Motion[];
  submitMotion: (author: string, text: string) => void;
  secondMotion: (id: string) => void;
  // Floor votes
  floorVotes:  FloorVote[];
  floorVoteSelections: Record<string, Record<string, CFVoteSelection>>;
  myFloorVotes: Record<string, VoteChoice>;
  createFloorVote: (question: string) => void;
  castFloorVote:   (id: string, opt: VoteChoice) => void;
  closeFloorVote:  (id: string) => void;
  // Reset all
  resetMeeting: () => void;
}

const MeetingContext = createContext<Ctx>({
  canControl: true,
  voterId: '',
  memberName: '', setMemberName: () => {},
  workerUrl: '', setWorkerUrl: () => {}, disconnectWorker: () => {},
  connected: false, syncing: false, syncError: '', lastSynced: null,
  votes: {}, voteSelections: {}, myVotes: {}, castVote: () => {}, resetVote: () => {},
  hands: [], myHandId: null, raiseHand: () => {}, lowerMyHand: () => {}, lowerAllHands: () => {},
  motions: [], submitMotion: () => {}, secondMotion: () => {},
  floorVotes: [], floorVoteSelections: {}, myFloorVotes: {}, createFloorVote: () => {}, castFloorVote: () => {}, closeFloorVote: () => {},
  resetMeeting: () => {},
});

export function useMeeting() { return useContext(MeetingContext); }

// ─── Provider ─────────────────────────────────────────────────────────────────

const LOCAL_VOTER_ID_KEY = 'nphc-meeting-voter-id';

function normalizeVoterId(value: string | null | undefined) {
  return String(value || '').trim().toLowerCase();
}

function fallbackNameFromEmail(email: string | null | undefined) {
  const normalized = normalizeVoterId(email);
  if (!normalized.includes('@')) return '';
  const local = normalized.split('@')[0] || '';
  if (!local) return '';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveLocalVoterId() {
  if (typeof window === 'undefined') return `local-${Date.now()}`;
  const existing = window.localStorage.getItem(LOCAL_VOTER_ID_KEY);
  if (existing) return existing;
  const generated = `local-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(LOCAL_VOTER_ID_KEY, generated);
  return generated;
}

function tallySelections(bucket: Record<string, CFVoteSelection> | undefined): VoteData {
  let yay = 0;
  let nay = 0;
  for (const key in (bucket || {})) {
    const option = bucket?.[key]?.option;
    if (option === 'yay') yay += 1;
    if (option === 'nay') nay += 1;
  }
  return { yay, nay };
}

type MeetingProviderProps = {
  children: React.ReactNode;
  voterEmail?: string | null;
  defaultMemberName?: string;
  canControl?: boolean;
};

export function MeetingProvider({ children, voterEmail, defaultMemberName, canControl = true }: MeetingProviderProps) {
  const voterId = useMemo(() => normalizeVoterId(voterEmail) || resolveLocalVoterId(), [voterEmail]);
  const derivedDefaultName = defaultMemberName?.trim() || fallbackNameFromEmail(voterEmail);

  const [memberName,  setMemberName]  = useState(derivedDefaultName);
  const [workerUrl,   setWorkerUrlState] = useState(loadWorkerUrl);
  const [connected,   setConnected]   = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [syncError,   setSyncError]   = useState('');
  const [lastSynced,  setLastSynced]  = useState<Date | null>(null);

  const [votes,      setVotes]      = useState<Record<string, VoteData>>({});
  const [voteSelections, setVoteSelections] = useState<Record<string, Record<string, CFVoteSelection>>>({});
  const [myVotes, setMyVotes] = useState<Record<string, VoteChoice>>({});
  const [hands,      setHands]      = useState<HandRaise[]>([]);
  const [myHandId,   setMyHandId]   = useState<string | null>(null);
  const [motions,    setMotions]    = useState<Motion[]>([]);
  const [floorVotes, setFloorVotes] = useState<FloorVote[]>([]);
  const [floorVoteSelections, setFloorVoteSelections] = useState<Record<string, Record<string, CFVoteSelection>>>({});
  const [myFloorVotes, setMyFloorVotes] = useState<Record<string, VoteChoice>>({});

  const myHandIdRef = useRef(myHandId);
  myHandIdRef.current = myHandId;

  const ts = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (derivedDefaultName && !memberName.trim()) {
      setMemberName(derivedDefaultName);
    }
  }, [derivedDefaultName, memberName]);

  // ── Cloudflare helpers ──────────────────────────────────────────────────

  const applyState = useCallback((s: CFState) => {
    const incomingVoteSelections = s.voteSelections ?? {};
    const incomingVotes = Object.keys(incomingVoteSelections).length > 0
      ? Object.fromEntries(Object.entries(incomingVoteSelections).map(([key, bucket]) => [key, tallySelections(bucket)]))
      : (s.votes ?? {});
    const incomingFloorSelections = s.floorVoteSelections ?? {};

    setVotes(incomingVotes);
    setVoteSelections(incomingVoteSelections);
    setMyVotes(
      Object.fromEntries(
        Object.entries(incomingVoteSelections)
          .map(([key, bucket]) => [key, bucket?.[voterId]?.option])
          .filter((entry): entry is [string, VoteChoice] => entry[1] === 'yay' || entry[1] === 'nay'),
      ),
    );
    setHands(s.hands ?? []);
    setMotions(s.motions ?? []);
    setFloorVotes(s.floorVotes ?? []);
    setFloorVoteSelections(incomingFloorSelections);
    setMyFloorVotes(
      Object.fromEntries(
        Object.entries(incomingFloorSelections)
          .map(([key, bucket]) => [key, bucket?.[voterId]?.option])
          .filter((entry): entry is [string, VoteChoice] => entry[1] === 'yay' || entry[1] === 'nay'),
      ),
    );
    // Reconcile myHandId — keep it only if it's still in the hands list
    setMyHandId(prev => (s.hands ?? []).some(h => h.id === prev) ? prev : null);
  }, [voterId]);

  const poll = useCallback(async (url: string) => {
    if (!url) return;
    setSyncing(true);
    try {
      const state = await CF.getState(url);
      applyState(state);
      setConnected(true);
      setSyncError('');
      setLastSynced(new Date());
    } catch (e: any) {
      setSyncError(e.message ?? 'Connection failed');
      setConnected(false);
    } finally {
      setSyncing(false);
    }
  }, [applyState]);

  // Initial connect + polling interval
  useEffect(() => {
    if (!workerUrl) { setConnected(false); return; }
    poll(workerUrl);
    const id = setInterval(() => poll(workerUrl), 3000);
    return () => clearInterval(id);
  }, [workerUrl, poll]);

  // ── Context setters ────────────────────────────────────────────────────

  const setWorkerUrl = (url: string) => {
    const clean = url.replace(/\/$/, '');
    saveWorkerUrl(clean);
    setWorkerUrlState(clean);
    setConnected(false);
    setSyncError('');
  };

  const disconnectWorker = () => {
    clearWorkerUrl();
    setWorkerUrlState('');
    setConnected(false);
    setSyncError('');
  };

  // ── Optimistic helpers ─────────────────────────────────────────────────
  // Each mutation updates local state immediately, then posts to Worker.
  // The next poll (≤3s) will reconcile everyone's state.

  const withCF = (fn: () => Promise<unknown>) => {
    if (workerUrl) fn().catch((e: any) => setSyncError(e.message));
  };

  // ── Votes ──────────────────────────────────────────────────────────────

  const castVote = (key: string, opt: VoteChoice) => {
    if (!canControl) return;
    const voterLabel = (memberName.trim() || derivedDefaultName || voterId).slice(0, 120);
    setVoteSelections((prev) => {
      const bucket = { ...(prev[key] || {}) };
      bucket[voterId] = {
        option: opt,
        voterId,
        voterLabel,
        updatedAt: new Date().toISOString(),
      };
      const next = { ...prev, [key]: bucket };
      setVotes((current) => ({ ...current, [key]: tallySelections(bucket) }));
      return next;
    });
    setMyVotes((prev) => ({ ...prev, [key]: opt }));
    withCF(() => CF.castVote(workerUrl, key, opt, voterId, voterLabel));
  };

  const resetVote = (key: string) => {
    if (!canControl) return;
    setVotes(p => ({ ...p, [key]: { yay: 0, nay: 0 } }));
    setVoteSelections((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setMyVotes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    withCF(() => CF.resetVote(workerUrl, key));
  };

  // ── Hands ──────────────────────────────────────────────────────────────

  const raiseHand = (name: string) => {
    if (!canControl) return;
    if (myHandIdRef.current) return;
    const id = Date.now().toString();
    const time = ts();
    setHands(p => [...p, { id, name: name.trim() || 'Anonymous', time }]);
    setMyHandId(id);
    withCF(() => CF.raiseHand(workerUrl, id, name.trim() || 'Anonymous', time));
  };

  const lowerMyHand = () => {
    if (!canControl) return;
    const id = myHandIdRef.current;
    if (!id) return;
    setHands(p => p.filter(h => h.id !== id));
    setMyHandId(null);
    withCF(() => CF.lowerHand(workerUrl, id));
  };

  const lowerAllHands = () => {
    if (!canControl) return;
    setHands([]);
    setMyHandId(null);
    withCF(() => CF.lowerAllHands(workerUrl));
  };

  // ── Motions ────────────────────────────────────────────────────────────

  const submitMotion = (author: string, text: string) => {
    if (!canControl) return;
    if (!text.trim()) return;
    const id = Date.now().toString();
    const time = ts();
    const m: Motion = { id, author: author.trim() || 'Anonymous', text: text.trim(), time, seconded: false };
    setMotions(p => [m, ...p]);
    withCF(() => CF.submitMotion(workerUrl, id, m.author, m.text, time));
  };

  const secondMotion = (id: string) => {
    if (!canControl) return;
    setMotions(p => p.map(m => m.id === id ? { ...m, seconded: true } : m));
    withCF(() => CF.secondMotion(workerUrl, id));
  };

  // ── Floor votes ────────────────────────────────────────────────────────

  const createFloorVote = (question: string) => {
    if (!canControl) return;
    if (!question.trim()) return;
    const id = Date.now().toString();
    const createdAt = ts();
    const fv: FloorVote = { id, question: question.trim(), yay: 0, nay: 0, closed: false, createdAt };
    setFloorVotes(p => [fv, ...p]);
    setFloorVoteSelections((prev) => ({ ...prev, [id]: {} }));
    withCF(() => CF.createFloorVote(workerUrl, id, fv.question, createdAt));
  };

  const castFloorVote = (id: string, opt: VoteChoice) => {
    if (!canControl) return;
    const voterLabel = (memberName.trim() || derivedDefaultName || voterId).slice(0, 120);
    setFloorVoteSelections((prev) => {
      const bucket = { ...(prev[id] || {}) };
      bucket[voterId] = {
        option: opt,
        voterId,
        voterLabel,
        updatedAt: new Date().toISOString(),
      };
      const totals = tallySelections(bucket);
      setFloorVotes((current) => current.map((v) => (v.id === id ? { ...v, ...totals } : v)));
      return { ...prev, [id]: bucket };
    });
    setMyFloorVotes((prev) => ({ ...prev, [id]: opt }));
    withCF(() => CF.castFloorVote(workerUrl, id, opt, voterId, voterLabel));
  };

  const closeFloorVote = (id: string) => {
    if (!canControl) return;
    setFloorVotes(p => p.map(v => v.id === id ? { ...v, closed: true } : v));
    withCF(() => CF.closeFloorVote(workerUrl, id));
  };

  // ── Reset all ──────────────────────────────────────────────────────────

  const resetMeeting = () => {
    if (!canControl) return;
    setVotes({});
    setVoteSelections({});
    setMyVotes({});
    setHands([]);
    setMyHandId(null);
    setMotions([]);
    setFloorVotes([]);
    setFloorVoteSelections({});
    setMyFloorVotes({});
    withCF(() => CF.resetAll(workerUrl));
  };

  return (
    <MeetingContext.Provider value={{
      canControl,
      voterId,
      memberName, setMemberName,
      workerUrl, setWorkerUrl, disconnectWorker, connected, syncing, syncError, lastSynced,
      votes, voteSelections, myVotes, castVote, resetVote,
      hands, myHandId, raiseHand, lowerMyHand, lowerAllHands,
      motions, submitMotion, secondMotion,
      floorVotes, floorVoteSelections, myFloorVotes, createFloorVote, castFloorVote, closeFloorVote,
      resetMeeting,
    }}>
      {children}
    </MeetingContext.Provider>
  );
}
