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
const EXEC_EBOARD_VIDEO_URL = 'https://pub-e0d3ae4075164c7aa7204024db626148.r2.dev/NPHC%20Executive%20Council.mp4';

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
  { num: '08', title: "Treasury's Report", tags: [{ text: 'Report' }] },
  { num: '09', title: '2026 Budget', tags: [{ text: 'Vote', solid: true }] },
  { num: '10', title: 'Financials & Compliance', sub: 'D9 in Trenton & March 1st Report', tags: [{ text: 'Sign-Up', color: '#059669' }] },
  { num: '11', title: 'Signature Event', sub: 'BBQ vs Block Party (high-level discussion)', tags: [{ text: 'Review' }, { text: 'Discuss', color: '#2563EB' }] },
  { num: '12', title: 'Success Recap', sub: 'MLK Day (Tina) & Bowling Night (Azaria)', tags: [{ text: 'Action' }, { text: 'Budgets', color: '#059669' }] },
  { num: '13', title: 'Adjournment' },
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
  { id: 'program-committee', title: 'Program Committee', chair: 'Kimberly Conway', chapter: 'Alpha Kappa Alpha Sorority, Inc.', focus: 'Event design, calendars, and chapter coordination.' },
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
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '10px' : '12px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <video
            key={EXEC_EBOARD_VIDEO_URL}
            src={EXEC_EBOARD_VIDEO_URL}
            controls
            autoPlay
            muted
            playsInline
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
        <a
          href={EXEC_EBOARD_VIDEO_URL}
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
          Open Executive Council Video
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

// ─── Slide 5: Committee Chairs & Sign-Up ─────────────────────────────────────

export function Slide5Financials({ isMobile = false }: { isMobile?: boolean }) {
  const { committeeSignups, myCommitteeId, joinCommittee, memberName } = useMeeting();
  const totalMembers = Object.values(committeeSignups).reduce((sum, rows) => sum + rows.length, 0);

  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 10, flexShrink: 0 }}>
        <Label>Participation</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>Committee Chairs & Sign-Up</h1>
        <SilverLine my={8} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 14, flex: 1, minHeight: 0, overflow: isMobile ? 'auto' : 'hidden' }}>
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '14px' : 'clamp(12px,2%,18px)', display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 7, flexShrink: 0, overflow: 'auto' }}>
          {committeeChairs.map((committee) => {
            const rows = committeeSignups[committee.id] || [];
            const isMine = myCommitteeId === committee.id;
            return (
              <div key={committee.id} style={{ background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 10, padding: isMobile ? '10px 12px' : '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ color: SILVER_L, fontSize: isMobile ? '0.95rem' : '0.8rem', fontWeight: 700 }}>{committee.title}</div>
                    <div style={{ color: '#666', fontSize: isMobile ? '0.76rem' : '0.64rem', marginTop: 2 }}>Chair: {committee.chair}</div>
                    <div style={{ color: '#7A7A7A', fontSize: isMobile ? '0.74rem' : '0.62rem', marginTop: 1 }}>{committee.chapter}</div>
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
                <p style={{ color: '#555', fontSize: isMobile ? '0.8rem' : '0.66rem', margin: '6px 0 0', lineHeight: 1.4 }}>
                  {committee.focus}
                </p>
                <div style={{ marginTop: 7, color: '#6A6A6A', fontSize: isMobile ? '0.74rem' : '0.62rem' }}>
                  {rows.length === 0 ? 'No members joined yet.' : `${rows.length} joined: ${rows.slice(-3).map((entry) => entry.memberName).join(', ')}`}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 8, minHeight: 0 }}>
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Label>Live Participation</Label>
              <Badge solid>{totalMembers} Joined</Badge>
            </div>
            <h3 style={{ color: BLACK, margin: '6px 0 4px', fontSize: isMobile ? '1.05rem' : '0.9rem', fontWeight: 700 }}>
              Committee Participation Slate
            </h3>
            <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.8rem' : '0.66rem', lineHeight: 1.45 }}>
              Members can raise hands, cast votes, and join committees live from their phones.
            </p>
            <div style={{ marginTop: 8 }}>
              <VoteWidget voteKey="committee-slate" label="Acknowledge Committee Sign-Up Slate" compact />
            </div>
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '12px' : '12px 14px' }}>
            <div>
              <Label>D9 in Trenton</Label>
              <h3 style={{ color: BLACK, margin: '6px 0 4px', fontSize: isMobile ? '1.02rem' : '0.88rem', fontWeight: 700 }}>April 9–11, 2026</h3>
              <p style={{ color: '#555', margin: 0, fontSize: isMobile ? '0.8rem' : '0.66rem', lineHeight: 1.45 }}>
                Statewide Advocacy & Civic Engagement Summit. Approve the $500 sponsorship fee and finalize delegates.
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

export function Slide6NewBusiness({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG_ALT, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>Summer Programming</Label>
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

export function Slide7SuccessRecap({ isMobile = false }: { isMobile?: boolean }) {
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

export function Slide8BowlingRecap({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', background: BG, display: 'flex', flexDirection: 'column', padding: isMobile ? '16px' : 'clamp(14px,3%,36px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 12 : 12, flexShrink: 0 }}>
        <Label>Success Recap</Label>
        <h1 style={{ color: BLACK, margin: '5px 0 0', fontSize: isMobile ? '1.5rem' : 'clamp(1.35rem,2.8vw,2rem)', fontWeight: 700 }}>January Bowling Night</h1>
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
          <Label>Event Images (Full View)</Label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr', gap: 10, flex: 1, minHeight: 0, overflow: 'auto' }}>
            <a
              href={THANK_YOU_LETTER_IMAGE_URL}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}`, background: '#FFFFFF', padding: 8, minHeight: isMobile ? 180 : 200 }}
            >
              <img
                src={THANK_YOU_LETTER_IMAGE_URL}
                alt="Thank you letter and chapter image"
                style={{ width: '100%', height: isMobile ? 180 : 200, objectFit: 'contain', background: '#FFFFFF' }}
              />
            </a>
            <a
              href={FUNDRAISING_TOTAL_IMAGE_URL}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}`, background: '#FFFFFF', padding: 8, minHeight: isMobile ? 180 : 200 }}
            >
              <img
                src={FUNDRAISING_TOTAL_IMAGE_URL}
                alt="Fundraising event total screenshot"
                style={{ width: '100%', height: isMobile ? 180 : 200, objectFit: 'contain', background: '#FFFFFF' }}
              />
            </a>
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

export function Slide9Adjournment({ isMobile = false }: { isMobile?: boolean }) {
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
