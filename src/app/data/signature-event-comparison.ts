export type ReportLink = { label: string; href: string };

export type ReportMeta = {
  title: string;
  subtitle: string;
  dateLabel: string;
  treasuryLabel: string;
  mission: string;
  links: ReportLink[];
};

export type EventId = "unity_bbq" | "block_party";

export type QualScoreLabel =
  | "Very High"
  | "High"
  | "Moderate-High"
  | "Moderate"
  | "Low-Moderate"
  | "Low"
  | "Minimal";

export type CriterionBlock = {
  scoreLabel: string;
  score: number; // 0-5 (for charts)
  summary: string;
  strengths?: string[];
  limitations?: string[];
  notes?: string[];
};

export type Criterion = {
  id: string;
  label: string;
  unity: CriterionBlock;
  block: CriterionBlock;
};

export type BudgetRange = { min: number; max: number };

export const LOGO_URL =
  "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20of%20HC%20LOGO%20Black.PNG";

export const reportMeta: ReportMeta = {
  title: "Signature Event Comparison",
  subtitle: "Unity BBQ vs Neighborhood Block Party (Back-to-School)",
  dateLabel: "January 29, 2026",
  treasuryLabel: "$7,842.64",
  mission:
    "Provide an objective, data-driven comparison of two proposed signature event concepts and deliver strategic recommendations to support informed decision-making by the full chapter body.",
  links: [
    { label: "Open PDF Report", href: "/docs/event-comparison-report-nphc-2026.pdf" },
  ],
};

export const keyFindings: string[] = [
  'Documented "ticket fatigue" with declining attendance at paid events and member calls for more accessible programming.',
  "Leadership capacity is stretched, with multiple vacant positions and reliance on a small core group of active members.",
  "Hudson County density (700,000+ residents) presents significant untapped community engagement opportunities.",
  "Current civic engagement footprint is minimal (14 voter registrations) relative to county population.",
  "Both concepts align with different strategic imperatives: internal capacity-building vs external visibility and service.",
  "Neither event requires ticket sales, addressing member concerns about event saturation.",
];

export const chapterAssessmentContext = {
  title: "Strategic Context from Chapter Assessment (2024-2025)",
  strengthsToLeverage: [
    "Exceptional financial management and transparency.",
    "Proven success with bulk donation drives (1,444 cans of soup; 1,524 pairs of socks; 688 cereal boxes).",
    "Strong operational infrastructure through Google Workspace implementation.",
  ],
  challengesToAddress: [
    "Leadership vacancies and participation gaps across member organizations.",
    'Event saturation and "ticket fatigue" reducing engagement.',
    "Limited civic engagement and community visibility relative to county size.",
    "Technical bottlenecks hindering promotional capacity.",
    "Reliance on a small core group of active members.",
  ],
  assessmentConclusionQuote:
    'The chapter is an operational and financial leader among local councils, but its long-term health depends on diversifying its leadership base and moving away from a saturation of ticketed events toward more accessible, high-engagement community programs.',
};

export const evaluationFramework: string[] = [
  "Community Impact and Visibility",
  "Alignment with National NPHC Programs",
  "Feasibility, Scale, and Sustainability",
  "Partnership and Sponsorship Opportunities",
  "Member Engagement and Participation",
  "Inter-Organizational Unity and Collaboration",
  "Long-Term Value and Signature Event Potential",
  "Capacity Requirements and Resource Allocation",
  "Strategic Fit with Current Chapter Priorities",
];

