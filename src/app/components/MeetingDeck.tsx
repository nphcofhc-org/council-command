import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, LayoutGrid, X,
  Maximize2, Minimize2, Users, Hand, MessageSquare, Gavel, Pause, Play, RotateCcw
} from 'lucide-react';
import { MeetingProvider, useMeeting, SLIDE_VOTES } from './MeetingContext';
import { MeetingSidebar } from './MeetingSidebar';
import {
  Slide1Cover, Slide2Agenda, Slide3Vision, Slide4Ratification,
  Slide5Financials, Slide6NewBusiness, Slide7SuccessRecap, Slide8BowlingRecap, Slide9Adjournment,
} from './DeckSlides';

// ─── Utils ───────────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
}

// ─── Slide registry ──────────────────────────────────────────────────────────

type SlideComp = React.ComponentType<{ isMobile?: boolean; meetingDateLabel?: string }>;
type DeckSlide = { id: number; label: string; component: SlideComp };

const VOTE_SLIDES = new Set([2, 4, 5, 9]);
const BORDER_LIGHT = '#E0E0E0';
const BORDER_DARK = '#282828';

const variants = {
  enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } },
  exit:   (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] } }),
};

// ─── Inner deck (needs context) ───────────────────────────────────────────────

function DeckInner({
  canControl = true,
  meetingDateLabel = 'February 2026',
  showJoinCelebration = true,
  maxVisibleSlides,
}: {
  canControl?: boolean;
  meetingDateLabel?: string;
  showJoinCelebration?: boolean;
  maxVisibleSlides?: number;
}) {
  const isMobile = useIsMobile();
  const { myHandId, raiseHand, lowerMyHand, memberName, lastCommitteeJoin } = useMeeting();

  const [current,       setCurrent]       = useState(0);
  const [direction,     setDirection]     = useState(1);
  const [gridOpen,      setGridOpen]      = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(!isMobile && canControl);
  const [fullscreen,    setFullscreen]    = useState(false);
  const [mobileSheet,   setMobileSheet]   = useState(false);
  const [mobileTab,     setMobileTab]     = useState<'hand' | 'motion' | 'vote'>('hand');
  const [joinToast, setJoinToast] = useState<{ memberName: string; committeeId: string } | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);
  const slides = useMemo<DeckSlide[]>(
    () => [
      {
        id: 1,
        label: 'Title & Cover',
        component: (props) => <Slide1Cover {...props} meetingDateLabel={meetingDateLabel} />,
      },
      {
        id: 2,
        label: 'Order of Business',
        component: (props) => <Slide2Agenda {...props} meetingDateLabel={meetingDateLabel} />,
      },
      { id: 3, label: '2026 Vision: Four Pillars', component: Slide3Vision },
      { id: 4, label: 'Meet the E-Board', component: Slide4Ratification },
      { id: 5, label: 'Committee Chairs & Sign-Up', component: Slide5Financials },
      { id: 6, label: 'Signature Event', component: Slide6NewBusiness },
      { id: 7, label: 'MLK Day of Service (Tina)', component: Slide7SuccessRecap },
      { id: 8, label: 'Bowling Night Fundraiser (Azaria)', component: Slide8BowlingRecap },
      { id: 9, label: 'Closing & Adjournment', component: Slide9Adjournment },
    ],
    [meetingDateLabel],
  );
  const visibleSlides = useMemo<DeckSlide[]>(() => {
    if (!Number.isFinite(maxVisibleSlides) || !maxVisibleSlides || maxVisibleSlides < 1) return slides;
    return slides.slice(0, Math.min(slides.length, Math.floor(maxVisibleSlides)));
  }, [slides, maxVisibleSlides]);

  useEffect(() => {
    setCurrent((prev) => Math.min(prev, Math.max(0, visibleSlides.length - 1)));
  }, [visibleSlides.length]);

  useEffect(() => {
    if (!canControl || !showJoinCelebration || !lastCommitteeJoin?.memberName) return;
    setJoinToast({ memberName: lastCommitteeJoin.memberName, committeeId: lastCommitteeJoin.committeeId });
    const t = window.setTimeout(() => setJoinToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [canControl, showJoinCelebration, lastCommitteeJoin]);

  useEffect(() => {
    if (!isMobile) setMobileSheet(false);
  }, [isMobile]);

  useEffect(() => {
    if (!canControl) {
      setSidebarOpen(false);
      setMobileSheet(false);
    }
  }, [canControl]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const goTo = useCallback((idx: number) => {
    if (idx === current) { setGridOpen(false); return; }
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    setGridOpen(false);
  }, [current]);

  const prev = useCallback(() => { if (current > 0) goTo(current - 1); }, [current, goTo]);
  const next = useCallback(() => { if (current < visibleSlides.length - 1) goTo(current + 1); }, [current, goTo, visibleSlides.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(tag)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
      if (e.key === 'Escape') { setGridOpen(false); setMobileSheet(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [next, prev]);

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {});
    }
  };
  useEffect(() => {
    const h = () => { if (!document.fullscreenElement) setFullscreen(false); };
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const openSheet = (tab: 'hand' | 'motion' | 'vote') => {
    setMobileTab(tab);
    setMobileSheet(true);
  };

  const SlideComponent = visibleSlides[current].component;
  const progress    = ((current + 1) / visibleSlides.length) * 100;
  const isVoteSlide = VOTE_SLIDES.has(current + 1);
  const isCoverSlide = current === 0;
  const timerMinutes = Math.floor(timerSeconds / 60);
  const timerRemainderSeconds = timerSeconds % 60;
  const timerLabel = `${String(timerMinutes).padStart(2, '0')}:${String(timerRemainderSeconds).padStart(2, '0')}`;

  // ── Mobile layout ────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100svh', background: '#F5F5F5', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", position: 'relative' }}
        onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const diff = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
        }}
      >
        {/* Progress */}
        <div style={{ height: 3, background: '#E0E0E0', flexShrink: 0 }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: 'linear-gradient(90deg,#888,#333)' }} />
        </div>

        {/* Top bar */}
        <div style={{ height: 48, background: 'rgba(255,255,255,0.97)', borderBottom: `1px solid ${BORDER_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', flexShrink: 0, backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#222', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                {String(current + 1).padStart(2, '0')}
                <span style={{ color: '#CCC' }}> / {visibleSlides.length}</span>
              </span>
            <div style={{ width: 1, height: 16, background: BORDER_LIGHT }} />
            <span style={{ color: '#888', fontSize: '0.78rem', maxWidth: '28ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {visibleSlides[current].label}
            </span>
            {isVoteSlide && (
              <span style={{ background: '#C62828', color: '#fff', fontSize: '0.52rem', fontWeight: 800, padding: '2px 7px', borderRadius: 99, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Vote</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #D6D6D6', borderRadius: 7, padding: '2px 6px', background: '#FFFFFF' }}>
              <span style={{ color: '#333', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em' }}>
                {timerLabel}
              </span>
              {canControl ? (
                <>
                  <button
                    onClick={() => setTimerRunning((prev) => !prev)}
                    title={timerRunning ? 'Pause timer' : 'Start timer'}
                    style={{ background: 'transparent', border: 'none', padding: 2, cursor: 'pointer', color: '#444', display: 'flex', alignItems: 'center' }}
                  >
                    {timerRunning ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                  <button
                    onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
                    title="Reset timer"
                    style={{ background: 'transparent', border: 'none', padding: 2, cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
                  >
                    <RotateCcw size={12} />
                  </button>
                </>
              ) : null}
            </div>
            <button onClick={() => setGridOpen(o => !o)} style={{ background: gridOpen ? 'rgba(0,0,0,0.06)' : 'transparent', border: `1px solid ${gridOpen ? '#CCC' : 'transparent'}`, borderRadius: 7, padding: '6px 9px', cursor: 'pointer', color: gridOpen ? '#222' : '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
              {gridOpen ? <X size={14} /> : <LayoutGrid size={14} />}
            </button>
            {canControl ? (
              <button onClick={() => openSheet('vote')} style={{ background: 'transparent', border: 'none', borderRadius: 7, padding: '6px', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}>
                <Users size={17} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Slide grid */}
        <AnimatePresence>
          {gridOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              style={{ position: 'absolute', top: 51, left: 0, right: 0, zIndex: 40, background: 'rgba(255,255,255,0.98)', borderBottom: `1px solid ${BORDER_LIGHT}`, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, backdropFilter: 'blur(10px)' }}
            >
              {visibleSlides.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} style={{ background: i === current ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.02)', border: `1px solid ${i === current ? '#C0C0C0' : BORDER_LIGHT}`, borderRadius: 7, padding: '7px 9px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: i === current ? '#222' : '#BBB', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 2 }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ color: i === current ? '#444' : '#999', fontSize: '0.68rem', lineHeight: 1.3 }}>{s.label}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={current} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" style={{ position: 'absolute', inset: 0 }}>
              <SlideComponent isMobile />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div style={{ height: 48, background: 'rgba(255,255,255,0.97)', borderTop: `1px solid ${BORDER_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', flexShrink: 0 }}>
          <button onClick={prev} disabled={current === 0} style={{ background: 'transparent', border: `1px solid ${current === 0 ? '#EEE' : BORDER_LIGHT}`, borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: current === 0 ? 'not-allowed' : 'pointer', color: current === 0 ? '#DDD' : '#666' }}>
            <ChevronLeft size={17} />
          </button>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {visibleSlides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ width: i === current ? 22 : 7, height: 7, borderRadius: 99, background: i === current ? '#333' : i < current ? '#BBB' : '#DDD', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
            ))}
          </div>
          <button onClick={next} disabled={current === visibleSlides.length - 1} style={{ background: current === visibleSlides.length - 1 ? 'transparent' : 'rgba(0,0,0,0.06)', border: `1px solid ${current === visibleSlides.length - 1 ? '#EEE' : '#C0C0C0'}`, borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: current === visibleSlides.length - 1 ? 'not-allowed' : 'pointer', color: current === visibleSlides.length - 1 ? '#DDD' : '#333' }}>
            <ChevronRight size={17} />
          </button>
        </div>

        {/* Mobile action bar — dark (black modal) */}
        {canControl ? (
        <div style={{ height: 60, background: '#0A0A0A', borderTop: '1px solid #1C1C1C', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {([
            { icon: Hand,           label: myHandId ? 'Lower' : 'Hand',  tab: 'hand' as const,   active: !!myHandId },
            { icon: MessageSquare,  label: 'Motion',  tab: 'motion' as const, active: false },
            { icon: Gavel,          label: 'Vote',    tab: 'vote' as const,   active: isVoteSlide, dot: isVoteSlide },
            { icon: Users,          label: 'Room',    tab: 'vote' as const,   active: false, isRoom: true },
          ]).map(({ icon: Icon, label, tab, active, dot, isRoom }) => (
            <button
              key={label}
              onClick={() => {
                if (isRoom) { setMobileSheet(o => !o); return; }
                if (label === 'Hand' || label === 'Lower') {
                  if (myHandId) lowerMyHand();
                  else raiseHand(memberName || 'Anonymous');
                  return;
                }
                openSheet(tab);
              }}
              style={{ flex: 1, height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={19} color={active ? '#E0E0E0' : '#808080'} />
                {dot && <div style={{ position: 'absolute', top: -2, right: -3, width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: active ? '#E0E0E0' : '#808080', letterSpacing: '0.06em' }}>{label}</span>
              {active && !isRoom && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: '#E0E0E0', borderRadius: '0 0 99px 99px' }} />}
            </button>
          ))}
        </div>
        ) : null}

        {/* Mobile bottom sheet — dark (black modal) */}
        <AnimatePresence>
          {mobileSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileSheet(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50 }}
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '80svh', background: '#0C0C0C', borderRadius: '16px 16px 0 0', zIndex: 51, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ padding: '10px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 4, borderRadius: 99, background: '#2A2A2A' }} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <MeetingSidebar currentSlide={current} externalTab={mobileTab} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showJoinCelebration && joinToast ? (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="pointer-events-none fixed left-1/2 top-16 z-[80] -translate-x-1/2 rounded-xl border border-white/20 bg-black/85 px-4 py-2 text-sm text-white shadow-2xl"
            >
              🎉 {joinToast.memberName} joined {joinToast.committeeId.replace(/-/g, " ")}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', display: 'flex', background: '#FFFFFF', borderRadius: fullscreen ? 0 : 14, overflow: 'hidden', boxShadow: fullscreen ? 'none' : '0 24px 80px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.06)', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", height: fullscreen ? '100vh' : undefined }}
    >
      {/* Slide column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>

          {/* Progress */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 30, background: '#E0E0E0' }}>
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: 'linear-gradient(90deg,#888,#333,#555)' }} />
          </div>

          {/* Top bar — light */}
          <div style={{ position: 'absolute', top: 3, left: 0, right: 0, height: 40, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', background: isCoverSlide ? 'rgba(10,10,10,0.92)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${isCoverSlide ? '#222' : BORDER_LIGHT}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: isCoverSlide ? '#888' : '#555', fontSize: '0.72rem', fontWeight: 700 }}>
                {String(current + 1).padStart(2, '0')}<span style={{ color: isCoverSlide ? '#333' : '#CCC' }}> / {visibleSlides.length}</span>
              </span>
              <div style={{ width: 1, height: 14, background: isCoverSlide ? '#333' : BORDER_LIGHT }} />
              <span style={{ color: isCoverSlide ? '#666' : '#888', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '26ch' }}>{visibleSlides[current].label}</span>
              {isVoteSlide && <span style={{ background: isCoverSlide ? '#C62828' : '#C62828', color: '#fff', fontSize: '0.54rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Vote</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: isCoverSlide ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isCoverSlide ? '#303030' : '#D8D8D8'}`, borderRadius: 6, padding: '2px 6px' }}>
                <span style={{ color: isCoverSlide ? '#D0D0D0' : '#333', fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.06em' }}>
                  {timerLabel}
                </span>
                {canControl ? (
                  <>
                    <button
                      onClick={() => setTimerRunning((prev) => !prev)}
                      title={timerRunning ? 'Pause timer' : 'Start timer'}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCoverSlide ? '#B8B8B8' : '#444', padding: 1, display: 'flex', alignItems: 'center' }}
                    >
                      {timerRunning ? <Pause size={11} /> : <Play size={11} />}
                    </button>
                    <button
                      onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
                      title="Reset timer"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCoverSlide ? '#8A8A8A' : '#666', padding: 1, display: 'flex', alignItems: 'center' }}
                    >
                      <RotateCcw size={11} />
                    </button>
                  </>
                ) : null}
              </div>
              <button onClick={() => setGridOpen(o => !o)} style={{ background: gridOpen ? (isCoverSlide ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent', border: `1px solid ${gridOpen ? (isCoverSlide ? '#3A3A3A' : '#C0C0C0') : 'transparent'}`, cursor: 'pointer', padding: '4px 9px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5, color: gridOpen ? (isCoverSlide ? '#E0E0E0' : '#333') : (isCoverSlide ? '#555' : '#999'), transition: 'all 0.18s' }}>
                {gridOpen ? <X size={12} /> : <LayoutGrid size={12} />}
                <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>Slides</span>
              </button>
              {canControl ? (
                <button onClick={() => setSidebarOpen(o => !o)} style={{ background: sidebarOpen ? (isCoverSlide ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)') : 'transparent', border: `1px solid ${sidebarOpen ? (isCoverSlide ? '#3A3A3A' : '#C0C0C0') : 'transparent'}`, cursor: 'pointer', padding: '4px 9px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5, color: sidebarOpen ? (isCoverSlide ? '#E0E0E0' : '#333') : (isCoverSlide ? '#555' : '#999'), transition: 'all 0.18s' }}>
                  <Users size={12} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>Room</span>
                </button>
              ) : (
                <span style={{ color: isCoverSlide ? '#555' : '#8A8A8A', fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>View Only</span>
              )}
              <button onClick={toggleFullscreen} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: isCoverSlide ? '#555' : '#BBB', display: 'flex', alignItems: 'center' }}>
                {fullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            </div>
          </div>

          {/* Grid overlay */}
          <AnimatePresence>
            {gridOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                style={{ position: 'absolute', top: 43, left: 0, right: 0, zIndex: 25, background: isCoverSlide ? 'rgba(8,8,8,0.97)' : 'rgba(255,255,255,0.98)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${isCoverSlide ? '#222' : BORDER_LIGHT}`, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}
              >
                {visibleSlides.map((s, i) => (
                  <button key={s.id} onClick={() => goTo(i)} style={{ background: i === current ? (isCoverSlide ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : (isCoverSlide ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'), border: `1px solid ${i === current ? (isCoverSlide ? '#3C3C3C' : '#C0C0C0') : (isCoverSlide ? '#222' : BORDER_LIGHT)}`, borderRadius: 7, padding: '8px 10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ color: i === current ? (isCoverSlide ? '#E0E0E0' : '#222') : (isCoverSlide ? '#404040' : '#BBB'), fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      {VOTE_SLIDES.has(i + 1) && <span style={{ background: i === current ? (isCoverSlide ? '#fff' : '#0A0A0A') : (isCoverSlide ? '#2A2A2A' : '#DDD'), color: i === current ? (isCoverSlide ? '#0A0A0A' : '#fff') : (isCoverSlide ? '#606060' : '#888'), fontSize: '0.52rem', padding: '0 6px', borderRadius: 99, fontWeight: 800 }}>V</span>}
                    </div>
                    <div style={{ color: i === current ? (isCoverSlide ? '#C8C8C8' : '#444') : (isCoverSlide ? '#484848' : '#999'), fontSize: '0.72rem', lineHeight: 1.3 }}>{s.label}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slide */}
          <div style={{ position: 'absolute', top: 43, left: 0, right: 0, bottom: 40, overflow: 'hidden' }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={current} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" style={{ position: 'absolute', inset: 0 }}>
                <SlideComponent isMobile={false} />
              </motion.div>
            </AnimatePresence>

            {current > 0 && (
              <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 15, background: isCoverSlide ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.9)', border: `1px solid ${isCoverSlide ? '#333' : BORDER_LIGHT}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isCoverSlide ? '#666' : '#888', backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => { e.currentTarget.style.color = isCoverSlide ? '#E0E0E0' : '#222'; e.currentTarget.style.borderColor = isCoverSlide ? '#505050' : '#BBB'; }}
                onMouseLeave={e => { e.currentTarget.style.color = isCoverSlide ? '#666' : '#888'; e.currentTarget.style.borderColor = isCoverSlide ? '#333' : BORDER_LIGHT; }}
              ><ChevronLeft size={14} /></button>
            )}
            {current < visibleSlides.length - 1 && (
              <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 15, background: isCoverSlide ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.9)', border: `1px solid ${isCoverSlide ? '#333' : BORDER_LIGHT}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isCoverSlide ? '#666' : '#888', backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => { e.currentTarget.style.color = isCoverSlide ? '#E0E0E0' : '#222'; e.currentTarget.style.borderColor = isCoverSlide ? '#505050' : '#BBB'; }}
                onMouseLeave={e => { e.currentTarget.style.color = isCoverSlide ? '#666' : '#888'; e.currentTarget.style.borderColor = isCoverSlide ? '#333' : BORDER_LIGHT; }}
              ><ChevronRight size={14} /></button>
            )}
          </div>

          {/* Bottom bar — light */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: isCoverSlide ? 'rgba(8,8,8,0.95)' : 'rgba(255,255,255,0.95)', borderTop: `1px solid ${isCoverSlide ? '#222' : BORDER_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', backdropFilter: 'blur(8px)', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {visibleSlides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 99, background: i === current ? (isCoverSlide ? 'linear-gradient(90deg,#A0A0A0,#E0E0E0)' : 'linear-gradient(90deg,#555,#222)') : i < current ? (isCoverSlide ? '#383838' : '#BBB') : (isCoverSlide ? '#202020' : '#DDD'), border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: isCoverSlide ? '#282828' : '#CCC', fontSize: '0.64rem' }}>&larr; &rarr; navigate</span>
              <button onClick={prev} disabled={current === 0} style={{ background: 'transparent', border: `1px solid ${current === 0 ? (isCoverSlide ? '#1A1A1A' : '#EEE') : (isCoverSlide ? '#333' : BORDER_LIGHT)}`, borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, color: current === 0 ? (isCoverSlide ? '#2A2A2A' : '#DDD') : (isCoverSlide ? '#808080' : '#666'), cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit' }}>
                <ChevronLeft size={11} /> Prev{current > 0 ? `: ${slides[current - 1].label}` : ""}
              </button>
              <button onClick={next} disabled={current === visibleSlides.length - 1} style={{ background: current === visibleSlides.length - 1 ? 'transparent' : (isCoverSlide ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'), border: `1px solid ${current === visibleSlides.length - 1 ? (isCoverSlide ? '#1A1A1A' : '#EEE') : (isCoverSlide ? '#3C3C3C' : '#C0C0C0')}`, borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, color: current === visibleSlides.length - 1 ? (isCoverSlide ? '#2A2A2A' : '#DDD') : (isCoverSlide ? '#D0D0D0' : '#333'), cursor: current === visibleSlides.length - 1 ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit' }}>
                Next{current < visibleSlides.length - 1 ? `: ${visibleSlides[current + 1].label}` : ""} <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar — stays dark (black modal) */}
      <AnimatePresence>
        {canControl && sidebarOpen && (
          <motion.div key="sidebar" initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }} style={{ flexShrink: 0, borderLeft: `1px solid #1E1E1E`, overflow: 'hidden' }}>
            <div style={{ width: 280, height: '100%' }}>
              <MeetingSidebar currentSlide={current} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJoinCelebration && joinToast ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none fixed left-1/2 top-6 z-[80] -translate-x-1/2 rounded-xl border border-white/20 bg-black/85 px-4 py-2 text-sm text-white shadow-2xl"
          >
            🎉 {joinToast.memberName} joined {joinToast.committeeId.replace(/-/g, " ")}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────

type MeetingDeckProps = {
  voterEmail?: string | null;
  defaultMemberName?: string;
  canControl?: boolean;
  meetingDateLabel?: string;
  showJoinCelebration?: boolean;
  maxVisibleSlides?: number;
};

export function MeetingDeck({ voterEmail, defaultMemberName, canControl = true, meetingDateLabel, showJoinCelebration = true, maxVisibleSlides }: MeetingDeckProps) {
  return (
    <MeetingProvider voterEmail={voterEmail} defaultMemberName={defaultMemberName} canControl={canControl}>
      <DeckInner canControl={canControl} meetingDateLabel={meetingDateLabel} showJoinCelebration={showJoinCelebration} maxVisibleSlides={maxVisibleSlides} />
    </MeetingProvider>
  );
}
