import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, RotateCcw, Vote, ChevronDown } from 'lucide-react';
import { useMeeting } from './MeetingContext';

// ─── VoteWidget (floating dropdown via portal) ────────────────────────────────

export function VoteWidget({
  voteKey, label, description, compact = false, dropUp = false,
}: {
  voteKey: string; label: string; description?: string; compact?: boolean; dropUp?: boolean;
}) {
  const { votes, castVote, resetVote } = useMeeting();
  const v        = votes[voteKey] ?? { yay: 0, nay: 0 };
  const total    = v.yay + v.nay;
  const yayPct   = total > 0 ? Math.round((v.yay / total) * 100) : 0;
  const nayPct   = total > 0 ? Math.round((v.nay / total) * 100) : 0;
  const hasVotes = total > 0;
  const status   = !hasVotes ? null : v.yay > v.nay ? 'pass' : v.nay > v.yay ? 'fail' : 'tie';

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // Calculate position relative to viewport
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.top, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // ── Trigger button ──────────────────────────────────────────────────────

  const trigger = compact ? (
    <button
      ref={triggerRef}
      onClick={() => setOpen(o => !o)}
      style={{
        width: '100%', background: open ? '#1A1A1A' : '#E0E0E0', border: `1px solid ${open ? '#333' : '#C5C5C5'}`,
        borderRadius: 8, padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: 'inherit', transition: 'all 0.2s',
      }}
    >
      <Vote size={12} color={open ? '#999' : '#888'} style={{ flexShrink: 0 }} />
      <span style={{ color: open ? '#E0E0E0' : '#555', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1, textAlign: 'left' }}>
        {label}
      </span>
      {hasVotes && (
        <span style={{ color: open ? '#808080' : '#888', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
          {v.yay}Y / {v.nay}N
        </span>
      )}
      {hasVotes && status && (
        <span style={{
          fontSize: '0.54rem', fontWeight: 800, padding: '2px 7px', borderRadius: 99,
          letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
          background: open
            ? (status === 'pass' ? 'rgba(255,255,255,0.08)' : status === 'fail' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)')
            : (status === 'pass' ? 'rgba(0,0,0,0.08)' : status === 'fail' ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.05)'),
          color: open
            ? (status === 'pass' ? '#C0C0C0' : status === 'fail' ? '#666' : '#888')
            : (status === 'pass' ? '#222' : status === 'fail' ? '#888' : '#666'),
        }}>
          {status === 'pass' ? '✓' : status === 'fail' ? '✗' : '~'}
        </span>
      )}
      <ChevronDown size={12} color={open ? '#666' : '#AAA'} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
    </button>
  ) : (
    <button
      ref={triggerRef}
      onClick={() => setOpen(o => !o)}
      style={{
        width: '100%', background: open ? '#111' : 'linear-gradient(145deg,#E6E6E6,#DCDCDC)',
        border: `1px solid ${open ? '#333' : '#C2C2C2'}`, borderRadius: 10, padding: '12px 16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: open ? '#222' : '#D0D0D0', border: `1px solid ${open ? '#383838' : '#B8B8B8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Vote size={15} color={open ? '#999' : '#666'} />
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ color: open ? '#E0E0E0' : '#222', fontSize: 'clamp(0.82rem,1.4vw,1rem)', fontWeight: 700, lineHeight: 1.3 }}>{label}</div>
        {description && <div style={{ color: open ? '#555' : '#999', fontSize: 'clamp(0.64rem,1.1vw,0.78rem)', marginTop: 2, lineHeight: 1.3 }}>{description}</div>}
      </div>
      {hasVotes && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ color: open ? '#C0C0C0' : '#333', fontSize: '0.82rem', fontWeight: 700 }}>{v.yay}Y</span>
          <span style={{ color: open ? '#444' : '#CCC' }}>/</span>
          <span style={{ color: open ? '#707070' : '#777', fontSize: '0.82rem', fontWeight: 700 }}>{v.nay}N</span>
        </div>
      )}
      {hasVotes && status && (
        <span style={{
          fontSize: '0.58rem', fontWeight: 800, padding: '3px 9px', borderRadius: 99,
          letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
          background: open
            ? (status === 'pass' ? 'rgba(255,255,255,0.08)' : status === 'fail' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)')
            : (status === 'pass' ? 'rgba(0,0,0,0.08)' : status === 'fail' ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.05)'),
          color: open
            ? (status === 'pass' ? '#C0C0C0' : status === 'fail' ? '#666' : '#888')
            : (status === 'pass' ? '#222' : status === 'fail' ? '#888' : '#666'),
        }}>
          {status === 'pass' ? '✓ Passing' : status === 'fail' ? '✗ Failing' : 'Tied'}
        </span>
      )}
      <ChevronDown size={14} color={open ? '#666' : '#AAA'} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
    </button>
  );

  // ── Dropdown panel (rendered via portal at document.body) ────────────────

  const dropdown = (open && pos) ? createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed', left: pos.left, width: pos.width, zIndex: 9999,
        ...(dropUp
          ? { bottom: window.innerHeight - pos.top + 6 }
          : { top: pos.top + (triggerRef.current?.offsetHeight ?? 40) + 6 }),
        background: '#111', border: '1px solid #2A2A2A', borderRadius: 12,
        padding: 'clamp(14px,2.4%,20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column', gap: 12,
        animation: 'voteDropIn 0.18s ease-out',
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Vote size={12} color="#606060" />
          <span style={{ color: '#606060', fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Live Vote</span>
        </div>
        {hasVotes && (
          <button onClick={() => resetVote(voteKey)} title="Reset votes" style={{ background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', color: '#444', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.58rem', fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#444'; }}
          >
            <RotateCcw size={10} /> Reset
          </button>
        )}
      </div>

      {/* Label */}
      <div style={{ color: '#D0D0D0', fontSize: 'clamp(0.82rem,1.4vw,1rem)', fontWeight: 700, lineHeight: 1.3 }}>{label}</div>

      {/* YAY / NAY buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          onClick={() => castVote(voteKey, 'yay')}
          style={{ background: '#fff', color: '#0A0A0A', border: 'none', borderRadius: 9, padding: 'clamp(12px,2%,18px)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F0F0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} strokeWidth={3} />
            <span style={{ fontWeight: 800, fontSize: 'clamp(0.82rem,1.4vw,1rem)', letterSpacing: '0.05em' }}>YAY</span>
          </div>
          <span style={{ fontSize: 'clamp(1.2rem,2.2vw,1.6rem)', fontWeight: 800, lineHeight: 1 }}>{v.yay}</span>
          {hasVotes && <span style={{ fontSize: '0.68rem', color: '#888', fontWeight: 600 }}>{yayPct}%</span>}
        </button>
        <button
          onClick={() => castVote(voteKey, 'nay')}
          style={{ background: 'transparent', color: '#B0B0B0', border: '1px solid #333', borderRadius: 9, padding: 'clamp(12px,2%,18px)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#505050'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={14} strokeWidth={3} />
            <span style={{ fontWeight: 800, fontSize: 'clamp(0.82rem,1.4vw,1rem)', letterSpacing: '0.05em' }}>NAY</span>
          </div>
          <span style={{ fontSize: 'clamp(1.2rem,2.2vw,1.6rem)', fontWeight: 800, lineHeight: 1 }}>{v.nay}</span>
          {hasVotes && <span style={{ fontSize: '0.68rem', color: '#555', fontWeight: 600 }}>{nayPct}%</span>}
        </button>
      </div>

      {/* Progress / status */}
      {hasVotes ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: '#555', fontSize: '0.66rem', fontWeight: 600 }}>{total} vote{total !== 1 ? 's' : ''} cast</span>
            <span style={{ color: status === 'pass' ? '#D0D0D0' : status === 'fail' ? '#666' : '#888', fontSize: '0.66rem', fontWeight: 700 }}>
              {status === 'pass' ? '✓ Passing' : status === 'fail' ? '✗ Failing' : 'Tied'}
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: '#222', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${yayPct}%`, background: 'linear-gradient(90deg,#C8C8C8,#FFFFFF)', transition: 'width 0.5s ease', borderRadius: '99px 0 0 99px' }} />
            <div style={{ width: `${nayPct}%`, background: '#444', transition: 'width 0.5s ease', borderRadius: '0 99px 99px 0' }} />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#444', fontSize: '0.68rem', fontStyle: 'italic', padding: '2px 0' }}>
          No votes cast yet — click to begin tallying
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ position: 'relative' }}>
      {trigger}
      {dropdown}
      <style>{`@keyframes voteDropIn { from { opacity: 0; transform: translateY(${dropUp ? '6px' : '-6px'}); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── VoteSummary (light theme) ────────────────────────────────────────────────

export const VOTE_ITEMS: { key: string; short: string }[] = [
  { key: 'agenda-adoption',     short: 'Agenda Adoption' },
  { key: 'treasurer',           short: 'Treasurer' },
  { key: 'financial-secretary', short: 'Financial Secretary' },
  { key: 'parliamentarian',     short: 'Parliamentarian' },
  { key: 'd9-sponsorship',      short: 'D9 Sponsorship' },
];

export function VoteSummary() {
  const { votes, resetVote, floorVotes } = useMeeting();
  const allItems = [
    ...VOTE_ITEMS,
    ...floorVotes.map(fv => ({ key: `floor-${fv.id}`, short: fv.question.slice(0, 28) + (fv.question.length > 28 ? '…' : '') })),
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {allItems.map(({ key, short }) => {
        const isFloor = key.startsWith('floor-');
        const fvId    = isFloor ? key.replace('floor-', '') : '';
        const fv      = isFloor ? floorVotes.find(v => v.id === fvId) : null;
        const v       = isFloor ? (fv ? { yay: fv.yay, nay: fv.nay } : { yay: 0, nay: 0 }) : (votes[key] ?? { yay: 0, nay: 0 });
        const total   = v.yay + v.nay;
        const yayPct  = total > 0 ? Math.round((v.yay / total) * 100) : 0;
        const status  = total === 0 ? 'pending' : v.yay > v.nay ? 'pass' : v.nay > v.yay ? 'fail' : 'tie';
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EAEAEA', border: '1px solid #D2D2D2', borderRadius: 7, padding: '7px 12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#333', fontSize: 'clamp(0.72rem,1.2vw,0.88rem)', fontWeight: 600 }}>{short}</div>
            </div>
            {total > 0 ? (
              <>
                <span style={{ color: '#222', fontSize: '0.72rem', fontWeight: 700 }}>{v.yay}Y</span>
                <span style={{ color: '#BBB', fontSize: '0.72rem' }}>/</span>
                <span style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700 }}>{v.nay}N</span>
                <div style={{ width: 56, height: 5, borderRadius: 99, background: '#D0D0D0', overflow: 'hidden' }}>
                  <div style={{ width: `${yayPct}%`, height: '100%', background: status === 'pass' ? '#222' : '#999', transition: 'width 0.4s', borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: status === 'pass' ? 'rgba(0,0,0,0.08)' : status === 'fail' ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.05)', color: status === 'pass' ? '#222' : status === 'fail' ? '#888' : '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {status === 'pass' ? 'Passed' : status === 'fail' ? 'Failed' : 'Tied'}
                </span>
                {!isFloor && <button onClick={() => resetVote(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCC', padding: 2 }}><RotateCcw size={11} /></button>}
              </>
            ) : (
              <span style={{ color: '#CCC', fontSize: '0.68rem', fontStyle: 'italic' }}>Pending</span>
            )}
          </div>
        );
      })}
    </div>
  );
}