export const concepts = {
  unity: {
    name: "Divine Nine Unity BBQ",
    oneLine:
      "Fellowship-centered gathering to build trust, strengthen working relationships, support reclamation/re-engagement, and establish foundations for future joint programming.",
    targetAudience: [
      "Active NPHC chapter members across all Divine Nine organizations.",
      "Inactive and reclaiming members seeking re-engagement.",
      "New members building fraternal networks.",
      "Prospective interest groups and chapter leadership.",
    ],
    primaryObjectives: [
      "Build trust and strengthen working relationships across organizations.",
      "Create informal networking opportunities for members at all engagement levels.",
      "Support member reclamation efforts through a welcoming, low-pressure environment.",
      "Establish a foundation for future joint programming and service initiatives.",
      "Foster intergenerational connections within and across organizations.",
      "Demonstrate collective strength of Divine Nine presence in Hudson County.",
    ],
  },
  block: {
    name: "Neighborhood Block Party (Back-to-School)",
    oneLine:
      "Community-facing Back-to-School initiative providing school supplies/backpacks with family engagement, education, and high-visibility public relationship-building.",
    targetAudience: [
      "Families with school-age children in Hudson County.",
      "Jersey City residents in targeted neighborhood.",
      "Local businesses and community partners.",
      "Civic leaders and elected officials.",
      "General public interested in family-friendly community events.",
    ],
    primaryObjectives: [
      "Provide tangible educational support through school supply distribution.",
      "Increase chapter visibility and recognition in Hudson County.",
      "Establish signature community service presence.",
      "Build relationships with residents, businesses, and civic stakeholders.",
      "Support educational advancement through practical resource provision.",
      "Create recurring annual event that defines the chapter's community identity.",
      "Generate positive media coverage and public awareness.",
    ],
  },
};

const q = (label: QualScoreLabel): number => {
  // Very High=5, High=4, Moderate-High=3.5, Moderate=3, Low-Moderate=2.5, Low=2, Minimal=1
  if (label === "Very High") return 5;
  if (label === "High") return 4;
  if (label === "Moderate-High") return 3.5;
  if (label === "Moderate") return 3;
  if (label === "Low-Moderate") return 2.5;
  if (label === "Low") return 2;
  return 1;
};

