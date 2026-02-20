import {
  Lightbulb, Eye, Settings, Link2, CheckCircle2, Clock,
  FileText, Cpu, Sun, Package, Trophy, Heart, ChevronRight, Star, AlertCircle,
  ExternalLink, ClipboardList, DollarSign, Users, Camera
} from 'lucide-react';
import { useState } from 'react';
import { VoteWidget, VoteSummary } from './VoteWidget';

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

export function Slide1Cover({ isMobile = false }: { isMobile?: boolean }) {
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
          February 2026
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
  { num: '08', title: "Treasury's Report", tags: [{ text: 'Report' }] },
  { num: '09', title: '2026 Budget', tags: [{ text: 'Vote', solid: true }] },
  { num: '10', title: 'Financials & Compliance', sub: 'D9 in Trenton & March 1st Report', tags: [{ text: 'Sign-Up', color: '#059669' }] },
  { num: '11', title: 'New Business', sub: 'Council Command & Summer Planning', tags: [{ text: 'Launch', color: '#2563EB' }, { text: 'Review' }] },
  { num: '12', title: 'Success Recap', sub: 'Bowling Night & MLK Service', tags: [{ text: 'Action' }, { text: 'Budgets', color: '#059669' }] },
  { num: '13', title: 'Adjournment' },
];

