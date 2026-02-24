import {
  Lightbulb, Eye, Settings, Link2,
  FileText, Cpu, Sun, Package, Trophy, Heart, ChevronRight, Star, AlertCircle,
  ExternalLink, DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { VoteWidget, VoteSummary } from './VoteWidget';
import { useMeeting } from './MeetingContext';

// ─── Tokens (WHITE background theme) ─────────────────────────────────────────
const BG      = '#FFFFFF';
const BG_ALT  = '#FAFAFA';
const BG_CARD = '#EAEAEA';
const BG_EL   = '#DCDCDC';
const BORDER  = '#D2D2D2';
const BORDER2 = '#C2C2C2';
const SILVER  = '#505050';
const SILVER_M = '#2A2A2A';
const SILVER_L = '#151515';
const BLACK   = '#0A0A0A';

const LOGO_URL       = 'https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20LOGO%20FINAL%20WHITE%20ON%20BLACK%20-%20CLEAR.png.png';
const CANDIDATE_1    = 'https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20Executive%20Council%20(1).png';
const CANDIDATE_2    = 'https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20Executive%20Council%20(2).png';
const CANDIDATE_3    = 'https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20Executive%20Council%20(3).png';
const D9_TRENTON_URL = 'https://d9intrenton.my.canva.site/home/';
const THANK_YOU_LETTER_IMAGE_URL = 'https://pub-e0d3ae4075164c7aa7204024db626148.r2.dev/2.png';
const FUNDRAISING_TOTAL_IMAGE_URL = 'https://pub-e0d3ae4075164c7aa7204024db626148.r2.dev/3.png';
const EXEC_EBOARD_SLIDE_IMAGE_URL = 'https://pub-e0d3ae4075164c7aa7204024db626148.r2.dev/NPHC%20Executive%20Council%20(Presentation)%20(2).png';
const JANUARY_MINUTES_FILE_URL = '/docs/January_Minutes_2026.pdf';
const SERVICE_COMMITTEE_REPORT_IMAGE_URL = 'https://pub-e0d3ae4075164c7aa7204024db626148.r2.dev/Final.png';
const TREASURER_REPORT_EMBED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NPHC HC - Executive Financial Briefing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; }
        .pillar-card { border-top: 4px solid; }
        .pillar-innovation { border-color: #818cf8; }
        .pillar-visibility { border-color: #fbbf24; }
        .pillar-optimization { border-color: #34d399; }
        .pillar-alignment { border-color: #a78bfa; }
        .exec-summary-item { border-left: 2px solid #6366f1; padding-left: 1rem; }
        .stat-glow { text-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }
        * { box-sizing: border-box; }
        html, body { min-height: 100%; margin: 0; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
        
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">NPHC of Hudson County, NJ</h1>
                <p class="text-indigo-400 font-medium">Financial Reporting: February 23, 2026</p>
            </div>
            <div class="bg-indigo-600/20 px-4 py-2 rounded-lg border border-indigo-500/30">
                <p class="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Performance Status</p>
                <p class="text-emerald-400 font-bold text-sm">Outperforming 2025 Baseline</p>
            </div>
        </header>

        <section class="glass-card p-6 border-2 border-indigo-500/50 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-2 bg-indigo-500 text-[10px] font-bold text-white rounded-bl-lg uppercase tracking-widest">
                Executive Summary
            </div>
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                Key Discussion Items
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="exec-summary-item">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Account Migration</p>
                    <p class="text-sm text-slate-200"><span class="font-bold text-indigo-300">$420.00</span> transfer from legacy (Craig) to new Chapter Cash App.</p>
                </div>
                <div class="exec-summary-item">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Fixed Operations</p>
                    <p class="text-sm text-slate-200">Domain/Website Maintenance: <span class="font-bold text-indigo-300">$7.50/month</span>.</p>
                </div>
                <div class="exec-summary-item">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">National Obligations</p>
                    <p class="text-sm text-slate-200">Annual NPHC Dues settled: <span class="font-bold text-indigo-300">$254.54</span> total.</p>
                </div>
                <div class="exec-summary-item">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Outstanding Reimbursement</p>
                    <p class="text-sm text-slate-200"><span class="font-bold text-rose-400">$76.82</span> balance for NPHC National Convention.</p>
                </div>
                <div class="exec-summary-item">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Fundraising Spotlight</p>
                    <p class="text-sm text-slate-200 italic text-indigo-300">"Bowling Event profits to be briefed by Fundraising Chair."</p>
                </div>
                <div class="exec-summary-item border-indigo-400 bg-indigo-500/5 p-2 rounded-r">
                    <p class="text-xs text-indigo-400 font-bold uppercase mb-1">Action Required</p>
                    <p class="text-sm text-white font-semibold">All Committee Chairs must submit 2026 budgets immediately.</p>
                </div>
            </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-card p-4 pillar-card pillar-innovation">
                <h3 class="text-indigo-300 font-bold text-xs mb-1 uppercase tracking-wider">Innovation</h3>
                <p class="text-[11px] text-slate-400">AI tools & modernizing operations.</p>
            </div>
            <div class="glass-card p-4 pillar-card pillar-visibility">
                <h3 class="text-amber-300 font-bold text-xs mb-1 uppercase tracking-wider">Visibility</h3>
                <p class="text-[11px] text-slate-400">Increasing community presence.</p>
            </div>
            <div class="glass-card p-4 pillar-card pillar-optimization">
                <h3 class="text-emerald-300 font-bold text-xs mb-1 uppercase tracking-wider">Optimization</h3>
                <p class="text-[11px] text-slate-400">Maximizing chapter efficiency.</p>
            </div>
            <div class="glass-card p-4 pillar-card pillar-alignment">
                <h3 class="text-purple-300 font-bold text-xs mb-1 uppercase tracking-wider">Alignment</h3>
                <p class="text-[11px] text-slate-400">Transparency across all D9 orgs.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-7 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="glass-card p-6 border-l-4 border-indigo-500">
                        <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">LendingClub Balance</p>
                        <div class="text-3xl font-bold stat-glow text-white">$9,101.25</div>
                        <p class="text-[10px] text-slate-400 mt-2 italic">Verified via Feb 23 Statement</p>
                    </div>
                    <div class="glass-card p-6">
                        <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Cash App Liquidity</p>
                        <div class="text-3xl font-bold text-slate-200">$335.00</div>
                        <p class="text-[10px] text-indigo-400 mt-2 font-mono">$NPHCofHC</p>
                    </div>
                </div>
                <div class="glass-card p-6 h-64">
                    <canvas id="growthChart"></canvas>
                </div>
            </div>

            <div class="lg:col-span-5">
                <div class="glass-card p-6 h-full">
                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Verified Transaction History</h3>
                    <div class="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                        <div class="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <div>
                                <p class="text-xs font-bold text-white">Cloudflare (Domain)</p>
                                <p class="text-[10px] text-slate-500">Fixed Monthly Fee</p>
                            </div>
                            <span class="text-rose-400 font-bold text-sm">($7.50)</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <div>
                                <p class="text-xs font-bold text-white">NPHCHQ Dues</p>
                                <p class="text-[10px] text-slate-500">Annual Fee + Processing</p>
                            </div>
                            <span class="text-rose-400 font-bold text-sm">($254.54)</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <div>
                                <p class="text-xs font-bold text-emerald-400">Chapter Transfer</p>
                                <p class="text-[10px] text-emerald-600">Account Migration (Feb 1)</p>
                            </div>
                            <span class="text-emerald-400 font-bold text-sm">+$420.00</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <div>
                                <p class="text-xs font-bold text-white">G. Kamara Reimb.</p>
                                <p class="text-[10px] text-slate-500">Convention Balance</p>
                            </div>
                            <span class="text-rose-400 font-bold text-sm">($76.82)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="flex justify-between items-center p-4 glass-card border-t-4 border-indigo-500">
            <p class="text-xs text-slate-400 font-medium tracking-tight">Report Prepared for Executive Council by Treasurer Gibrill Kamara</p>
            <div class="flex gap-2">
                <span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full uppercase">Feb 23, 2026</span>
            </div>
        </footer>
    </div>

    <script>
        const chartCanvas = document.getElementById('growthChart');
        if (chartCanvas && window.Chart) {
          const ctx = chartCanvas.getContext('2d');
          new Chart(ctx, {
              type: 'line',
              data: {
                  labels: ['Nov 25', 'Dec 25', 'Jan 26', 'Feb 23'],
                  datasets: [{
                      label: 'Liquidity Trend',
                      data: [7394, 7595, 8017, 9101],
                      borderColor: '#818cf8',
                      backgroundColor: 'rgba(129, 140, 248, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointBackgroundColor: '#fff'
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } },
                      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                  }
              }
          });
        }
    </script>
</body>
</html>`;

// ─── Primitives ──────────────────────────────────────────────────────────────

function SilverLine({ width = 56, my = 12 }: { width?: number; my?: number }) {
  return <div style={{ width, height: 2, margin: `${my}px 0`, background: 'linear-gradient(90deg,#B0B0B0,#707070,#B0B0B0)', borderRadius: 99 }} />;
}
function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ color: SILVER, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{children}</span>;
}
function Badge({ children, solid }: { children: React.ReactNode; solid?: boolean }) {
  return (
    <span style={{ background: solid ? '#C62828' : BG_EL, color: solid ? '#FFFFFF' : SILVER_M, border: solid ? 'none' : `1px solid ${BORDER2}`, fontSize: '0.56rem', fontWeight: 800, padding: '3px 9px', borderRadius: 99, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {children}
    </span>
  );
}

// ─── Slide 1: Cover ──────────────────────────────────────────────────────────

export function Slide1Cover({ isMobile = false, meetingDateLabel = 'February 2026' }: { isMobile?: boolean; meetingDateLabel?: string }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BLACK, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle,#2A2A2A 1px,transparent 1px)', backgroundSize: isMobile ? '22px 22px' : '28px 28px', opacity: 0.3 }} />
      {/* Glow */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(180,180,180,0.05) 0%,transparent 70%)', pointerEvents: 'none' }} />
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#909090,#D8D8D8,#909090,transparent)' }} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '20px 20px 0' : 'clamp(28px,5%,64px)', paddingBottom: 0 }}>
        <span style={{ color: '#9A9A9A', fontSize: isMobile ? '0.82rem' : '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>NPHC of Hudson County</span>
        <h1 style={{ color: '#FFFFFF', margin: isMobile ? '12px 0 0' : '10px 0 0', fontSize: isMobile ? '2.4rem' : 'clamp(2rem,4.5vw,3.4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Executive Council<br />Meeting
        </h1>
        <h2 style={{ color: '#BEBEBE', margin: isMobile ? '10px 0 0' : '10px 0 0', fontSize: isMobile ? '1.25rem' : 'clamp(1.1rem,2.2vw,1.6rem)', fontWeight: 300, letterSpacing: '0.12em' }}>
          {meetingDateLabel}
        </h2>
        <div style={{ width: 52, height: 2, margin: `${isMobile ? 14 : 10}px 0`, background: 'linear-gradient(90deg,#606060,#C0C0C0,#606060)', borderRadius: 99 }} />
        <p style={{ color: '#9A9A9A', fontSize: isMobile ? '0.85rem' : 'clamp(0.72rem,1.2vw,0.95rem)', letterSpacing: '0.26em', textTransform: 'uppercase', margin: 0 }}>
          Elevating the Standard
        </p>
      </div>

      {/* Bottom logo bar */}
      <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #1E1E1E', flexShrink: 0, padding: isMobile ? '12px 20px' : '10px 14px' }}>
        <img src={LOGO_URL} alt="NPHC of Hudson County" style={{ height: isMobile ? 44 : 'clamp(36px,6vw,56px)', objectFit: 'contain' }} />
      </div>
    </div>
  );
}

// ─── Slide 2: Agenda ─────────────────────────────────────────────────────────

type AgendaTag = { text: string; solid?: boolean; color?: string };

const agendaItems: { num: string; title: string; sub?: string; tags?: AgendaTag[] }[] = [
  { num: '01', title: 'Call to Order' },
  { num: '02', title: 'Call to Prayer (Chaplain)' },
  { num: '03', title: 'Roll Call (Secretary)' },
  { num: '04', title: 'Adoption of the Agenda', tags: [{ text: 'Vote', solid: true }] },
  { num: '05', title: 'Adoption of the Minutes', tags: [{ text: 'Vote', solid: true }] },
  { num: '06', title: "President's Address", tags: [{ text: 'Address' }] },
  { num: '07', title: 'Meet the Board' },
  { num: '08', title: "Treasurer's Report", sub: 'Budget position and reconciliation update', tags: [{ text: 'Report' }] },
  { num: '09', title: 'Committee Reports', sub: 'Service, Fundraising, Scholarship + Success Recap', tags: [{ text: 'Reports' }] },
  { num: '10', title: 'Unfinished Business', sub: 'Signature Event: BBQ vs Block Party', tags: [{ text: 'Discuss', color: '#2563EB' }] },
  { num: '11', title: 'New Business', sub: 'Financials & Compliance • Committee Sign-Up • Vacancies / Bylaws', tags: [{ text: 'Action', solid: true }] },
  { num: '12', title: 'Adjournment' },
];

export function Slide2Agenda({ isMobile = false, meetingDateLabel = 'February 2026' }: { isMobile?: boolean; meetingDateLabel?: string }) {
  const [meetingStarted, setMeetingStarted] = useState(false);

  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', overflow: 'hidden' }}>
      {!isMobile && <div style={{ width: 3, background: 'linear-gradient(180deg,transparent,#808080,#404040,#808080,transparent)', flexShrink: 0 }} />}
      <div style={{ flex: 1, padding: isMobile ? '16px 16px 12px' : 'clamp(16px,3.5%,40px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ marginBottom: isMobile ? 12 : 14, flexShrink: 0 }}>
          <Label>{meetingDateLabel}</Label>
          <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.55rem' : 'clamp(1.45rem,3vw,2.2rem)', fontWeight: 700 }}>Order of Business</h1>
          <SilverLine my={isMobile ? 10 : 8} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0' : '0 28px', flex: 1, overflow: isMobile ? 'auto' : 'visible' }}>
          {agendaItems.map(item => (
            <div key={item.num} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '11px 0' : '8px 0', borderBottom: `1px solid ${BORDER}`, minHeight: isMobile ? 48 : undefined }}>
              <span style={{ color: SILVER, fontSize: isMobile ? '0.95rem' : 'clamp(0.84rem,1.5vw,1.05rem)', fontWeight: 700, minWidth: 32, flexShrink: 0 }}>{item.num}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ color: SILVER_L, fontSize: isMobile ? '1rem' : 'clamp(0.82rem,1.4vw,1.05rem)', fontWeight: 600, lineHeight: 1.3 }}>{item.title}</span>
                  {item.num === '01' ? (
                    <button
                      type="button"
                      onClick={() => setMeetingStarted((v) => !v)}
                      style={{
                        background: meetingStarted ? '#0F766E' : '#1F2937',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 999,
                        fontSize: '0.54rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      {meetingStarted ? 'Meeting In Session' : 'Start Meeting'}
                    </button>
                  ) : null}
                  {item.tags?.map(tag => (
                    <span key={tag.text} style={{
                      background: tag.solid ? '#C62828' : tag.color ? `${tag.color}14` : BG_EL,
                      color: tag.solid ? '#FFFFFF' : tag.color ?? SILVER_M,
                      border: tag.solid ? 'none' : `1px solid ${tag.color ? `${tag.color}30` : BORDER2}`,
                      fontSize: '0.54rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                      letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>
                      {tag.text}
                    </span>
                  ))}
                </div>
                {item.sub && !isMobile && <div style={{ color: '#606060', fontSize: 'clamp(0.66rem,1.1vw,0.82rem)', marginTop: 2 }}>{item.sub}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: isMobile ? 12 : 10, flexShrink: 0 }}>
          <VoteWidget voteKey="agenda-adoption" label="Adoption of the Agenda" description={isMobile ? undefined : 'Motion to approve the presented order of business'} dropUp />
        </div>
      </div>
    </div>
  );
}

// ─── Slide 3: Four Pillars ────────────────────────────────────────────────────

const pillars = [
  { icon: Lightbulb, name: 'Innovation',   color: '#2563EB', desc: 'AI tools & Council Command to modernize NPHC operations.', items: ['Council Command platform', 'AI-assisted reporting', 'Digital donation tracking'] },
  { icon: Eye,       name: 'Visibility',   color: '#D97706', desc: 'Increasing community presence through strategic engagement.', items: ['Block Party / Cereal Drive', 'Social media strategy', 'MLK Service amplification'] },
  { icon: Settings,  name: 'Optimization', color: '#059669', desc: 'Our strength is leveraging every chapter’s people, platforms, and partnerships to multiply impact across Hudson County.', items: ['Cross-chapter volunteer & talent coordination', 'Shared vendors, spaces, and in-kind support', 'Resource pooling for larger community impact'] },
  { icon: Link2,     name: 'Alignment',    color: '#7C3AED', desc: 'Transparency and coordination across all D9 organizations.', items: ['D9 Trenton delegation', 'Annual Council reporting', 'Board ratification'] },
];

export function Slide3Vision({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg,#FFFFFF 0%,#F7FAFF 52%,#F5F7FB 100%)', display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(16px,3.5%,38px)', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -50, right: -40, width: isMobile ? 150 : 220, height: isMobile ? 150 : 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.16),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -30, width: isMobile ? 180 : 240, height: isMobile ? 180 : 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(5,150,105,0.14),transparent 72%)', pointerEvents: 'none' }} />
      <div style={{ marginBottom: isMobile ? 12 : 10, flexShrink: 0 }}>
        <Label>Presidential Address</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.7rem' : 'clamp(1.6rem,3.2vw,2.4rem)', fontWeight: 700 }}>
          2026 Vision: <span style={{ color: '#0F172A', fontWeight: 300 }}>Elevating the Standard</span>
        </h1>
        <SilverLine />
        <p style={{ color: '#475569', margin: '2px 0 0', fontSize: isMobile ? '0.8rem' : '0.72rem', fontWeight: 600, letterSpacing: '0.02em' }}>
          Strength through coordinated chapter resources, shared leadership, and measurable impact.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: isMobile ? undefined : '1fr 1fr', gap: isMobile ? 8 : 10, flex: 1, overflow: isMobile ? 'auto' : 'hidden', position: 'relative', zIndex: 1 }}>
        {pillars.map(({ icon: Icon, name, color, desc, items }, i) => (
          <div key={name} style={{ background: `linear-gradient(180deg,#FFFFFF 0%,${color}08 100%)`, border: `1px solid ${color}2A`, borderRadius: 12, padding: isMobile ? '12px' : 'clamp(12px,2.2%,20px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 7, overflow: 'hidden', position: 'relative', boxShadow: `0 8px 20px ${color}10` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}55,transparent)` }} />
            <div style={{ position: 'absolute', top: -18, right: -18, width: 72, height: 72, borderRadius: '50%', background: `radial-gradient(circle,${color}18,transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 6 }}>
              <div style={{ width: isMobile ? 28 : 30, height: isMobile ? 28 : 30, borderRadius: 8, background: `${color}1D`, border: `1px solid ${color}42`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 0 3px ${color}10` }}>
                <Icon size={isMobile ? 13 : 14} color={color} />
              </div>
              <span style={{ color: '#0F172A', fontSize: isMobile ? '1.1rem' : 'clamp(0.95rem,1.7vw,1.2rem)', fontWeight: 800 }}>{name}</span>
              {!isMobile && <span style={{ color: color, fontSize: '0.68rem', marginLeft: 'auto', fontWeight: 700 }}>0{i + 1}</span>}
            </div>
            <p style={{ color: '#334155', fontSize: isMobile ? '0.92rem' : 'clamp(0.72rem,1.25vw,0.95rem)', margin: '0 0 0 6px', lineHeight: 1.45, fontWeight: 500 }}>{desc}</p>
            {(!isMobile || items.length <= 2) && (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: isMobile ? 3 : 4, paddingLeft: 6 }}>
                {(isMobile ? items.slice(0, 2) : items).map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1F2937', fontSize: isMobile ? '0.88rem' : 'clamp(0.68rem,1.15vw,0.88rem)', fontWeight: 600 }}>
                    <ChevronRight size={9} color={color} style={{ flexShrink: 0 }} /> {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 4: Meet the E-Board ────────────────────────────────────────────────

const eboardMembers = [
  { id: 'eb-president', name: 'Christopher DeMarkus', role: 'President', chapter: 'Alpha Phi Alpha Fraternity, Inc.', img: CANDIDATE_1 },
  { id: 'eb-vp', name: 'Kimberly Conway', role: 'Vice President', chapter: 'Alpha Kappa Alpha Sorority, Inc.', img: CANDIDATE_2 },
  { id: 'eb-secretary', name: 'April Stitt', role: 'Secretary', chapter: 'Sigma Gamma Rho Sorority, Inc.', img: CANDIDATE_3 },
  { id: 'eb-treasurer', name: 'Gibrill Kamara', role: 'Treasurer', chapter: 'Alpha Phi Alpha Fraternity, Inc.', img: CANDIDATE_1 },
  { id: 'eb-finsec', name: 'Chris Gadsden', role: 'Financial Secretary', chapter: 'Phi Beta Sigma Fraternity, Inc.', img: CANDIDATE_3 },
  { id: 'eb-parliamentarian', name: 'Ayesha Noel-Smith', role: 'Parliamentarian', chapter: 'Zeta Phi Beta Sorority, Inc.', img: CANDIDATE_2 },
  { id: 'eb-chaplain', name: 'Dr. Viva White', role: 'Chaplain', chapter: 'Zeta Phi Beta Sorority, Inc.', img: CANDIDATE_2 },
];

const committeeChairs = [
  { id: 'service-committee', title: 'Service Committee', chair: 'Tina Jones', chapter: 'Delta Sigma Theta Sorority, Inc.', focus: 'Community service initiatives and impact tracking.' },
  { id: 'fundraising-committee', title: 'Fundraising Committee', chair: 'Dr. Azaria Cunningham', chapter: 'NPHC Council', focus: 'Donor strategy, campaigns, and event revenue plans.' },
  { id: 'scholarship-committee', title: 'Scholarship Committee', chair: 'Dr. Aaliyah Davis', chapter: 'NPHC Council', focus: 'Scholarship review process and award administration.' },
];

export function Slide4Ratification({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(12px,2.6%,32px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 10 : 8, flexShrink: 0 }}>
        <Label>Leadership Roster</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.45rem' : 'clamp(1.2rem,2.6vw,1.85rem)', fontWeight: 700 }}>Meet the E-Board</h1>
        <SilverLine />
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
            gap: isMobile ? 8 : 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '10px' : '12px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <img
              src={EXEC_EBOARD_SLIDE_IMAGE_URL}
              alt="NPHC Executive Council presentation slide"
              style={{
                width: '100%',
                height: '100%',
                minHeight: isMobile ? 220 : 320,
                objectFit: 'contain',
                borderRadius: 10,
                background: BLACK,
                border: `1px solid ${BORDER2}`,
              }}
            />
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '10px' : '12px', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexShrink: 0 }}>
              <Label>Executive Council</Label>
              <Badge>{`${eboardMembers.length} Seats`}</Badge>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr',
                gap: 6,
                overflow: 'auto',
                paddingRight: 2,
              }}
            >
              {eboardMembers.map((member) => (
                <div key={member.id} style={{ background: BG_EL, border: `1px solid ${BORDER2}`, borderRadius: 10, padding: isMobile ? '9px 10px' : '8px 10px' }}>
                  <div style={{ color: BLACK, fontSize: isMobile ? '0.9rem' : '0.74rem', fontWeight: 700, lineHeight: 1.2 }}>{member.name}</div>
                  <div style={{ color: SILVER_M, fontSize: isMobile ? '0.8rem' : '0.66rem', fontWeight: 600, marginTop: 2, lineHeight: 1.25 }}>{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <a
          href={EXEC_EBOARD_SLIDE_IMAGE_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: SILVER_L,
            fontSize: isMobile ? '0.8rem' : '0.68rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Open Executive Council Slide
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

// ─── Slide 5: Adoption of Minutes ─────────────────────────────────────────────

export function Slide5AdoptionOfMinutes({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 10, flexShrink: 0 }}>
        <Label>Adoption of Minutes</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.45rem' : 'clamp(1.3rem,2.8vw,1.95rem)', fontWeight: 700 }}>
          January 24, 2026 General Body Minutes
        </h1>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.35fr 0.65fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '10px' : '12px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <Label>Actual Minutes Document</Label>
            <a
              href={JANUARY_MINUTES_FILE_URL}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: SILVER_L, fontSize: isMobile ? '0.78rem' : '0.66rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Open PDF
              <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ flex: 1, minHeight: isMobile ? 280 : 320, borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: '#FFFFFF' }}>
            <iframe
              title="January 2026 Minutes PDF"
              src={`${JANUARY_MINUTES_FILE_URL}#toolbar=0&navpanes=0&scrollbar=1`}
              style={{ width: '100%', height: '100%', border: 'none', background: '#FFFFFF' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <Label>Minutes Record</Label>
            <h3 style={{ color: BLACK, margin: '6px 0 2px', fontSize: isMobile ? '1rem' : '0.86rem', fontWeight: 700 }}>
              January 24, 2026 General Body
            </h3>
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.82rem' : '0.66rem', lineHeight: 1.45 }}>
              Displaying the official minutes document for review before adoption.
            </p>
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <VoteWidget voteKey="minutes-adoption" label="Adoption of the Minutes" description={isMobile ? undefined : 'Motion to approve the January 24, 2026 General Body minutes'} />
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px', marginTop: 'auto' }}>
            <span style={{ color: SILVER_M, fontSize: isMobile ? '0.78rem' : '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Presenter note
            </span>
            <p style={{ color: '#555', margin: '6px 0 0', fontSize: isMobile ? '0.8rem' : '0.66rem', lineHeight: 1.45 }}>
              Scroll the embedded minutes as needed, then open the vote for adoption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 6: Treasurer's Report ─────────────────────────────────────────────

export function Slide6TreasurerReport({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0f172a', padding: isMobile ? 8 : 10, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: isMobile ? 12 : 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.22)' }}>
        <iframe
          title="Treasurer Report"
          srcDoc={TREASURER_REPORT_EMBED_HTML}
          sandbox="allow-scripts allow-same-origin"
          loading="eager"
          style={{ width: '100%', height: '100%', border: 'none', background: '#0f172a' }}
        />
      </div>
    </div>
  );
}

// ─── Slide 7: Committee Reports ──────────────────────────────────────────────

export function Slide7CommitteeReports({ isMobile = false }: { isMobile?: boolean }) {
  const committeeOrder = [
    { title: 'Service Committee', lead: 'Tina Jones', focus: 'Service hours, volunteer counts, and MLK reporting totals.' },
    { title: 'Fundraising Committee', lead: 'Dr. Azaria Cunningham', focus: 'Bowling Night recap and fundraising performance.' },
    { title: 'Scholarship Committee', lead: 'Dr. Aaliyah Davis', focus: 'Scholarship updates and upcoming review timeline.' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 10, flexShrink: 0 }}>
        <Label>Committee Reports</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.45rem' : 'clamp(1.3rem,2.8vw,1.95rem)', fontWeight: 700 }}>
          Report Order & Success Recap Flow
        </h1>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {committeeOrder.map((item, idx) => (
            <div key={item.title} style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge solid>{`0${idx + 1}`}</Badge>
                <div style={{ color: BLACK, fontSize: isMobile ? '0.98rem' : '0.84rem', fontWeight: 700 }}>{item.title}</div>
              </div>
              <div style={{ color: '#666', fontSize: isMobile ? '0.76rem' : '0.64rem', marginTop: 4 }}>Lead: {item.lead}</div>
              <p style={{ color: '#555', margin: '6px 0 0', fontSize: isMobile ? '0.84rem' : '0.67rem', lineHeight: 1.4 }}>{item.focus}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '10px' : '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <Label>Service Committee</Label>
              <span style={{ color: '#666', fontSize: isMobile ? '0.72rem' : '0.62rem', fontWeight: 700 }}>Tina Jones</span>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: '#FFFFFF' }}>
              <img
                src={SERVICE_COMMITTEE_REPORT_IMAGE_URL}
                alt="Service Committee report visual"
                style={{ width: '100%', height: isMobile ? 180 : 150, objectFit: 'contain', display: 'block', background: '#FFFFFF' }}
              />
            </div>
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <Label>Success Recap</Label>
            <h3 style={{ color: BLACK, margin: '6px 0 4px', fontSize: isMobile ? '1rem' : '0.86rem', fontWeight: 700 }}>
              Included Under Committee Reports
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {[
                'MLK Day of Service (Tina) — service totals / reporting',
                'January Bowling Night (Azaria) — fundraising recap',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: '#444', fontSize: isMobile ? '0.84rem' : '0.66rem', lineHeight: 1.4 }}>
                  <ChevronRight size={10} color={SILVER} style={{ flexShrink: 0, marginTop: 2 }} /> {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <Label>Next Slides</Label>
            <p style={{ color: '#555', margin: '6px 0 0', fontSize: isMobile ? '0.82rem' : '0.66rem', lineHeight: 1.45 }}>
              The deck proceeds into Unfinished Business (Signature Event) and then New Business (Financials, Compliance, and Committee Sign-Up).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 8/9 base content below ───────────────────────────────────────────

export function Slide9NewBusiness({ isMobile = false }: { isMobile?: boolean }) {
  const { committeeSignups, myCommitteeId, joinCommittee, memberName } = useMeeting();
  const totalMembers = Object.values(committeeSignups).reduce((sum, rows) => sum + rows.length, 0);

  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 10, flexShrink: 0 }}>
        <Label>Meeting Agenda</Label>
        <h1 style={{ color: BLACK, margin: '4px 0 0', fontSize: isMobile ? '1.85rem' : 'clamp(1.65rem,3.2vw,2.35rem)', fontWeight: 800, lineHeight: 1.05 }}>New Business</h1>
        <p style={{ color: '#4B5563', margin: '5px 0 0', fontSize: isMobile ? '0.88rem' : '0.78rem', fontWeight: 600 }}>
          Financials, Compliance & Committee Sign-Up
        </p>
        <SilverLine my={7} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(12px,2%,18px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 7, flexShrink: 0, overflow: 'auto' }}>
          <div style={{ background: BG_EL, border: `1px solid ${BORDER2}`, borderRadius: 8, padding: isMobile ? '10px 12px' : '9px 12px' }}>
            <div style={{ color: SILVER_L, fontSize: isMobile ? '0.88rem' : '0.72rem', fontWeight: 700 }}>Committee Sign-Up (Live)</div>
            <div style={{ color: '#666', fontSize: isMobile ? '0.76rem' : '0.62rem', marginTop: 2 }}>
              Join actions only. Committee descriptions were covered in Committee Reports.
            </div>
          </div>
          {committeeChairs.map((committee) => {
            const rows = committeeSignups[committee.id] || [];
            const isMine = myCommitteeId === committee.id;
            return (
              <div key={committee.id} style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 10, padding: isMobile ? '10px 12px' : '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ color: SILVER_L, fontSize: isMobile ? '0.95rem' : '0.8rem', fontWeight: 700 }}>{committee.title}</div>
                    <div style={{ color: '#666', fontSize: isMobile ? '0.74rem' : '0.62rem', marginTop: 2 }}>
                      {rows.length === 0 ? 'No members joined yet.' : `${rows.length} joined`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => joinCommittee(committee.id, memberName)}
                    style={{
                      background: isMine ? '#0F766E' : '#1F2937',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 999,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: isMobile ? '5px 10px' : '4px 9px',
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isMine ? 'Joined' : 'Join'}
                  </button>
                </div>
                <div style={{ marginTop: 6, color: '#6A6A6A', fontSize: isMobile ? '0.74rem' : '0.62rem', lineHeight: 1.35 }}>
                  {rows.length === 0 ? 'No members joined yet.' : `${rows.length} joined: ${rows.slice(-3).map((entry) => entry.memberName).join(', ')}`}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 8, minHeight: 0 }}>
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Label>Committee Sign-Up</Label>
              <Badge solid>{totalMembers} Joined</Badge>
            </div>
            <h3 style={{ color: BLACK, margin: '6px 0 4px', fontSize: isMobile ? '1.05rem' : '0.9rem', fontWeight: 700 }}>
              Committee Sign-Up Slate
            </h3>
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.8rem' : '0.66rem', lineHeight: 1.45 }}>
              Members can join a committee from their phones during New Business while the presenter monitors the live totals.
            </p>
            <div style={{ marginTop: 8 }}>
              <VoteWidget voteKey="committee-slate" label="Acknowledge Committee Sign-Up Slate" compact />
            </div>
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <div>
              <Label>Financials & Compliance</Label>
              <h3 style={{ color: BLACK, margin: '6px 0 4px', fontSize: isMobile ? '1.02rem' : '0.88rem', fontWeight: 700 }}>D9 in Trenton / March 1 Reporting</h3>
              <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.8rem' : '0.66rem', lineHeight: 1.45 }}>
                Review compliance/reporting needs, finalize delegate planning, and approve the $500 sponsorship fee when ready.
              </p>
            </div>
            <div style={{ marginTop: 8 }}>
              <VoteWidget voteKey="d9-sponsorship" label="$500 D9 Sponsorship Fee" compact />
            </div>
            <a
              href={D9_TRENTON_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
                color: SILVER_L,
                fontSize: isMobile ? '0.78rem' : '0.65rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Open D9 in Trenton Details
              <ExternalLink size={11} />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Slide 6: New Business ────────────────────────────────────────────────────

const signatureEventOptions = [
  {
    icon: Sun,
    label: 'Community Block Party',
    badge: 'Larger Scale',
    solid: false,
    desc: 'Higher visibility event with stronger community reach, more logistics, and broader chapter coordination requirements.',
    items: ['Higher attendance potential', 'More permits/logistics planning', 'Larger volunteer footprint'],
  },
  {
    icon: Package,
    label: 'Chapter BBQ',
    badge: 'Lower Lift',
    solid: false,
    desc: 'More contained event format with simpler operations and lower cost/risk while still driving fellowship and engagement.',
    items: ['Faster planning timeline', 'Lower upfront cost', 'Smaller operations team needed'],
  },
];

const signatureEventDiscussionPoints = [
  'Which option best fits current chapter capacity and volunteer availability?',
  'Which option gives the strongest community impact and council visibility?',
  'What budget range can we realistically support this cycle?',
  'What timeline is achievable for planning, permitting, and promotion?',
];

export function Slide8SignatureEvent({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>Unfinished Business</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>Signature Event</h1>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr 1fr', gap: isMobile ? 8 : 12, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        {signatureEventOptions.map(({ icon: Icon, label, badge, solid, desc, items }) => (
          <div key={label} style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(12px,2%,20px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 9, position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#B0B0B0,#606060,#B0B0B0)', borderRadius: '12px 12px 0 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
              <div style={{ width: isMobile ? 38 : 36, height: isMobile ? 38 : 36, borderRadius: 9, background: BG_EL, border: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={isMobile ? 17 : 16} color={SILVER_M} />
              </div>
              <div>
                <div style={{ color: BLACK, fontSize: isMobile ? '1.05rem' : 'clamp(0.84rem,1.5vw,1.05rem)', fontWeight: 700 }}>{label}</div>
                <Badge solid={solid}>{badge}</Badge>
              </div>
            </div>
            <p style={{ color: '#555', fontSize: isMobile ? '0.9rem' : 'clamp(0.68rem,1.15vw,0.88rem)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
            {items && items.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#444', fontSize: isMobile ? '0.88rem' : 'clamp(0.64rem,1.1vw,0.8rem)' }}>
                <ChevronRight size={10} color={SILVER} style={{ flexShrink: 0 }} /> {item}
              </div>
            ))}
          </div>
        ))}

        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(12px,2%,20px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 9, position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#B0B0B0,#606060,#B0B0B0)', borderRadius: '12px 12px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
            <div style={{ width: isMobile ? 38 : 36, height: isMobile ? 38 : 36, borderRadius: 9, background: BG_EL, border: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Cpu size={isMobile ? 17 : 16} color={SILVER_M} />
            </div>
            <div>
              <div style={{ color: BLACK, fontSize: isMobile ? '1.05rem' : 'clamp(0.84rem,1.5vw,1.05rem)', fontWeight: 700 }}>Discussion Frame</div>
              <Badge>High-Level</Badge>
            </div>
          </div>
          <p style={{ color: '#555', fontSize: isMobile ? '0.9rem' : 'clamp(0.68rem,1.15vw,0.88rem)', margin: 0, lineHeight: 1.5 }}>
            This section is for initial alignment on direction. Final budget, timeline, and operational details can be finalized after the preferred option is selected.
          </p>
          <div style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <ExternalLink size={12} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ color: SILVER_L, fontSize: isMobile ? '0.85rem' : 'clamp(0.64rem,1.1vw,0.8rem)', lineHeight: 1.4 }}>
              Use the Signature Event Comparison report in Council Command for the detailed analysis before a final decision.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {signatureEventDiscussionPoints.map((point) => (
              <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: '#444', fontSize: isMobile ? '0.88rem' : 'clamp(0.64rem,1.1vw,0.8rem)', lineHeight: 1.4 }}>
                <ChevronRight size={10} color={SILVER} style={{ flexShrink: 0, marginTop: 2 }} /> {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 7: MLK Day of Service ──────────────────────────────────────────────

export function Slide10SuccessRecap({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>Success Recap</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>MLK Day of Service</h1>
        <div style={{ color: '#666', marginTop: 4, fontSize: isMobile ? '0.85rem' : '0.75rem', fontWeight: 600 }}>Presenter: Tina Jones</div>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(14px,2.4%,24px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: isMobile ? 44 : 42, height: isMobile ? 44 : 42, borderRadius: 10, background: BG_EL, border: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Heart size={isMobile ? 20 : 19} color={SILVER_M} />
            </div>
            <div>
              <h3 style={{ color: BLACK, margin: 0, fontSize: isMobile ? '1.15rem' : 'clamp(0.92rem,1.6vw,1.15rem)', fontWeight: 700 }}>MLK Day of Service</h3>
              <Label>January 20, 2026</Label>
            </div>
          </div>
          <div style={{ background: BG_EL, border: `1px solid ${BORDER2}`, borderRadius: 8, padding: isMobile ? '11px 14px' : '11px 14px', textAlign: 'center' }}>
            <div style={{ color: SILVER, fontSize: isMobile ? '0.85rem' : 'clamp(0.72rem,1.2vw,0.88rem)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Participation Total</div>
            <div style={{ color: BLACK, fontSize: isMobile ? '1.15rem' : 'clamp(1rem,1.8vw,1.3rem)', fontWeight: 700, margin: '6px 0' }}>Pending Finalization</div>
            <Badge>Required for March 1st Report</Badge>
          </div>
          {/* Org outreach callout */}
          <div style={{ background: '#D4D4D4', border: `1px solid ${BORDER2}`, borderRadius: 8, padding: isMobile ? '11px 14px' : '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <AlertCircle size={13} color="#C62828" style={{ flexShrink: 0 }} />
              <span style={{ color: SILVER_L, fontSize: isMobile ? '0.92rem' : 'clamp(0.72rem,1.2vw,0.88rem)', fontWeight: 700 }}>Get Your Org's Totals Now</span>
            </div>
            <p style={{ color: '#3A3A3A', fontSize: isMobile ? '0.85rem' : 'clamp(0.62rem,1.05vw,0.78rem)', margin: 0, lineHeight: 1.5 }}>
              If you haven't already, reach out to your chapter or organization leadership to collect service hours and volunteer counts from MLK Day. We need these numbers for the March 1st annual report.
            </p>
          </div>
          {/* Budget submission callout */}
          <div style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: isMobile ? '11px 14px' : '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <DollarSign size={13} color="#059669" style={{ flexShrink: 0 }} />
              <span style={{ color: SILVER_L, fontSize: isMobile ? '0.92rem' : 'clamp(0.72rem,1.2vw,0.88rem)', fontWeight: 700 }}>Committee Chairs: Submit Budgets</span>
            </div>
            <p style={{ color: '#3A3A3A', fontSize: isMobile ? '0.85rem' : 'clamp(0.62rem,1.05vw,0.78rem)', margin: 0, lineHeight: 1.5 }}>
              All committee chairs must submit their proposed budgets for 2026 programming. Include projected costs, sponsorship needs, and revenue expectations.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10, minHeight: 0 }}>
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <Label>Reporting Action</Label>
            <h3 style={{ color: BLACK, margin: '6px 0 4px', fontSize: isMobile ? '1.02rem' : '0.88rem', fontWeight: 700 }}>
              Service Hours & Volunteer Totals Needed
            </h3>
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.82rem' : '0.68rem', lineHeight: 1.45 }}>
              Delegates should submit chapter volunteer counts and service hours to support the consolidated NPHC reporting totals.
            </p>
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <Label>Discussion Focus</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
              {[
                'Confirm each chapter submitted MLK volunteer counts',
                'Confirm service-hour totals and any missing entries',
                'Finalize combined total for March 1 report',
                'Assign follow-up for outstanding chapter responses',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: '#444', fontSize: isMobile ? '0.84rem' : '0.68rem', lineHeight: 1.4 }}>
                  <ChevronRight size={10} color={SILVER} style={{ flexShrink: 0, marginTop: 2 }} /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 8: Bowling Night Fundraiser ───────────────────────────────────────

export function Slide11BowlingRecap({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>Fundraising Committee Report</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>January Bowling Night Recap</h1>
        <div style={{ color: '#666', marginTop: 4, fontSize: isMobile ? '0.85rem' : '0.75rem', fontWeight: 600 }}>Presenter: Azaria Cunningham</div>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(14px,2.4%,24px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: isMobile ? 44 : 42, height: isMobile ? 44 : 42, borderRadius: 10, background: BG_EL, border: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={isMobile ? 20 : 19} color={SILVER_M} />
            </div>
            <div>
              <h3 style={{ color: BLACK, margin: 0, fontSize: isMobile ? '1.1rem' : 'clamp(0.9rem,1.6vw,1.12rem)', fontWeight: 700 }}>Fundraising Event Recap</h3>
              <Label>January 2026</Label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[{ label: 'Attendance', value: 'Record High' }, { label: 'Revenue', value: 'Record High' }].map(({ label, value }) => (
              <div key={label} style={{ background: BG_EL, border: `1px solid ${BORDER2}`, borderRadius: 8, padding: isMobile ? '11px' : '10px 12px', textAlign: 'center' }}>
                <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                <div style={{ color: BLACK, fontSize: isMobile ? '1rem' : 'clamp(0.84rem,1.5vw,1.05rem)', fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: isMobile ? '11px 14px' : '10px 14px' }}>
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.9rem' : 'clamp(0.68rem,1.15vw,0.88rem)', lineHeight: 1.55 }}>
              A landmark moment setting a new benchmark for future fundraising in 2026. This recap highlights the impact and visuals for reporting and member communications.
            </p>
          </div>

          <div style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: isMobile ? '11px 14px' : '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <DollarSign size={13} color="#059669" style={{ flexShrink: 0 }} />
              <span style={{ color: SILVER_L, fontSize: isMobile ? '0.9rem' : '0.76rem', fontWeight: 700 }}>Presenter Talking Points</span>
            </div>
            <p style={{ color: '#3A3A3A', fontSize: isMobile ? '0.84rem' : '0.68rem', margin: 0, lineHeight: 1.45 }}>
              Review event turnout, fundraising performance, lessons learned, and recommendations to apply to the upcoming Signature Event planning discussion.
            </p>
          </div>
        </div>

        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '10px' : '12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <Label>Bowling Event Images</Label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr', gap: 10, flex: 1, minHeight: 0, overflow: 'auto' }}>
            <img
              src={THANK_YOU_LETTER_IMAGE_URL}
              alt="Thank you letter and chapter image"
              style={{ width: '100%', height: isMobile ? 190 : 210, objectFit: 'contain', display: 'block', background: 'transparent' }}
            />
            <img
              src={FUNDRAISING_TOTAL_IMAGE_URL}
              alt="Fundraising event total screenshot"
              style={{ width: '100%', height: isMobile ? 190 : 210, objectFit: 'contain', display: 'block', background: 'transparent' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 9: Adjournment ─────────────────────────────────────────────────────

const nextSteps = [
  { icon: FileText, label: 'Finalize Annual Report Assignments', note: 'Due March 1st — 10 days' },
  { icon: Cpu,      label: 'Council Command Access Rollout',     note: 'All board members to receive credentials' },
  { icon: Star,     label: 'D9 in Trenton Delegation Planning',  note: 'April 9–11 — pending vote' },
];

export function Slide12Adjournment({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(100,100,100,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>Closing</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>Closing & Adjournment</h1>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr', gap: isMobile ? 10 : 16, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        {/* Left: next steps + vote summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ color: '#999', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 7 }}>Next Steps</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 6 }}>
              {nextSteps.map(({ icon: Icon, label, note }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: isMobile ? '11px 14px' : '9px 13px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: BG_EL, border: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={12} color={SILVER_M} />
                  </div>
                  <div>
                    <div style={{ color: SILVER_L, fontSize: isMobile ? '0.98rem' : 'clamp(0.76rem,1.35vw,0.98rem)', fontWeight: 600 }}>{label}</div>
                    <div style={{ color: '#999', fontSize: isMobile ? '0.82rem' : 'clamp(0.62rem,1.05vw,0.78rem)', marginTop: 2 }}>{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: isMobile ? undefined : 1, overflow: 'hidden', minHeight: 0 }}>
            <div style={{ color: '#999', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 7 }}>Vote Summary</div>
            <VoteSummary />
          </div>
        </div>

        {/* Right: adjournment card — hidden on mobile */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: BLACK, border: `1px solid #222`, borderRadius: 12, padding: 'clamp(14px,2.4%,24px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#606060,transparent)' }} />
            <div style={{ width: 'clamp(48px,9vw,72px)', height: 'clamp(48px,9vw,72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={LOGO_URL} alt="NPHC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#606060', fontSize: 'clamp(0.64rem,1.1vw,0.8rem)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5 }}>Meeting</div>
              <div style={{ color: '#FFFFFF', fontSize: 'clamp(1.35rem,2.5vw,1.85rem)', fontWeight: 800, letterSpacing: '-0.01em', background: 'linear-gradient(135deg,#D0D0D0,#FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Adjourned</div>
              <div style={{ color: '#606060', fontSize: 'clamp(0.62rem,1.05vw,0.78rem)', marginTop: 8 }}>NPHC of Hudson County</div>
              <div style={{ color: '#404040', fontSize: 'clamp(0.56rem,0.95vw,0.72rem)', marginTop: 2 }}>February 2026</div>
            </div>
            <div style={{ height: 1, width: '70%', background: '#333' }} />
            <p style={{ color: '#505050', fontSize: 'clamp(0.62rem,1.05vw,0.78rem)', textAlign: 'center', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
              "Elevating the Standard —<br />together we rise."
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