export const criteria: Criterion[] = [
  {
    id: "community-impact",
    label: "Community Impact & Visibility",
    unity: {
      scoreLabel: "Moderate (Internal Focus)",
      score: q("Moderate"),
      summary:
        "Prioritizes internal community (Divine Nine members) over external visibility. Builds capacity, but direct public impact is limited.",
      strengths: [
        "Strengthens organizational capacity to deliver future community programming.",
        "Builds collaborative relationships that enhance joint service delivery.",
        "Creates unified Divine Nine presence that can increase collective visibility.",
      ],
      limitations: ["Minimal direct service to Hudson County residents."],
    },
    block: {
      scoreLabel: "Very High (External Focus)",
      score: q("Very High"),
      summary:
        "Direct community-facing service creates high visibility, measurable benefit, and stronger public recognition for the council.",
      strengths: [
        "Public-facing, family-centered programming with immediate tangible benefits.",
        "Strong potential for media coverage and partner amplification.",
        "Builds civic and stakeholder relationships through service.",
      ],
    },
  },
  {
    id: "nphc-alignment",
    label: "Alignment with National NPHC Programs",
    unity: {
      scoreLabel: "Moderate (Indirect)",
      score: q("Moderate"),
      summary:
        "Supports leadership development and cultural preservation; community service alignment is indirect (capacity-building for later programming).",
      notes: [
        "Community Service: Indirect (builds capacity for future service coordination).",
        "Educational Advancement: Minimal (no direct educational programming).",
        "Civic Engagement: Minimal (internal focus limits activation).",
        "Cultural Preservation: Moderate (strengthens traditions and unity).",
        "Leadership Development: Strong (networking and intergenerational mentorship).",
      ],
    },
    block: {
      scoreLabel: "Very High (Direct)",
      score: q("Very High"),
      summary:
        "Demonstrates strong alignment with community service and educational advancement pillars through direct resource provision.",
      notes: [
        "Community Service: Very Strong (direct service to families).",
        "Educational Advancement: Very Strong (removes barriers and supports student success via supplies).",
        "Civic Engagement: Strong (public presence, stakeholder engagement, visibility).",
        "Cultural Preservation: Moderate (positive community representation).",
        "Leadership Development: Strong (committee leadership and execution roles).",
      ],
    },
  },
  {
    id: "feasibility",
    label: "Feasibility, Scale, & Sustainability",
    unity: {
      scoreLabel: "High",
      score: q("High"),
      summary:
        "Lower logistical complexity with manageable lead time; suitable for current capacity constraints.",
      notes: ["Lead time: 2-3 months.", "Planning team: 4-6 volunteers.", "Day-of volunteers: 10-15."],
    },
    block: {
      scoreLabel: "Moderate-High",
      score: q("Moderate-High"),
      summary:
        "More complex but feasible with early planning and partnerships; inaugural execution requires longer lead time.",
      notes: [
        "Lead time (first year): 4-6 months; subsequent years 3-4 months.",
        "Logistical requirements: street closure permits; liability insurance; vendor coordination; public safety (police/first aid); weather contingency; waste management/clean-up.",
        "Recommendation: start with moderate scale (200-300) and grow over time.",
      ],
    },
  },
  {
    id: "partnerships",
    label: "Partnership & Sponsorship Opportunities",
    unity: {
      scoreLabel: "Low-Moderate",
      score: q("Low-Moderate"),
      summary:
        "Partnerships exist within the fraternal ecosystem; corporate sponsorship appeal is limited due to internal audience.",
      strengths: [
        "Regional NPHC councils, alumni and graduate chapters.",
        "Black-owned businesses for catering/entertainment.",
        "Fraternity/sorority foundation grants for leadership development.",
      ],
      limitations: ["Less attractive to corporate sponsors seeking public visibility and impact metrics."],
    },
    block: {
      scoreLabel: "Very High",
      score: q("Very High"),
      summary:
        "Exceptional sponsorship and partnership potential due to high-visibility community impact and family engagement.",
      strengths: [
        "Office supply retailers for in-kind donations.",
        "Local banks/credit unions, healthcare providers, insurers, tech companies.",
        "Jersey City Public Schools, Recreation Department, libraries, public safety agencies.",
        "Builds long-term partner relationships for future programming and grant applications.",
      ],
    },
  },
  {
    id: "member-engagement",
    label: "Member Engagement & Participation",
    unity: {
      scoreLabel: "High",
      score: q("High"),
      summary:
        'Directly addresses "ticket fatigue" through free/low-cost attendance and a low-pressure social environment appealing to inactive members.',
    },
    block: {
      scoreLabel: "High",
      score: q("High"),
      summary:
        "Meaningful community service roles, visible impact, and family-friendly participation can motivate broader engagement beyond the core group.",
      notes: ["Estimated day-of volunteers needed: 25-40."],
    },
  },
  {
    id: "unity",
    label: "Inter-Organizational Unity & Collaboration",
    unity: {
      scoreLabel: "Very High",
      score: q("Very High"),
      summary:
        "Primary strength: creates intentional space for cross-organizational relationships, breaking down silos and building trust for future collaboration.",
    },
    block: {
      scoreLabel: "High",
      score: q("High"),
      summary:
        "Unity built through shared service execution and shared achievement; collaboration through action rather than purely social interaction.",
    },
  },
  {
    id: "signature-potential",
    label: "Long-Term Value / Signature Potential",
    unity: {
      scoreLabel: "Moderate",
      score: q("Moderate"),
      summary:
        "Can become a valued recurring fellowship program, but is less defining as the primary signature initiative for public identity-building.",
    },
    block: {
      scoreLabel: "Very High",
      score: q("Very High"),
      summary:
        "High potential as a defining annual signature event that builds community anticipation, media coverage, and recognizable council identity.",
    },
  },
  {
    id: "capacity",
    label: "Capacity Requirements",
    unity: {
      scoreLabel: "Lower (Favorable)",
      score: q("High"),
      summary:
        "Scope and staffing are well-aligned to current capacity constraints and reduces risk of volunteer burnout.",
    },
    block: {
      scoreLabel: "Higher (Complex, Higher Return)",
      score: q("Moderate"),
      summary:
        "Requires multi-subcommittee structure and larger day-of staffing; increased complexity but proportionally higher strategic return.",
      notes: [
        "Planning committee: 8-12 volunteers across organizations.",
        "Subcommittees: logistics, partnerships, marketing, volunteer coordination, supplies.",
      ],
    },
  },
  {
    id: "strategic-fit",
    label: "Strategic Fit with Current Priorities",
    unity: {
      scoreLabel: "Moderate",
      score: q("Moderate"),
      summary:
        "Addresses internal engagement and collaboration needs; best as complementary programming while signature initiatives build external presence.",
    },
    block: {
      scoreLabel: "Very High",
      score: q("Very High"),
      summary:
        "Directly addresses assessment priorities: accessible programming, community visibility, leverage county density, leadership development opportunities, and national pillar alignment.",
      notes: [
        "Presidential initiative: reflects executive leadership vision for strategic direction and community positioning.",
        'Public positioning: for a "relatively new" chapter, a high-profile community event accelerates recognition and organizational legitimacy.',
      ],
    },
  },
];