export function Slide2Agenda({ isMobile = false }: { isMobile?: boolean }) {
  const [meetingStarted, setMeetingStarted] = useState(false);

  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', overflow: 'hidden' }}>
      {!isMobile && <div style={{ width: 3, background: 'linear-gradient(180deg,transparent,#808080,#404040,#808080,transparent)', flexShrink: 0 }} />}
      <div style={{ flex: 1, padding: isMobile ? '16px 16px 12px' : 'clamp(16px,3.5%,40px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ marginBottom: isMobile ? 12 : 14, flexShrink: 0 }}>
          <Label>February 2026</Label>
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
  { icon: Settings,  name: 'Optimization', color: '#059669', desc: 'Leveraging chapter resources to maximize efficiency.', items: ['Chapter resource mapping', 'Member talent utilization', 'Programming cost analysis'] },
  { icon: Link2,     name: 'Alignment',    color: '#7C3AED', desc: 'Transparency and coordination across all D9 organizations.', items: ['D9 Trenton delegation', 'Annual Council reporting', 'Board ratification'] },
];

export function Slide3Vision({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(16px,3.5%,38px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 10, flexShrink: 0 }}>
        <Label>Presidential Address</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.7rem' : 'clamp(1.6rem,3.2vw,2.4rem)', fontWeight: 700 }}>
          2026 Vision: <span style={{ color: SILVER_M, fontWeight: 300 }}>Elevating the Standard</span>
        </h1>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: isMobile ? undefined : '1fr 1fr', gap: isMobile ? 8 : 10, flex: 1, overflow: isMobile ? 'auto' : 'hidden' }}>
        {pillars.map(({ icon: Icon, name, color, desc, items }, i) => (
          <div key={name} style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: isMobile ? '12px' : 'clamp(12px,2.2%,20px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 7, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '60%', background: `linear-gradient(180deg,${color}CC,transparent)`, borderRadius: '10px 0 0 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 6 }}>
              <div style={{ width: isMobile ? 28 : 30, height: isMobile ? 28 : 30, borderRadius: 7, background: `${color}14`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={isMobile ? 13 : 14} color={color} />
              </div>
              <span style={{ color: BLACK, fontSize: isMobile ? '1.1rem' : 'clamp(0.95rem,1.7vw,1.2rem)', fontWeight: 700 }}>{name}</span>
              {!isMobile && <span style={{ color: '#909090', fontSize: '0.68rem', marginLeft: 'auto' }}>0{i + 1}</span>}
            </div>
            <p style={{ color: '#444', fontSize: isMobile ? '0.92rem' : 'clamp(0.72rem,1.25vw,0.95rem)', margin: '0 0 0 6px', lineHeight: 1.45 }}>{desc}</p>
            {(!isMobile || items.length <= 2) && (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: isMobile ? 3 : 4, paddingLeft: 6 }}>
                {(isMobile ? items.slice(0, 2) : items).map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#333', fontSize: isMobile ? '0.88rem' : 'clamp(0.68rem,1.15vw,0.88rem)' }}>
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

// ─── Slide 4: Board Ratification ──────────────────────────────────────────────

const candidates = [
  { img: CANDIDATE_1, name: 'Treasurer Candidate', role: 'Treasurer',          voteKey: 'treasurer' },
  { img: CANDIDATE_3, name: 'Chris Gadsden',        role: 'Financial Secretary', voteKey: 'financial-secretary' },
  { img: CANDIDATE_2, name: 'Ayesha Noel-Smith',   role: 'Parliamentarian',     voteKey: 'parliamentarian' },
];

const confirmedRoles = [
  { role: 'Service Chair',     desc: 'Community service coordination' },
  { role: 'Scholarship Chair', desc: 'Academic award administration' },
  { role: 'Fundraising Chair', desc: 'Revenue generation & events' },
];

export function Slide4Ratification({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(12px,2.6%,32px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 10 : 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Label>Action Item</Label>
          <Badge solid>Vote Required</Badge>
        </div>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.45rem' : 'clamp(1.2rem,2.6vw,1.85rem)', fontWeight: 700 }}>Board Ratification & Appointments</h1>
        <SilverLine />
      </div>

      {/* Candidates label */}
      <div style={{ color: SILVER, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: isMobile ? 8 : 6, flexShrink: 0 }}>
        Candidates — Vote to Ratify
      </div>

      {/* Candidate cards — vertical layout with vote underneath each */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 12, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'visible' }}>
        {candidates.map(({ img, name, role, voteKey }) => (
          <div key={voteKey} style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(12px,2%,18px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10, position: 'relative', overflow: 'visible' }}>
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#808080,transparent)', borderRadius: '12px 12px 0 0' }} />

            {/* Photo + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 12, paddingTop: 4 }}>
              <div style={{ width: isMobile ? 56 : 'clamp(48px,7vw,64px)', height: isMobile ? 56 : 'clamp(48px,7vw,64px)', borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: `1px solid ${BORDER2}`, background: BG_EL }}>
                <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: BLACK, fontSize: isMobile ? '1.05rem' : 'clamp(0.84rem,1.5vw,1.05rem)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                <div style={{ color: SILVER, fontSize: isMobile ? '0.82rem' : 'clamp(0.68rem,1.15vw,0.82rem)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{role}</div>
              </div>
            </div>

            {/* Vote widget underneath */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <VoteWidget voteKey={voteKey} label={role} compact />
            </div>
          </div>
        ))}
      </div>

      {/* Confirmed & Pending strip — desktop only */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '7px 14px' }}>
            <CheckCircle2 size={12} color={SILVER_M} style={{ flexShrink: 0 }} />
            <span style={{ color: SILVER, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>Confirmed</span>
            <div style={{ width: 1, height: 16, background: BORDER, flexShrink: 0 }} />
            {confirmedRoles.map(({ role }) => (
              <span key={role} style={{ color: SILVER_L, fontSize: 'clamp(0.64rem,1.1vw,0.8rem)', fontWeight: 600, whiteSpace: 'nowrap' }}>{role}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '7px 14px' }}>
            <Clock size={12} color={SILVER} style={{ flexShrink: 0 }} />
            <span style={{ color: SILVER, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>Pending</span>
            <div style={{ width: 1, height: 16, background: BORDER, flexShrink: 0 }} />
            <span style={{ color: SILVER_L, fontSize: 'clamp(0.64rem,1.1vw,0.8rem)', fontWeight: 600 }}>Historian</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Slide 5: Financials ──────────────────────────────────────────────────────

const march1Items = [
  { icon: Users,         label: 'Roster Verification',     note: 'Confirm all member names, active/inactive statuses, and contact information are current in the system. Each chapter president should verify their chapter roster.' },
  { icon: ClipboardList, label: 'Officer Profiles',         note: 'Submit updated officer bios, headshots, and contact details for the annual directory. Ensure all newly elected or appointed officers are reflected.' },
  { icon: DollarSign,    label: 'Financial Accountability', note: 'Reconcile all income, expenses, dues collected, and outstanding balances for the fiscal year. Treasurers must provide a full ledger summary.' },
  { icon: Heart,         label: 'Service Logs',             note: 'Compile volunteer hours, event attendance, and community impact data. MLK Day of Service totals are required — reach out to your org if you haven\'t already.' },
  { icon: Camera,        label: 'Event Documentation',      note: 'Upload photos, flyers, and media from all council events for the annual report archive and D9 submission package.' },
];

export function Slide5Financials({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 10, flexShrink: 0 }}>
        <Label>Finance & Compliance</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>Financials & Compliance</h1>
        <SilverLine my={8} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        {/* D9 */}
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(14px,2.4%,24px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#808080,transparent)', borderRadius: '12px 12px 0 0' }} />
          <div>
            <Label>D9 in Trenton</Label>
            <h3 style={{ color: BLACK, margin: '6px 0 4px', fontSize: isMobile ? '1.2rem' : 'clamp(0.95rem,1.7vw,1.25rem)', fontWeight: 700 }}>April 9–11, 2026</h3>
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.95rem' : 'clamp(0.68rem,1.15vw,0.88rem)', lineHeight: 1.5 }}>
              Statewide Advocacy & Civic Engagement Summit. Engage directly with NJ legislators.
            </p>
          </div>
          <VoteWidget voteKey="d9-sponsorship" label="$500 D9 Sponsorship Fee" description={isMobile ? undefined : 'Approve funding for NPHC delegation to the Trenton summit'} />
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {['Civic advocacy at the state level', 'NPHC delegation representation', 'Legislative networking'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#555', fontSize: 'clamp(0.64rem,1.1vw,0.82rem)' }}>
                  <ChevronRight size={10} color={SILVER} style={{ flexShrink: 0 }} /> {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* March 1 — Annual Report Sign-Up */}
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(12px,2%,18px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 7, flexShrink: 0, overflow: 'auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Label>Annual Report</Label>
              <Badge solid>Sign Up</Badge>
            </div>
            <h3 style={{ color: BLACK, margin: '5px 0 3px', fontSize: isMobile ? '1.2rem' : 'clamp(0.95rem,1.7vw,1.25rem)', fontWeight: 700 }}>
              March 1st — <span style={{ color: '#C62828', fontWeight: 800 }}>10 Days</span>
            </h3>
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.88rem' : 'clamp(0.64rem,1.1vw,0.8rem)', lineHeight: 1.4 }}>
              Each board member must claim and complete a section. Sign up now — no section should go unassigned.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 5 }}>
            {march1Items.map(({ icon: Icon, label, note }) => (
              <div key={label} style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: isMobile ? '10px 12px' : '7px 11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 5, background: '#D4D4D4', border: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={11} color={SILVER_M} />
                  </div>
                  <div style={{ color: SILVER_L, fontSize: isMobile ? '0.92rem' : 'clamp(0.72rem,1.2vw,0.88rem)', fontWeight: 700 }}>{label}</div>
                </div>
                <div style={{ color: '#555', fontSize: isMobile ? '0.82rem' : 'clamp(0.58rem,0.95vw,0.72rem)', lineHeight: 1.45, paddingLeft: 32 }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 6: New Business ────────────────────────────────────────────────────

const bizItems = [
  { icon: Cpu,     label: 'Council Command',    badge: 'Launch',      solid: true,  desc: 'An AI-powered digital platform to automate administrative tasks — the backbone of our Innovation pillar.', items: ['AI-assisted workflows', 'Member access rollout', 'Community-facing features'] },
  { icon: Sun,     label: 'Summer Programming', badge: 'Review',     solid: false, desc: 'Block Party vs. Chapter BBQ — a full comparative analysis is available on the Council Command site. Review the data and come prepared to discuss.', siteNote: 'Vote on Council Command — review the analysis before the next meeting.' },
  { icon: Package, label: 'Spring Cereal Drive', badge: 'Late May/June', solid: false, desc: 'Digital-first cereal drive powered by Council Command with full tracking.', items: ['Digital donation tracking', 'Council Command integration', 'Community impact metrics'] },
];

export function Slide6NewBusiness({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>New Business</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>Innovation & Programming</h1>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 8 : 12, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        {bizItems.map(({ icon: Icon, label, badge, solid, desc, items, siteNote }) => (
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
            {siteNote && (
              <div style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <ExternalLink size={12} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ color: SILVER_L, fontSize: isMobile ? '0.85rem' : 'clamp(0.64rem,1.1vw,0.8rem)', lineHeight: 1.4 }}>{siteNote}</div>
              </div>
            )}
            {items && items.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#444', fontSize: isMobile ? '0.88rem' : 'clamp(0.64rem,1.1vw,0.8rem)' }}>
                <ChevronRight size={10} color={SILVER} style={{ flexShrink: 0 }} /> {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 7: Success Recap ───────────────────────────────────────────────────

export function Slide7SuccessRecap({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>Wins & Momentum</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>Success Recap & Metrics</h1>
        <SilverLine />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        {/* Bowling Night */}
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(14px,2.4%,24px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: isMobile ? 44 : 42, height: isMobile ? 44 : 42, borderRadius: 10, background: BG_EL, border: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={isMobile ? 20 : 19} color={SILVER_M} />
            </div>
            <div>
              <h3 style={{ color: BLACK, margin: 0, fontSize: isMobile ? '1.15rem' : 'clamp(0.92rem,1.6vw,1.15rem)', fontWeight: 700 }}>January Bowling Night</h3>
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
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.95rem' : 'clamp(0.68rem,1.15vw,0.88rem)', lineHeight: 1.55 }}>
              A landmark moment setting a new benchmark for future fundraising in 2026.
            </p>
          </div>
        </div>

        {/* MLK Day */}
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(14px,2.4%,24px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 10, flexShrink: 0 }}>
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
      </div>
    </div>
  );
}

// ─── Slide 8: Adjournment ─────────────────────────────────────────────────────

const nextSteps = [
  { icon: FileText, label: 'Finalize Annual Report Assignments', note: 'Due March 1st — 10 days' },
  { icon: Cpu,      label: 'Council Command Access Rollout',     note: 'All board members to receive credentials' },
  { icon: Star,     label: 'D9 in Trenton Delegation Planning',  note: 'April 9–11 — pending vote' },
];

export function Slide8Adjournment({ isMobile = false }: { isMobile?: boolean }) {
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
