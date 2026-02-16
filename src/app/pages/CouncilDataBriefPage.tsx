import { Link } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { motion } from "motion/react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Button } from "../components/ui/button";

const BRIEF_SECTIONS = [
  {
    id: "sec-1",
    title: "Administrative & Configuration",
    summary:
      "Formal identity, governance structure, and executive role delineation to keep operations stable across leadership transitions.",
    bullets: [
      "Centralized digital identity supports continuity across biennial transitions.",
      "Executive roles are clearly defined (President, Vice President, Secretary, Treasurer, Financial Secretary, Chaplain, Parliamentarian).",
      "The portal is positioned as the single source of truth for governance procedures.",
    ],
  },
  {
    id: "sec-2",
    title: "Chapter & Membership Data",
    summary:
      "Verified chapter registry, chapter participation status, and two-tier governance alignment (National Constitution + Local Bylaws).",
    bullets: [
      "Directory tracks all Divine Nine organizations in Hudson County.",
      "Iota Phi Theta inclusion is documented as strategic expansion affecting quorum/voting dynamics.",
      "Local bylaws reinforce county-specific operating controls while remaining aligned with national standards.",
    ],
  },
  {
    id: "sec-3",
    title: "Communications & Programmatic Impact",
    summary:
      "Event operations, accountability frameworks, advocacy committee structure, and milestone tracking for member visibility.",
    bullets: [
      "Annual/biannual mandatory reports are documented under VP and committee oversight.",
      "Donation/service accountability models are mapped for measurable chapter participation.",
      "D9 Day of Advocacy committee framework defines ownership for logistics, registration, sponsorship, and branding.",
    ],
  },
  {
    id: "sec-4",
    title: "Meeting Management & SOPs",
    summary:
      "Meeting cadence, committee rhythms, agenda/minute procedures, and corrective controls for operational risk mitigation.",
    bullets: [
      "General Council meetings are monthly with defined cadence.",
      "Committee schedules are fixed for consistency and execution discipline.",
      "Address verification and disbursement controls were added to reduce administrative error risk.",
    ],
  },
  {
    id: "sec-5",
    title: "Resources, Financial Stewardship & Liability",
    summary:
      "Banking transition, liquidity protocol, signer controls, and liability recommendations for public-facing events.",
    bullets: [
      "Operating funds migrated into formal banking and cloud systems for institutional readiness.",
      "Cash App is maintained at controlled liquidity levels; signer restrictions preserve audit integrity.",
      "Liability coverage recommendations are tied to event scale and public risk exposure.",
    ],
  },
] as const;

export function CouncilDataBriefPage() {
  return (
    <CouncilLeaderGate>
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
          >
            <Link to="/council-admin">
              <ArrowLeft className="size-4" />
              Back to Council Admin
            </Link>
          </Button>

          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <FileText className="size-6 text-primary" />
                  Comprehensive Data Brief (Interactive)
                </CardTitle>
                <CardDescription>
                  Dynamic in-portal version of the NPHC of Hudson County comprehensive data brief for intranet integration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="rounded-xl border border-black/10 bg-white/5">
                  {BRIEF_SECTIONS.map((section) => (
                    <AccordionItem key={section.id} value={section.id} className="border-b border-black/10 last:border-b-0">
                      <AccordionTrigger className="px-4 sm:px-6 text-left">
                        <span className="text-slate-900">{section.title}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-6 pb-5">
                        <p className="text-sm text-slate-700 leading-relaxed">{section.summary}</p>
                        <ul className="mt-3 ml-5 list-disc space-y-1.5 text-sm text-slate-600">
                          {section.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </CouncilLeaderGate>
  );
}