export const keyDifferentiators = {
  unityBBQAdvantages: [
    "Lower complexity and resource requirements.",
    "Direct focus on inter-organizational relationship-building.",
    "Immediate feasibility with current capacity constraints.",
    "Lower risk profile for inaugural execution.",
    "Strong appeal to member preferences for social programming.",
  ],
  blockPartyAdvantages: [
    "Substantial direct community service and impact.",
    "Exceptional public visibility and brand building.",
    "Strong alignment with NPHC national priorities.",
    "High partnership and sponsorship potential.",
    "Signature event potential defining chapter identity.",
  ],
};

export const budgetRanges: Record<EventId, BudgetRange> = {
  unity_bbq: { min: 2100, max: 4100 },
  block_party: { min: 5000, max: 10000 },
};

export const blockPartyBudgetBreakdown: { label: string; range: BudgetRange }[] = [
  { label: "School supplies and backpacks", range: { min: 2000, max: 4000 } },
  { label: "Permits and insurance", range: { min: 500, max: 1000 } },
  { label: "Entertainment (DJ, face painting)", range: { min: 800, max: 1500 } },
  { label: "Food and beverages", range: { min: 1000, max: 2000 } },
  { label: "Marketing and signage", range: { min: 300, max: 500 } },
  { label: "Event infrastructure (tents, tables, supplies)", range: { min: 400, max: 1000 } },
];

export const unityBudgetBreakdown: { label: string; range: BudgetRange }[] = [
  { label: "Venue", range: { min: 500, max: 1000 } },
  { label: "Food and beverages", range: { min: 1000, max: 2000 } },
  { label: "Entertainment", range: { min: 300, max: 500 } },
  { label: "Marketing materials", range: { min: 100, max: 200 } },
  { label: "Supplies and decorations", range: { min: 200, max: 400 } },
];

export const recommendations = {
  primary: {
    title: "Primary Recommendation: Phased Approach",
    bullets: [
      "Phase 1 (Year 2026): Launch Neighborhood Block Party as the primary signature community-facing event (target: August 2026).",
      "Phase 2 (Year 2026-2027): Introduce Unity BBQ as complementary fellowship programming (target: Spring/Summer 2027).",
    ],
    rationale: [
      "Addresses capacity constraints by executing one major event before adding complementary programming.",
      "Maximizes strategic impact by prioritizing community visibility and service alignment.",
      "Avoids event saturation and volunteer fatigue while building momentum and confidence.",
    ],
  },
  alternative: {
    title: "Alternative Recommendation: Unity BBQ First (Lower-Risk Path)",
    bullets: [
      "Execute Unity BBQ in Summer 2026 as lower-complexity inaugural signature event.",
      "Develop Block Party concept through 2026 with extended planning timeline.",
      "Launch Block Party in August 2027 with 12+ months preparation.",
    ],
    advantages: [
      "Reduces immediate pressure on stretched leadership.",
      "Builds event planning experience and a quick win for organizational morale.",
      "Allows longer runway for sponsorship and partnership development.",
    ],
    limitations: [
      "Delays addressing community visibility and engagement priorities.",
      "May reduce momentum from executive vision and current planning discussions.",
      "Postpones signature event establishment during early chapter development.",
    ],
  },
};

