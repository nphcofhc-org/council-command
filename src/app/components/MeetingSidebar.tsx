import { useState, useEffect } from 'react';
import {
  Hand, MessageSquare, Gavel, Check, X, Plus, RotateCcw,
  Wifi, WifiOff, Settings, Copy, ChevronDown, ChevronUp,
  RefreshCw, Trash2, AlertCircle, CheckCircle2, Download, FileDown, Sparkles
} from 'lucide-react';
import { useMeeting, SLIDE_VOTES, VOTE_LABELS } from './MeetingContext';
import { WORKER_SOURCE } from '../services/CloudflareSync';
import { requestMeetingAssist } from '../data/meeting-assistant-api';

function csvCell(value: unknown): string {
  const raw = String(value ?? '');
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

function rowsToCsv(rows: Array<Array<unknown>>): string {
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

function safeFilePart(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'meeting';
}

function downloadText(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

// ─── Mini vote card ───────────────────────────────────────────────────────────

function SideVoteCard({ label, yay, nay, onYay, onNay, myVote, onReset, onClose }: {
  label: string; yay: number; nay: number;
  onYay: () => void; onNay: () => void;
  myVote?: 'yay' | 'nay' | null;
  onReset?: () => void; onClose?: () => void;
}) {
  const total  = yay + nay;
  const yayPct = total > 0 ? Math.round((yay / total) * 100) : 0;
  const status = total === 0 ? null : yay > nay ? 'pass' : nay > yay ? 'fail' : 'tie';
  return (
    <div style={{ background: '#131313', border: '1px solid #222', borderRadius: 9, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 6 }}>
        <span style={{ color: '#D0D0D0', fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3, flex: 1 }}>{label}</span>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {onReset && <button onClick={onReset} title="Reset" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#363636', padding: 2 }}><RotateCcw size={11} /></button>}
          {onClose && <button onClick={onClose} title="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#363636', padding: 2 }}><X size={11} /></button>}
        </div>
      </div>
      {myVote ? (
        <div style={{ color: '#8A8A8A', fontSize: '0.62rem', fontWeight: 600, marginBottom: 8 }}>
          Your vote: <span style={{ color: '#C8C8C8' }}>{myVote.toUpperCase()}</span>
        </div>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: total > 0 ? 8 : 0 }}>
        <button onClick={onYay} style={{ padding: '10px 6px', background: myVote === 'yay' ? '#E5F0FF' : '#fff', border: myVote === 'yay' ? '1px solid #93C5FD' : 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit' }}>
          <Check size={12} color="#0A0A0A" strokeWidth={3} />
          <span style={{ color: '#0A0A0A', fontWeight: 800, fontSize: '0.78rem' }}>YAY</span>
          <span style={{ color: '#505050', fontWeight: 700, fontSize: '0.85rem' }}>{yay}</span>
        </button>
        <button onClick={onNay} style={{ padding: '10px 6px', background: myVote === 'nay' ? 'rgba(239,68,68,0.08)' : 'transparent', border: myVote === 'nay' ? '1px solid #7F1D1D' : '1px solid #303030', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit' }}>
          <X size={12} color="#808080" strokeWidth={3} />
          <span style={{ color: '#B0B0B0', fontWeight: 800, fontSize: '0.78rem' }}>NAY</span>
          <span style={{ color: '#606060', fontWeight: 700, fontSize: '0.85rem' }}>{nay}</span>
        </button>
      </div>
      {total > 0 && (
        <div>
          <div style={{ height: 5, borderRadius: 99, background: '#1E1E1E', overflow: 'hidden', display: 'flex', marginBottom: 5 }}>
            <div style={{ width: `${yayPct}%`, background: 'linear-gradient(90deg,#C8C8C8,#FFFFFF)', transition: 'width 0.45s ease', borderRadius: '99px 0 0 99px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#707070', fontSize: '0.64rem' }}>{total} vote{total !== 1 ? 's' : ''}</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.08em', textTransform: 'uppercase', background: status === 'pass' ? 'rgba(255,255,255,0.08)' : status === 'fail' ? 'rgba(60,60,60,0.4)' : 'rgba(80,80,80,0.2)', color: status === 'pass' ? '#D8D8D8' : status === 'fail' ? '#686868' : '#909090' }}>
              {status === 'pass' ? '✓ Passing' : status === 'fail' ? '✗ Failing' : 'Tied'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cloudflare setup panel ───────────────────────────────────────────────────

function CloudflarePanel({ onClose }: { onClose: () => void }) {
  const { workerUrl, setWorkerUrl, disconnectWorker, connected, syncError } = useMeeting();
  const [input, setInput]         = useState(workerUrl);
  const [copied, setCopied]       = useState(false);
  const [showCode, setShowCode]   = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(WORKER_SOURCE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#0A0A0A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Settings size={14} color="#808080" />
          <span style={{ color: '#D0D0D0', fontSize: '0.78rem', fontWeight: 700 }}>Cloudflare Setup</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#505050', padding: 2 }}><X size={14} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

        {/* Step 1 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#808080', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ background: '#202020', color: '#A0A0A0', border: '1px solid #303030', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, flexShrink: 0 }}>1</span>
            Deploy the Worker
          </div>
          <p style={{ color: '#505050', fontSize: '0.72rem', lineHeight: 1.6, margin: '0 0 9px' }}>
            Copy the script below, create a new <strong style={{ color: '#808080' }}>Worker</strong> in your Cloudflare dashboard, then add a <strong style={{ color: '#808080' }}>KV Namespace</strong> bound as <code style={{ background: '#181818', padding: '2px 6px', borderRadius: 3, color: '#A0A0A0' }}>MEETING_KV</code>.
          </p>
          <button
            onClick={() => setShowCode(c => !c)}
            style={{ width: '100%', padding: '8px 12px', background: '#141414', border: '1px solid #262626', borderRadius: 7, cursor: 'pointer', color: '#909090', fontSize: '0.72rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 600 }}>worker.js — Click to {showCode ? 'hide' : 'view'}</span>
            {showCode ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showCode && (
            <div style={{ position: 'relative', marginTop: 0 }}>
              <pre style={{ background: '#0D0D0D', border: '1px solid #202020', borderTop: 'none', borderRadius: '0 0 7px 7px', padding: '11px 13px', fontSize: '0.62rem', color: '#686868', overflowX: 'auto', margin: 0, lineHeight: 1.6, maxHeight: 180, overflowY: 'auto', fontFamily: 'monospace' }}>
                {WORKER_SOURCE}
              </pre>
              <button
                onClick={copyCode}
                style={{ position: 'absolute', top: 7, right: 7, background: copied ? '#fff' : '#1C1C1C', border: `1px solid ${copied ? '#fff' : '#303030'}`, borderRadius: 5, padding: '5px 10px', cursor: 'pointer', color: copied ? '#0A0A0A' : '#707070', fontSize: '0.64rem', fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}
              >
                <Copy size={10} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#808080', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ background: '#202020', color: '#A0A0A0', border: '1px solid #303030', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, flexShrink: 0 }}>2</span>
            Enter your Worker URL
          </div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="https://your-worker.your-subdomain.workers.dev"
            style={{ width: '100%', background: '#141414', border: `1px solid ${syncError ? '#5A2020' : '#2A2A2A'}`, borderRadius: 7, padding: '9px 12px', color: '#E0E0E0', fontSize: '0.76rem', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box', transition: 'border-color 0.15s', marginBottom: 7 }}
          />
          {syncError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#c06060', fontSize: '0.68rem', marginBottom: 7 }}>
              <AlertCircle size={11} /> {syncError}
            </div>
          )}
          {connected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#70A070', fontSize: '0.68rem', marginBottom: 7 }}>
              <CheckCircle2 size={11} /> Connected & syncing
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => { if (input.trim()) { setWorkerUrl(input.trim()); onClose(); } }}
              disabled={!input.trim()}
              style={{ flex: 1, padding: '9px', background: input.trim() ? '#fff' : '#181818', border: `1px solid ${input.trim() ? '#fff' : '#282828'}`, borderRadius: 7, cursor: input.trim() ? 'pointer' : 'not-allowed', color: input.trim() ? '#0A0A0A' : '#333', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.78rem', transition: 'all 0.15s' }}
            >
              Connect
            </button>
            {workerUrl && (
              <button
                onClick={() => { disconnectWorker(); onClose(); }}
                style={{ padding: '9px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 7, cursor: 'pointer', color: '#555', fontFamily: 'inherit', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <WifiOff size={12} /> Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ background: '#0E0E0E', border: '1px solid #1C1C1C', borderRadius: 7, padding: '12px 14px' }}>
          <div style={{ color: '#484848', fontSize: '0.68rem', lineHeight: 1.65 }}>
            Once connected, votes, motions, and hand raises sync every <strong style={{ color: '#606060' }}>3 seconds</strong> across all devices — no page refresh needed. Votes are recorded per user identity (one active vote per person per item).
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

type Section = 'hand' | 'motion' | 'vote';

export function MeetingSidebar({ currentSlide, externalTab }: { currentSlide: number; externalTab?: 'hand' | 'motion' | 'vote' }) {
  const {
    memberName, setMemberName,
    workerUrl, connected, syncing, lastSynced, resetMeeting,
    votes, voteSelections, myVotes, myFloorVotes, castVote, resetVote,
    hands, myHandId, raiseHand, lowerMyHand, lowerAllHands,
    motions, submitMotion, secondMotion,
    floorVotes, floorVoteSelections, createFloorVote, castFloorVote, closeFloorVote,
  } = useMeeting();

  const [tab,              setTab]              = useState<Section>(externalTab ?? 'hand');
  const [motionText,       setMotionText]        = useState('');
  const [floorQ,           setFloorQ]            = useState('');
  const [showNewFloorVote, setShowNewFloorVote]  = useState(false);
  const [showCFPanel,      setShowCFPanel]       = useState(false);
  const [showResetConfirm, setShowResetConfirm]  = useState(false);
  const [aiMode,           setAiMode]            = useState<'facilitator' | 'summary' | 'minutes'>('facilitator');
  const [aiBusy,           setAiBusy]            = useState(false);
  const [aiError,          setAiError]           = useState('');
  const [aiOutput,         setAiOutput]          = useState('');

  const slideVoteKeys = SLIDE_VOTES[currentSlide] ?? [];
  const activeFloor   = floorVotes.filter(v => !v.closed);
  const handCount     = hands.length;
  const motionCount   = motions.length;
  const voteCount     = slideVoteKeys.length + activeFloor.length;

  const badge = (n: number, active: boolean) => n > 0 ? (
    <span style={{ background: active ? '#fff' : '#282828', color: active ? '#0A0A0A' : '#606060', fontSize: '0.54rem', fontWeight: 800, padding: '0 6px', borderRadius: 99, lineHeight: '16px', display: 'inline-block', minWidth: 16, textAlign: 'center' }}>
      {n}
    </span>
  ) : null;

  useEffect(() => { if (externalTab) setTab(externalTab); }, [externalTab]);

  const buildSnapshot = () => {
    const now = new Date();
    const meetingKey = safeFilePart(now.toISOString().slice(0, 16));
    const voteDetails = Object.entries(voteSelections).map(([key, bucket]) => {
      const label = VOTE_LABELS[key]?.label || key;
      const tally = votes[key] || { yay: 0, nay: 0 };
      const selections = Object.values(bucket || {});
      return {
        key,
        label,
        yay: tally.yay,
        nay: tally.nay,
        total: tally.yay + tally.nay,
        selections,
      };
    });

    const floorVoteDetails = floorVotes.map((vote) => ({
      ...vote,
      total: vote.yay + vote.nay,
      selections: Object.values(floorVoteSelections[vote.id] || {}),
    }));

    return {
      exportedAt: now.toISOString(),
      meetingKey,
      currentSlide: currentSlide + 1,
      memberName: memberName || 'Anonymous',
      connected,
      votes: voteDetails,
      motions,
      hands,
      floorVotes: floorVoteDetails,
    };
  };

  const exportMeetingJson = () => {
    const snapshot = buildSnapshot();
    downloadText(
      `nphc-meeting-record-${snapshot.meetingKey}.json`,
      JSON.stringify(snapshot, null, 2),
      'application/json;charset=utf-8',
    );
  };

  const exportMeetingCsv = () => {
    const snapshot = buildSnapshot();
    const base = `nphc-meeting-${snapshot.meetingKey}`;

    const voteRows: Array<Array<unknown>> = [
      ['vote_key', 'vote_label', 'yay', 'nay', 'total', 'voter_id', 'voter_label', 'selection', 'updated_at'],
    ];
    for (const vote of snapshot.votes) {
      if (vote.selections.length === 0) {
        voteRows.push([vote.key, vote.label, vote.yay, vote.nay, vote.total, '', '', '', '']);
      } else {
        for (const selection of vote.selections) {
          voteRows.push([
            vote.key,
            vote.label,
            vote.yay,
            vote.nay,
            vote.total,
            selection.voterId || '',
            selection.voterLabel || '',
            selection.option || '',
            selection.updatedAt || '',
          ]);
        }
      }
    }

    const motionRows: Array<Array<unknown>> = [
      ['order', 'author', 'motion_text', 'seconded', 'time'],
      ...motions.map((motion, idx) => [motions.length - idx, motion.author, motion.text, motion.seconded ? 'Yes' : 'No', motion.time]),
    ];

    const handRows: Array<Array<unknown>> = [
      ['position', 'name', 'time', 'is_self'],
      ...hands.map((hand, idx) => [idx + 1, hand.name, hand.time, hand.id === myHandId ? 'Yes' : 'No']),
    ];

    const floorRows: Array<Array<unknown>> = [
      ['floor_vote_id', 'question', 'closed', 'yay', 'nay', 'total', 'voter_id', 'voter_label', 'selection', 'updated_at'],
    ];
    for (const vote of snapshot.floorVotes) {
      if (vote.selections.length === 0) {
        floorRows.push([vote.id, vote.question, vote.closed ? 'Yes' : 'No', vote.yay, vote.nay, vote.total, '', '', '', '']);
      } else {
        for (const selection of vote.selections) {
          floorRows.push([
            vote.id,
            vote.question,
            vote.closed ? 'Yes' : 'No',
            vote.yay,
            vote.nay,
            vote.total,
            selection.voterId || '',
            selection.voterLabel || '',
            selection.option || '',
            selection.updatedAt || '',
          ]);
        }
      }
    }

    downloadText(`${base}-votes.csv`, rowsToCsv(voteRows), 'text/csv;charset=utf-8');
    downloadText(`${base}-motions.csv`, rowsToCsv(motionRows), 'text/csv;charset=utf-8');
    downloadText(`${base}-hands.csv`, rowsToCsv(handRows), 'text/csv;charset=utf-8');
    downloadText(`${base}-floor-votes.csv`, rowsToCsv(floorRows), 'text/csv;charset=utf-8');
  };

  const buildAiContext = () => {
    const snapshot = buildSnapshot();
    const lines: string[] = [];
    lines.push(`Current slide: ${snapshot.currentSlide}`);
    lines.push(`Chair/member label: ${snapshot.memberName}`);
    lines.push(`Connected to sync: ${snapshot.connected ? 'yes' : 'no'}`);
    lines.push('');
    lines.push('Structured Votes:');
    for (const vote of snapshot.votes) {
      lines.push(`- ${vote.label}: YAY ${vote.yay}, NAY ${vote.nay}, TOTAL ${vote.total}`);
    }
    if (snapshot.votes.length === 0) lines.push('- None yet');
    lines.push('');
    lines.push('Motions:');
    for (const motion of snapshot.motions) {
      lines.push(`- ${motion.author} (${motion.time})${motion.seconded ? ' [Seconded]' : ''}: ${motion.text}`);
    }
    if (snapshot.motions.length === 0) lines.push('- None yet');
    lines.push('');
    lines.push('Raised Hands:');
    for (const hand of snapshot.hands) {
      lines.push(`- ${hand.name} (${hand.time})`);
    }
    if (snapshot.hands.length === 0) lines.push('- None right now');
    lines.push('');
    lines.push('Floor Votes:');
    for (const floor of snapshot.floorVotes) {
      lines.push(`- ${floor.question} [${floor.closed ? 'Closed' : 'Open'}]: YAY ${floor.yay}, NAY ${floor.nay}, TOTAL ${floor.total}`);
    }
    if (snapshot.floorVotes.length === 0) lines.push('- None yet');

    return lines.join('\n');
  };

  const runAiAssist = async () => {
    setAiBusy(true);
    setAiError('');
    try {
      const text = await requestMeetingAssist(aiMode, buildAiContext());
      setAiOutput(text);
    } catch (e: any) {
      setAiError(e?.message || 'Failed to generate AI output.');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div style={{ height: '100%', background: '#0C0C0C', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {showCFPanel && <CloudflarePanel onClose={() => setShowCFPanel(false)} />}

      {/* ── Name input ── */}
      <div style={{ padding: '12px 14px 11px', borderBottom: '1px solid #1E1E1E', flexShrink: 0 }}>
        <div style={{ color: '#C8C8C8', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
          Meeting Room
        </div>
        <input
          value={memberName}
          onChange={e => setMemberName(e.target.value)}
          placeholder="Your name…"
          style={{ width: '100%', background: '#181818', border: '1px solid #2A2A2A', borderRadius: 7, padding: '8px 12px', color: '#E0E0E0', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          onFocus={e => (e.target.style.borderColor = '#505050')}
          onBlur={e => (e.target.style.borderColor = '#2A2A2A')}
        />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1E1E1E', flexShrink: 0 }}>
        {([
          { key: 'hand'   as Section, icon: Hand,          label: 'Hand',   count: handCount },
          { key: 'motion' as Section, icon: MessageSquare, label: 'Motion', count: motionCount },
          { key: 'vote'   as Section, icon: Gavel,         label: 'Vote',   count: voteCount },
        ]).map(({ key, icon: Icon, label, count }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px 4px 7px', border: 'none', cursor: 'pointer', background: active ? '#161616' : 'transparent', borderBottom: `2px solid ${active ? '#E0E0E0' : 'transparent'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.15s', marginBottom: -1 }}>
              <Icon size={14} color={active ? '#E8E8E8' : '#484848'} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: active ? '#E0E0E0' : '#484848', fontSize: '0.64rem', fontWeight: 600 }}>{label}</span>
                {badge(count, active)}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>

        {/* ══ RAISE HAND ══════════════════════════════════════ */}
        {tab === 'hand' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => myHandId ? lowerMyHand() : raiseHand(memberName || 'Anonymous')}
              style={{ width: '100%', padding: '16px 14px', background: myHandId ? '#fff' : 'linear-gradient(145deg,#181818,#131313)', border: `1px solid ${myHandId ? '#fff' : '#333'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: myHandId ? '#0A0A0A' : '#C8C8C8', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.04em', transition: 'all 0.2s', boxShadow: myHandId ? '0 4px 20px rgba(255,255,255,0.12)' : 'none' }}
            >
              <Hand size={18} />
              {myHandId ? '✓ Hand Raised' : 'Raise Hand'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: handCount > 0 ? '#E0E0E0' : '#303030', transition: 'background 0.3s' }} />
                <span style={{ color: handCount > 0 ? '#A0A0A0' : '#3A3A3A', fontSize: '0.72rem', fontWeight: 600 }}>
                  {handCount === 0 ? 'No hands raised' : `${handCount} hand${handCount !== 1 ? 's' : ''} raised`}
                </span>
              </div>
              {handCount > 0 && (
                <button onClick={lowerAllHands} style={{ background: 'none', border: '1px solid #282828', borderRadius: 5, padding: '3px 9px', cursor: 'pointer', color: '#404040', fontSize: '0.64rem', fontFamily: 'inherit', fontWeight: 600 }}>
                  Lower All
                </button>
              )}
            </div>

            {handCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '26px 0', color: '#272727', fontSize: '0.76rem', fontStyle: 'italic' }}>No hands raised</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {hands.map((h, i) => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#131313', border: `1px solid ${h.id === myHandId ? '#383838' : '#1E1E1E'}`, borderRadius: 8, padding: '9px 11px' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: h.id === myHandId ? '#fff' : '#1C1C1C', border: `1px solid ${h.id === myHandId ? '#fff' : '#2C2C2C'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Hand size={13} color={h.id === myHandId ? '#0A0A0A' : '#505050'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: h.id === myHandId ? '#F0F0F0' : '#C0C0C0', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{i + 1} {h.name}
                        {h.id === myHandId && <span style={{ color: '#484848', fontSize: '0.6rem', fontWeight: 700, border: '1px solid #323232', padding: '0 6px', borderRadius: 3 }}>You</span>}
                      </div>
                      <div style={{ color: '#363636', fontSize: '0.62rem', marginTop: 2 }}>{h.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ SUBMIT MOTION ═══════════════════════════════════ */}
        {tab === 'motion' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#121212', border: '1px solid #242424', borderRadius: 10, padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ color: '#606060', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>New Motion</div>
              <textarea
                value={motionText}
                onChange={e => setMotionText(e.target.value)}
                placeholder="I move that…"
                rows={3}
                style={{ width: '100%', background: '#0E0E0E', border: '1px solid #252525', borderRadius: 7, padding: '9px 12px', color: '#E0E0E0', fontSize: '0.78rem', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.55, boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#484848')}
                onBlur={e => (e.target.style.borderColor = '#252525')}
              />
              <button
                onClick={() => { if (!motionText.trim()) return; submitMotion(memberName || 'Anonymous', motionText); setMotionText(''); }}
                disabled={!motionText.trim()}
                style={{ width: '100%', padding: '10px', background: motionText.trim() ? '#fff' : '#181818', border: `1px solid ${motionText.trim() ? '#fff' : '#282828'}`, borderRadius: 7, cursor: motionText.trim() ? 'pointer' : 'not-allowed', color: motionText.trim() ? '#0A0A0A' : '#333', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.04em', transition: 'all 0.18s' }}
              >
                Submit Motion
              </button>
            </div>

            {motions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#272727', fontSize: '0.76rem', fontStyle: 'italic' }}>No motions submitted</div>
            ) : (
              <div>
                <div style={{ color: '#404040', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
                  Floor ({motions.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {motions.map((m, i) => (
                    <div key={m.id} style={{ background: '#121212', border: '1px solid #202020', borderRadius: 8, padding: '11px 13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: '#606060', fontSize: '0.68rem', fontWeight: 600 }}>#{motions.length - i} · {m.author}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ color: '#2C2C2C', fontSize: '0.6rem' }}>{m.time}</span>
                          {m.seconded ? (
                            <span style={{ background: '#1A1A1A', color: '#707070', border: '1px solid #2E2E2E', fontSize: '0.56rem', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>Seconded</span>
                          ) : (
                            <button onClick={() => secondMotion(m.id)} style={{ background: 'none', border: '1px solid #2A2A2A', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', color: '#565656', fontSize: '0.56rem', fontFamily: 'inherit', fontWeight: 700 }}>
                              Second it
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ color: '#C8C8C8', fontSize: '0.76rem', lineHeight: 1.5, margin: 0 }}>{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ VOTE ═════════════════════════════════════════════ */}
        {tab === 'vote' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {slideVoteKeys.length > 0 && (
              <div>
                <div style={{ color: '#404040', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E0E0E0' }} />
                  Active on This Slide
                </div>
                {slideVoteKeys.map(key => {
                  const v = votes[key] ?? { yay: 0, nay: 0 };
                  const info = VOTE_LABELS[key] ?? { label: key };
                  return <SideVoteCard key={key} label={info.label} yay={v.yay} nay={v.nay} myVote={myVotes[key]} onYay={() => castVote(key, 'yay')} onNay={() => castVote(key, 'nay')} onReset={() => resetVote(key)} />;
                })}
              </div>
            )}

            {slideVoteKeys.length === 0 && activeFloor.length === 0 && !showNewFloorVote && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#272727', fontSize: '0.76rem', fontStyle: 'italic' }}>No active votes on this slide</div>
            )}

            {activeFloor.length > 0 && (
              <div>
                <div style={{ color: '#404040', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#606060' }} />
                  Floor Votes
                </div>
                {activeFloor.map(fv => (
                  <SideVoteCard key={fv.id} label={fv.question} yay={fv.yay} nay={fv.nay} myVote={myFloorVotes[fv.id]} onYay={() => castFloorVote(fv.id, 'yay')} onNay={() => castFloorVote(fv.id, 'nay')} onClose={() => closeFloorVote(fv.id)} />
                ))}
              </div>
            )}

            {floorVotes.filter(v => v.closed).length > 0 && (
              <div style={{ color: '#2A2A2A', fontSize: '0.68rem', textAlign: 'center' }}>
                {floorVotes.filter(v => v.closed).length} closed floor vote{floorVotes.filter(v => v.closed).length !== 1 ? 's' : ''}
              </div>
            )}

            {showNewFloorVote ? (
              <div style={{ background: '#121212', border: '1px solid #242424', borderRadius: 10, padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ color: '#606060', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>New Floor Vote</div>
                <input
                  value={floorQ}
                  onChange={e => setFloorQ(e.target.value)}
                  placeholder="Vote question…"
                  autoFocus
                  style={{ width: '100%', background: '#0E0E0E', border: '1px solid #2A2A2A', borderRadius: 7, padding: '9px 12px', color: '#E0E0E0', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { if (!floorQ.trim()) return; createFloorVote(floorQ); setFloorQ(''); setShowNewFloorVote(false); }} disabled={!floorQ.trim()} style={{ flex: 1, padding: '9px', background: floorQ.trim() ? '#fff' : '#181818', border: `1px solid ${floorQ.trim() ? '#fff' : '#282828'}`, borderRadius: 7, cursor: floorQ.trim() ? 'pointer' : 'not-allowed', color: floorQ.trim() ? '#0A0A0A' : '#333', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.76rem', transition: 'all 0.15s' }}>
                    Open Vote
                  </button>
                  <button onClick={() => { setShowNewFloorVote(false); setFloorQ(''); }} style={{ padding: '9px 14px', background: 'transparent', border: '1px solid #282828', borderRadius: 7, cursor: 'pointer', color: '#505050', fontFamily: 'inherit', fontSize: '0.76rem' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewFloorVote(true)} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #282828', borderRadius: 8, cursor: 'pointer', color: '#424242', fontFamily: 'inherit', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
                <Plus size={12} /> New Floor Vote
              </button>
            )}

            <div style={{ background: '#111111', border: '1px solid #252525', borderRadius: 10, padding: '11px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} color="#8A8A8A" />
                  <span style={{ color: '#A0A0A0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    AI Facilitation
                  </span>
                </div>
                <select
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value as 'facilitator' | 'summary' | 'minutes')}
                  style={{ background: '#0C0C0C', border: '1px solid #2A2A2A', color: '#B0B0B0', borderRadius: 6, fontSize: '0.66rem', padding: '4px 8px', fontFamily: 'inherit' }}
                >
                  <option value="facilitator">Chair Script</option>
                  <option value="summary">Summary</option>
                  <option value="minutes">Minutes Draft</option>
                </select>
              </div>

              <button
                onClick={runAiAssist}
                disabled={aiBusy}
                style={{ width: '100%', padding: '8px 10px', background: aiBusy ? '#161616' : '#F0F0F0', border: `1px solid ${aiBusy ? '#2A2A2A' : '#FFFFFF'}`, borderRadius: 7, cursor: aiBusy ? 'wait' : 'pointer', color: aiBusy ? '#555' : '#0A0A0A', fontWeight: 800, fontSize: '0.72rem', fontFamily: 'inherit', letterSpacing: '0.04em', marginBottom: aiOutput ? 8 : 0 }}>
                {aiBusy ? 'Generating…' : 'Generate AI Assistance'}
              </button>

              {aiError ? (
                <div style={{ marginTop: 8, color: '#C07070', fontSize: '0.66rem', lineHeight: 1.5 }}>
                  {aiError}
                </div>
              ) : null}

              {aiOutput ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ maxHeight: 170, overflowY: 'auto', border: '1px solid #252525', borderRadius: 7, background: '#0C0C0C', padding: '8px 9px', whiteSpace: 'pre-wrap', color: '#B8B8B8', fontSize: '0.68rem', lineHeight: 1.55 }}>
                    {aiOutput}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiOutput)}
                      style={{ flex: 1, padding: '6px 8px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 7, cursor: 'pointer', color: '#808080', fontSize: '0.66rem', fontFamily: 'inherit' }}
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => downloadText(`nphc-ai-${aiMode}-${safeFilePart(new Date().toISOString())}.txt`, aiOutput)}
                      style={{ flex: 1, padding: '6px 8px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 7, cursor: 'pointer', color: '#808080', fontSize: '0.66rem', fontFamily: 'inherit' }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: sync status + settings ── */}
      <div style={{ padding: '9px 14px', borderTop: '1px solid #1A1A1A', flexShrink: 0, background: '#0A0A0A' }}>
        {/* Sync status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
          {connected ? (
            <>
              <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#4A8A4A' }} />
                <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '1px solid #4A8A4A', opacity: 0.5 }} />
              </div>
              <span style={{ color: '#4A7A4A', fontSize: '0.64rem', fontWeight: 600, flex: 1 }}>
                Live · Cloudflare Workers
              </span>
              {syncing && <RefreshCw size={10} color="#3A6A3A" style={{ animation: 'spin 1s linear infinite' }} />}
              {lastSynced && <span style={{ color: '#2A4A2A', fontSize: '0.56rem' }}>{lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
            </>
          ) : workerUrl ? (
            <>
              <AlertCircle size={10} color="#7A4A4A" />
              <span style={{ color: '#7A4A4A', fontSize: '0.64rem', fontWeight: 600, flex: 1 }}>Connecting…</span>
            </>
          ) : (
            <>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#282828', flexShrink: 0 }} />
              <span style={{ color: '#383838', fontSize: '0.64rem', fontWeight: 600, flex: 1 }}>Local only</span>
            </>
          )}
          <button onClick={() => setShowCFPanel(true)} title="Cloudflare Setup" style={{ background: 'none', border: 'none', cursor: 'pointer', color: connected ? '#3A6A3A' : '#363636', padding: 2, display: 'flex', alignItems: 'center' }}>
            <Settings size={12} />
          </button>
        </div>

        {/* Reset + stats row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#282828', fontSize: '0.6rem' }}>
            {handCount}H · {motionCount}M · {Object.values(votes).filter(v => v.yay + v.nay > 0).length + activeFloor.length}V
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={exportMeetingJson}
              title="Download full meeting record (JSON)"
              style={{ background: 'none', border: '1px solid #252525', borderRadius: 5, cursor: 'pointer', color: '#5A5A5A', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.6rem', fontFamily: 'inherit' }}
            >
              <Download size={10} />
              JSON
            </button>
            <button
              onClick={exportMeetingCsv}
              title="Download votes, motions, hands, and floor votes as CSV files"
              style={{ background: 'none', border: '1px solid #252525', borderRadius: 5, cursor: 'pointer', color: '#5A5A5A', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.6rem', fontFamily: 'inherit' }}
            >
              <FileDown size={10} />
              CSV
            </button>
          </div>
          {showResetConfirm ? (
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ color: '#505050', fontSize: '0.62rem' }}>Reset all?</span>
              <button onClick={() => { resetMeeting(); setShowResetConfirm(false); }} style={{ background: 'none', border: '1px solid #4A2020', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', color: '#7A3A3A', fontSize: '0.62rem', fontFamily: 'inherit', fontWeight: 700 }}>Yes</button>
              <button onClick={() => setShowResetConfirm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#404040', padding: '2px 5px', fontFamily: 'inherit', fontSize: '0.62rem' }}>No</button>
            </div>
          ) : (
            <button onClick={() => setShowResetConfirm(true)} title="Reset all meeting data" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2C2C2C', padding: 2, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', fontFamily: 'inherit' }}>
              <Trash2 size={11} /> Reset
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
