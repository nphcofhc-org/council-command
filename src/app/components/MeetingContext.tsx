import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CF, loadWorkerUrl, saveWorkerUrl, clearWorkerUrl } from '../services/CloudflareSync';
import type { CFState } from '../services/CloudflareSync';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VoteData   { yay: number; nay: number; }
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
  castVote:    (key: string, opt: 'yay' | 'nay') => void;
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
  createFloorVote: (question: string) => void;
  castFloorVote:   (id: string, opt: 'yay' | 'nay') => void;
  closeFloorVote:  (id: string) => void;
  // Reset all
  resetMeeting: () => void;
}

const MeetingContext = createContext<Ctx>({
  memberName: '', setMemberName: () => {},
  workerUrl: '', setWorkerUrl: () => {}, disconnectWorker: () => {},
  connected: false, syncing: false, syncError: '', lastSynced: null,
  votes: {}, castVote: () => {}, resetVote: () => {},
  hands: [], myHandId: null, raiseHand: () => {}, lowerMyHand: () => {}, lowerAllHands: () => {},
  motions: [], submitMotion: () => {}, secondMotion: () => {},
  floorVotes: [], createFloorVote: () => {}, castFloorVote: () => {}, closeFloorVote: () => {},
  resetMeeting: () => {},
});

export function useMeeting() { return useContext(MeetingContext); }

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [memberName,  setMemberName]  = useState('');
  const [workerUrl,   setWorkerUrlState] = useState(loadWorkerUrl);
  const [connected,   setConnected]   = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [syncError,   setSyncError]   = useState('');
  const [lastSynced,  setLastSynced]  = useState<Date | null>(null);

  const [votes,      setVotes]      = useState<Record<string, VoteData>>({});
  const [hands,      setHands]      = useState<HandRaise[]>([]);
  const [myHandId,   setMyHandId]   = useState<string | null>(null);
  const [motions,    setMotions]    = useState<Motion[]>([]);
  const [floorVotes, setFloorVotes] = useState<FloorVote[]>([]);

  const myHandIdRef = useRef(myHandId);
  myHandIdRef.current = myHandId;

  const ts = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── Cloudflare helpers ──────────────────────────────────────────────────

  const applyState = useCallback((s: CFState) => {
    setVotes(s.votes ?? {});
    setHands(s.hands ?? []);
    setMotions(s.motions ?? []);
    setFloorVotes(s.floorVotes ?? []);
    // Reconcile myHandId — keep it only if it's still in the hands list
    setMyHandId(prev => (s.hands ?? []).some(h => h.id === prev) ? prev : null);
  }, []);

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

  const castVote = (key: string, opt: 'yay' | 'nay') => {
    setVotes(p => ({ ...p, [key]: { yay: (p[key]?.yay ?? 0) + (opt === 'yay' ? 1 : 0), nay: (p[key]?.nay ?? 0) + (opt === 'nay' ? 1 : 0) } }));
    withCF(() => CF.castVote(workerUrl, key, opt));
  };

  const resetVote = (key: string) => {
    setVotes(p => ({ ...p, [key]: { yay: 0, nay: 0 } }));
    withCF(() => CF.resetVote(workerUrl, key));
  };

  // ── Hands ──────────────────────────────────────────────────────────────

  const raiseHand = (name: string) => {
    if (myHandIdRef.current) return;
    const id = Date.now().toString();
    const time = ts();
    setHands(p => [...p, { id, name: name.trim() || 'Anonymous', time }]);
    setMyHandId(id);
    withCF(() => CF.raiseHand(workerUrl, id, name.trim() || 'Anonymous', time));
  };

  const lowerMyHand = () => {
    const id = myHandIdRef.current;
    if (!id) return;
    setHands(p => p.filter(h => h.id !== id));
    setMyHandId(null);
    withCF(() => CF.lowerHand(workerUrl, id));
  };

  const lowerAllHands = () => {
    setHands([]);
    setMyHandId(null);
    withCF(() => CF.lowerAllHands(workerUrl));
  };

  // ── Motions ────────────────────────────────────────────────────────────

  const submitMotion = (author: string, text: string) => {
    if (!text.trim()) return;
    const id = Date.now().toString();
    const time = ts();
    const m: Motion = { id, author: author.trim() || 'Anonymous', text: text.trim(), time, seconded: false };
    setMotions(p => [m, ...p]);
    withCF(() => CF.submitMotion(workerUrl, id, m.author, m.text, time));
  };

  const secondMotion = (id: string) => {
    setMotions(p => p.map(m => m.id === id ? { ...m, seconded: true } : m));
    withCF(() => CF.secondMotion(workerUrl, id));
  };

  // ── Floor votes ────────────────────────────────────────────────────────

  const createFloorVote = (question: string) => {
    if (!question.trim()) return;
    const id = Date.now().toString();
    const createdAt = ts();
    const fv: FloorVote = { id, question: question.trim(), yay: 0, nay: 0, closed: false, createdAt };
    setFloorVotes(p => [fv, ...p]);
    withCF(() => CF.createFloorVote(workerUrl, id, fv.question, createdAt));
  };

  const castFloorVote = (id: string, opt: 'yay' | 'nay') => {
    setFloorVotes(p => p.map(v => v.id === id ? { ...v, yay: v.yay + (opt === 'yay' ? 1 : 0), nay: v.nay + (opt === 'nay' ? 1 : 0) } : v));
    withCF(() => CF.castFloorVote(workerUrl, id, opt));
  };

  const closeFloorVote = (id: string) => {
    setFloorVotes(p => p.map(v => v.id === id ? { ...v, closed: true } : v));
    withCF(() => CF.closeFloorVote(workerUrl, id));
  };

  // ── Reset all ──────────────────────────────────────────────────────────

  const resetMeeting = () => {
    setVotes({}); setHands([]); setMyHandId(null); setMotions([]); setFloorVotes([]);
    withCF(() => CF.resetAll(workerUrl));
  };

  return (
    <MeetingContext.Provider value={{
      memberName, setMemberName,
      workerUrl, setWorkerUrl, disconnectWorker, connected, syncing, syncError, lastSynced,
      votes, castVote, resetVote,
      hands, myHandId, raiseHand, lowerMyHand, lowerAllHands,
      motions, submitMotion, secondMotion,
      floorVotes, createFloorVote, castFloorVote, closeFloorVote,
      resetMeeting,
    }}>
      {children}
    </MeetingContext.Provider>
  );
}