export const financialModels = {
  block: {
    revenuePotential: [
      { label: "Corporate sponsorships", range: { min: 2000, max: 4000 } },
      { label: "In-kind donations (supplies, food)", range: { min: 1000, max: 2000 } },
      { label: "Community partner contributions", range: { min: 500, max: 1000 } },
      { label: "Individual donations (on-site)", range: { min: 200, max: 500 } },
    ],
    totalRevenuePotential: { min: 3700, max: 7500 },
    netCostScenarios: [
      { scenario: "Conservative (Low sponsorship)", revenue: 3700, netCost: { min: 1300, max: 6300 } },
      { scenario: "Moderate (Medium sponsorship)", revenue: 5500, netCost: { min: -500, max: 4500 } },
      { scenario: "Optimistic (High sponsorship)", revenue: 7500, netCost: { min: -2500, max: 2500 } },
    ],
  },
  unity: {
    revenuePotential: [
      { label: "Member contributions/modest ticket", range: { min: 500, max: 1000 } },
      { label: "Organizational dues allocation", range: { min: 300, max: 600 } },
      { label: "Alumni donations", range: { min: 200, max: 400 } },
    ],
    totalRevenuePotential: { min: 1000, max: 2000 },
    netCost: { min: 1100, max: 3100 },
  },
};

export const riskMitigation = {
  title: "Risk Mitigation (from report)",
  bullets: [
    "Start with moderate attendance target (200-300) and scale up in future years.",
    "Secure a weather contingency plan (rain date or tent rentals).",
    "Develop backup vendors and volunteers for critical roles.",
    "Create a simplified version of the event that can be executed if challenges arise.",
    "Document all processes for future improvement and replication.",
  ],
  unityBBQIntroduction2027: [
    "Leverage Block Party success and established systems.",
    'Position as "member appreciation" following successful community event.',
    "Use as recruitment opportunity for Block Party volunteers and leadership.",
    "Keep planning simple and execution manageable.",
    "Consider rotating responsibility among organizations to distribute workload.",
  ],
};

export const riskMatrix = {
  blockParty: {
    title: "Block Party Risk Matrix (from report)",
    rows: [
      {
        risk: "Weather (rain)",
        impact: "Event cancellation or low attendance",
        mitigation: "Secure rain date; rent tents; develop indoor contingency.",
      },
      {
        risk: "Low attendance",
        impact: "Reduced impact; sponsor dissatisfaction",
        mitigation: "Strong marketing; partner promotion; community outreach.",
      },
      {
        risk: "Volunteer shortage",
        impact: "Operational failure",
        mitigation: "Early recruitment; clear roles; backup volunteers.",
      },
      {
        risk: "Permit delays",
        impact: "Timeline compression",
        mitigation: "Early application; city relationship-building.",
      },
      {
        risk: "Insufficient supplies",
        impact: "Unmet expectations",
        mitigation: "Order surplus; establish backup vendors.",
      },
    ],
  },
  unityBBQ: {
    title: "Unity BBQ Risk Profile",
    overall: "Overall Risk Level: Low (straightforward execution with limited public accountability).",
    bullets: [
      "Lower-than-expected attendance from member organizations.",
      "Weather impacting outdoor venue.",
      "Food quality or quantity issues.",
      "Minimal inter-organizational interaction despite intent.",
    ],
  },
};

export const implementationTimeline = {
  title: "Implementation Timeline (Recommended Path)",
  blockParty: [
    {
      label: "February 2026",
      bullets: [
        "Form planning committee; appoint coordinator and subcommittee leads.",
        "Develop project plan and budget.",
        "Initiate partnership outreach to Jersey City and schools.",
      ],
    },
    {
      label: "March 2026",
      bullets: [
        "Submit permit applications; secure liability insurance.",
        "Finalize date and location.",
        "Begin corporate sponsorship outreach.",
        "Launch volunteer recruitment.",
      ],
    },
    {
      label: "June-July 2026",
      bullets: [
        "Intensive promotion through schools and community channels.",
        "Confirm logistics and contingency plans; conduct volunteer training.",
        "Prepare materials and signage; press outreach and releases.",
      ],
    },
    {
      label: "August 2026",
      bullets: [
        "Execute Neighborhood Block Party.",
        "Document via photos/videos; collect feedback from attendees and volunteers.",
        "Send thank-you communications to partners and sponsors.",
      ],
    },
    {
      label: "September 2026",
      bullets: [
        "Post-event evaluation; compile metrics and attendance data.",
        "Prepare sponsor reports and media summaries.",
        "Create a runbook for 2027; present results to full body.",
      ],
    },
  ],
  unityBBQ: [
    {
      label: "Winter 2027",
      bullets: [
        "Form Unity BBQ planning committee.",
        "Leverage Block Party systems and experience; develop concept and budget.",
        "Select date and venue.",
      ],
    },
    {
      label: "Summer 2027",
      bullets: ["Execute Unity BBQ as member engagement and reclamation programming."],
    },
  ],
};

