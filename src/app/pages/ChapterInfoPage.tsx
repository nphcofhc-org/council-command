import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Mail, FileText, Calendar, User, Award, Briefcase, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useChapterInfoData } from "../hooks/use-site-data";
import { StatusBadge } from "../components/status-badge";
import { fetchLeadershipContent } from "../data/admin-api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_LEADERSHIP_CONTENT,
  type LeadershipContent,
  type LeadershipMember,
} from "../data/leadership";

const ART_INK = "https://images.unsplash.com/photo-1769181417562-be594f91fcc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwYWJzdHJhY3QlMjBpbmslMjBicnVzaCUyMHN0cm9rZXN8ZW58MXx8fHwxNzcwNTEzMjIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

function normalizeDriveImageUrl(raw: string | null | undefined): string {
  const input = String(raw || "").trim();
  if (!input) return "";

  // Convert common Google Drive share links to direct view URLs so <img> can load them.
  // Note: the file must still be shared publicly ("Anyone with the link can view").
  try {
    const u = new URL(input);
    const host = u.hostname.toLowerCase();
    if (host !== "drive.google.com") return input;

    const m = u.pathname.match(/\/file\/d\/([^/]+)\//);
    const fileId = m?.[1] || u.searchParams.get("id");
    if (!fileId) return input;

    return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;
  } catch {
    return input;
  }
}

function MemberPhoto({ member, size = "md" }: { member: LeadershipMember; size?: "md" | "xl" }) {
  const [failed, setFailed] = useState(false);
  const normalized = normalizeDriveImageUrl(member.imageUrl);
  const classes = size === "xl"
    ? "w-60 h-60 rounded-3xl"
    : "w-44 h-44 rounded-2xl";

  if (normalized && !failed) {
    return (
      <img
        src={normalized}
        alt={member.name}
        className={`${classes} object-cover mb-3 border-4 border-black/10 bg-white`}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  const initials = (() => {
    const parts = String(member.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || "") : (parts[0]?.[1] || "");
    return (first + last).toUpperCase().slice(0, 2) || "?";
  })();

  return (
    <div className={`${classes} bg-white/5 flex flex-col items-center justify-center mb-3 border-4 border-black/10 group-hover:border-black/15 transition-colors overflow-hidden`}>
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-white/10 to-black/5">
        <span className={`${size === "xl" ? "text-5xl" : "text-4xl"} font-extrabold tracking-tight text-slate-700`}>{initials}</span>
      </div>
    </div>
  );
}

export function ChapterInfoPage() {
  const { data } = useChapterInfoData();
  const [leadership, setLeadership] = useState<LeadershipContent>(DEFAULT_LEADERSHIP_CONTENT);
  const [selectedMember, setSelectedMember] = useState<LeadershipMember | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchLeadershipContent()
      .then((payload) => {
        if (cancelled || !payload.found) return;
        setLeadership(payload.data);
      })
      .catch(() => {
        // Keep static default when CMS content is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const delegates = data?.delegates || [];
  const documents = data?.governingDocuments || [];
  const toContactHref = (member: LeadershipMember) => {
    const recipient = member.email || DEFAULT_CONTACT_EMAIL;
    const subject = encodeURIComponent(`Contact Request: ${member.title} (${member.name})`);
    return `mailto:${recipient}?subject=${subject}`;
  };

  const selectedContactHref = selectedMember ? toContactHref(selectedMember) : "#";

  return (
    <div className="relative min-h-screen">
      {/* Abstract background */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
        <img src={ART_INK} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="p-4 sm:p-8 max-w-7xl mx-auto relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Council Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-slate-900 mb-1">
            Chapter <span className="text-primary">Information</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Council leadership, chapter delegates, and governing documents
          </p>
        </motion.div>

        <Tabs defaultValue="officers" className="space-y-6">
          <TabsList className="w-full sm:w-auto flex-wrap justify-start border border-black/10 bg-white/5 backdrop-blur-xl">
            <TabsTrigger value="officers" className="text-xs sm:text-sm">Officers & Contact</TabsTrigger>
            <TabsTrigger value="delegates" className="text-xs sm:text-sm">Delegates</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">Governing Documents</TabsTrigger>
          </TabsList>

          {/* Officers Tab */}
          <TabsContent value="officers" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Executive Board (2025-2026)</CardTitle>
                  <CardDescription className="text-sm">
                    Corrected and authoritative 2025-2026 leadership roster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Executive Board
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {leadership.executiveBoard.map((officer, index) => (
                      <motion.div
                        key={officer.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.05 + index * 0.08, duration: 0.4 }}
                      >
                        <Card className="h-full transition-all duration-300 group hover:-translate-y-1 hover:border-primary/40 hover:bg-white/10">
                          <CardContent className="p-5">
                            <div className="flex flex-col items-center text-center">
                              <button
                                type="button"
                                className="nphc-holo-btn cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                onClick={() => setSelectedMember(officer)}
                                aria-label={`View profile for ${officer.name}`}
                              >
                                <MemberPhoto member={officer} />
                              </button>
                              <h3 className="text-slate-900 text-base font-semibold leading-tight">{officer.name}</h3>
                              <Badge variant="secondary" className="mt-2 mb-2 border border-primary/25 bg-primary/15 text-primary">
                                {officer.title}
                              </Badge>
                              <p className="text-sm text-slate-600 mb-3 leading-snug">{officer.chapter}</p>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition-all duration-200"
                              >
                                <a href={toContactHref(officer)}>
                                  <Mail className="size-4" />
                                  Contact
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Standing Committee Chairs (2025-2026)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {leadership.additionalChairs.map((chair, index) => (
                      <motion.div
                        key={chair.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45 + index * 0.08, duration: 0.4 }}
                      >
                        <Card className="h-full transition-all duration-300 group hover:-translate-y-1 hover:border-primary/40 hover:bg-white/10">
                          <CardContent className="p-5">
                            <div className="flex flex-col items-center text-center">
                              <button
                                type="button"
                                className="nphc-holo-btn cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                onClick={() => setSelectedMember(chair)}
                                aria-label={`View profile for ${chair.name}`}
                              >
                                <MemberPhoto member={chair} />
                              </button>
                              <h3 className="text-slate-900 text-base font-semibold leading-tight">{chair.name}</h3>
                              <Badge variant="secondary" className="mt-2 mb-2 border border-primary/25 bg-primary/15 text-primary">
                                {chair.title}
                              </Badge>
                              <p className="text-sm text-slate-600 mb-3 leading-snug">{chair.chapter}</p>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition-all duration-200"
                              >
                                <a href={toContactHref(chair)}>
                                  <Mail className="size-4" />
                                  Contact
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Delegates Tab */}
          <TabsContent value="delegates" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Chapter Representatives & Delegates</CardTitle>
                  <CardDescription className="text-sm">
                    Voting members and alternate delegates for each member organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Chapter Organization</TableHead>
                          <TableHead>Representative</TableHead>
                          <TableHead>Delegate</TableHead>
                          <TableHead>Term</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {delegates.map((d, index) => (
                          <motion.tr
                            key={d.id}
                            initial={{ x: -15, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            className="border-b border-black/10 transition-colors hover:bg-white/5"
                          >
                            <TableCell className="font-medium">{d.chapter}</TableCell>
                            <TableCell>{d.representative}</TableCell>
                            <TableCell>{d.delegate}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{d.term}</Badge>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {delegates.map((d, index) => (
                      <motion.div
                        key={d.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                      >
                        <Card className="shadow-sm">
                          <CardContent className="p-4">
                            <h3 className="text-slate-900 text-sm mb-3">{d.chapter}</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-500 flex-shrink-0">Representative:</span>
                                <span className="text-right">{d.representative}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-500 flex-shrink-0">Delegate:</span>
                                <span className="text-right">{d.delegate}</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-slate-500 flex-shrink-0">Term:</span>
                                <Badge variant="outline">{d.term}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Governing Documents Library</CardTitle>
                  <CardDescription className="text-sm">
                    Official constitution, bylaws, and policy framework
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documents.map((doc, index) => {
                      const motionProps = {
                        initial: { x: -15, opacity: 0 },
                        whileInView: { x: 0, opacity: 1 },
                        viewport: { once: true },
                        transition: { delay: index * 0.05, duration: 0.3 },
                      } as const;

                      const content = (
                        <>
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg border border-black/10 bg-white/5 flex-shrink-0 group-hover:border-primary/30 group-hover:bg-white/10 transition-colors">
                              <FileText className="size-4 sm:size-5 text-slate-900" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-slate-900 mb-1 text-sm sm:text-base">{doc.title}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-slate-500">
                                <span>{doc.type}</span>
                                <span className="hidden sm:inline text-slate-300">&middot;</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  Updated {doc.lastUpdated}
                                </span>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={doc.status} />
                        </>
                      );

                      if (doc.fileUrl) {
                        const raw = String(doc.fileUrl || "").trim();
                        const isInternalFile = raw.startsWith("/");
                        const viewerHref = isInternalFile ? `#/viewer?src=${encodeURIComponent(raw)}` : raw;

                        return (
                          <motion.a
                            key={doc.id}
                            href={viewerHref}
                            target={isInternalFile ? undefined : "_blank"}
                            rel={isInternalFile ? undefined : "noreferrer"}
                            {...motionProps}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-200 group"
                          >
                            {content}
                          </motion.a>
                        );
                      }

                      return (
                        <motion.div
                          key={doc.id}
                          {...motionProps}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-colors duration-200 group"
                        >
                          {content}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedMember} onOpenChange={(open) => setSelectedMember(open ? selectedMember : null)}>
        <DialogContent className="nphc-glass bg-white/70 border border-black/10 shadow-[0_36px_120px_rgba(0,0,0,0.22)] max-w-2xl">
          {selectedMember ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-900">{selectedMember.name}</DialogTitle>
                <DialogDescription className="text-slate-600">
                  {selectedMember.title} {selectedMember.chapter ? `• ${selectedMember.chapter}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 sm:grid-cols-[250px_1fr]">
                <div className="flex flex-col items-center sm:items-start">
                  <MemberPhoto member={selectedMember} size="xl" />
                  <a
                    href={selectedContactHref}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
                  >
                    <Mail className="size-4" />
                    Contact
                  </a>
                </div>

                <div className="space-y-3 text-sm">
                  {selectedMember.profession ? (
                    <div className="flex items-start gap-2">
                      <Briefcase className="mt-0.5 size-4 text-slate-500" />
                      <div>
                        <p className="text-slate-500 text-xs tracking-widest uppercase">Profession</p>
                        <p className="text-slate-800">{selectedMember.profession}</p>
                      </div>
                    </div>
                  ) : null}

                  {Array.isArray(selectedMember.degrees) && selectedMember.degrees.length > 0 ? (
                    <div className="flex items-start gap-2">
                      <Award className="mt-0.5 size-4 text-slate-500" />
                      <div>
                        <p className="text-slate-500 text-xs tracking-widest uppercase">Degrees / Certifications</p>
                        <ul className="mt-1 space-y-1 text-slate-800 list-disc list-inside">
                          {selectedMember.degrees.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}

                  {Array.isArray(selectedMember.committees) && selectedMember.committees.length > 0 ? (
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 size-4 text-slate-500" />
                      <div>
                        <p className="text-slate-500 text-xs tracking-widest uppercase">Committees</p>
                        <ul className="mt-1 space-y-1 text-slate-800 list-disc list-inside">
                          {selectedMember.committees.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}

                  {Array.isArray(selectedMember.funFacts) && selectedMember.funFacts.length > 0 ? (
                    <div className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 size-4 text-slate-500" />
                      <div>
                        <p className="text-slate-500 text-xs tracking-widest uppercase">Fun Facts</p>
                        <ul className="mt-1 space-y-1 text-slate-800 list-disc list-inside">
                          {selectedMember.funFacts.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}

                  {!selectedMember.profession &&
                  (!selectedMember.degrees || selectedMember.degrees.length === 0) &&
                  (!selectedMember.committees || selectedMember.committees.length === 0) &&
                  (!selectedMember.funFacts || selectedMember.funFacts.length === 0) ? (
                    <p className="text-slate-600">
                      Profile details aren&apos;t filled in yet. (Admin can add profession, degrees/certifications,
                      committees, and fun facts.)
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