export const successMetrics = {
  blockParty: {
    title: "Block Party Success Metrics",
    quantitative: [
      "Total attendance (target: 200-300 year one).",
      "School supply distribution (target: 100 backpacks year one).",
      "Volunteer participation (target: 25-30).",
      "Sponsorship dollars secured (target: $2,000-$4,000).",
      "Media impressions (news coverage and social media reach).",
      "Community partner engagements (target: 10-15 organizations).",
    ],
    qualitative: [
      "Attendee satisfaction (post-event surveys).",
      "Partner feedback on collaboration quality.",
      "Volunteer experience and willingness to repeat.",
      "Media coverage tone and visibility.",
      "Community reputation and awareness increase.",
    ],
    strategicImpact: [
      "New member interest generated.",
      "Partnership relationships established for future events.",
      "Chapter brand recognition improvement.",
      "Organizational capacity development.",
      "Template creation for replicable programming.",
    ],
  },
  unityBBQ: {
    title: "Unity BBQ Success Metrics",
    quantitative: [
      "Total attendance by organization.",
      "Representation across Divine Nine chapters.",
    ],
    qualitative: [
      "Member feedback and engagement.",
      "Inter-organizational relationship quality.",
      "Post-event collaboration opportunities identified.",
    ],
  },
};

export const decisionFramework = {
  title: "Decision Framework + Voting Options",
  questions: [
    "What is our highest strategic priority: internal capacity-building or external community impact and visibility?",
    "Are we prepared to commit resources and leadership focus to a higher-complexity public event in 2026?",
    "Do we want to establish a signature community-facing event during this early chapter development phase?",
    "Should we sequence both events with Block Party first (recommended) or Unity BBQ first (alternative)?",
    "What role should presidential initiative and executive vision play in signature event selection?",
  ],
  votingOptions: [
    "Option 1 (Committee Recommendation): Approve phased approach with Block Party as 2026 signature event, followed by Unity BBQ in 2027.",
    "Option 2 (Alternative Path): Approve Unity BBQ as 2026 event, with Block Party development for 2027 launch.",
    "Option 3 (Single Event Focus): Approve one event as primary signature program, with second concept tabled or abandoned.",
    "Option 4 (Further Development): Request additional committee work to refine one or both concepts before final decision.",
  ],
  closingStatement:
    'Both events can succeed. Both events address real needs. The question is not which event is "better" in absolute terms, but which event best aligns with the chapter\'s strategic priorities, capacity realities, and vision for its role in Hudson County.',
};

export const references: string[] = [
  "NPHC of Hudson County. (2025). Chapter Assessment 2024-2025. Internal chapter document.",
  "National Pan-Hellenic Council. (2026). Community engagement best practices. https://www.nphchq.com",
  "NPHCHQ. (2026). NPHC National Programs and Pillars. https://www.nphchq.com",
  "Pi Beta Phi. (2022). Four ways to meaningfully engage with NPHC. https://www.pibetaphi.org/blog/blogentry?id=2924",
  "NPHC of Greater Greenville. (2026). Signature Events. https://www.upstatescpan.org/about/signature-events",
  "HundrED. (2024). Back-To-School Block Party innovation case study. https://hundred.org/en/innovations/back-to-school-block-party",
  "Hopeful Neighborhood. (2024). 5 Steps to a Successful Block Party. https://www.hopefulneighborhood.org/blog/5-steps-to-a-successful-block-party/",
];
