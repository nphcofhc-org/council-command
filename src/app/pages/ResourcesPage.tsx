import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  FileText,
  ExternalLink,
  GraduationCap,
  Building2,
  BookOpen,
  ListChecks,
  DollarSign,
  CalendarDays,
  FileCheck2,
  Receipt,
  Megaphone,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useResourcesData } from "../hooks/use-site-data";
import { Link } from "react-router";

const ART_INK = "https://images.unsplash.com/photo-1769181417562-be594f91fcc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwYWJzdHJhY3QlMjBpbmslMjBicnVzaCUyMHN0cm9rZXN8ZW58MXx8fHwxNzcwNTEzMjIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const SHARED_FORM_ROUTE_BY_NAME: Record<string, string> = {
  "budget submission form": "#/forms/budget",
  "budget submission": "#/forms/budget",
  "event submission form": "#/forms/events",
  "event submission": "#/forms/events",
  "event proposal & budget request form": "#/forms/event-proposal-budget",
  "event proposal & budget request": "#/forms/event-proposal-budget",
  "event post-report & financial reconciliation": "#/forms/event-post-report-reconciliation",
  "event post-report & financial reconciliation form": "#/forms/event-post-report-reconciliation",
  "reimbursement request form": "#/forms/reimbursement",
  "reimbursement request": "#/forms/reimbursement",
  "social media request form": "#/forms/social-media",
  "social media request": "#/forms/social-media",
  "committee report form": "#/forms/committee-report",
  "committee report": "#/forms/committee-report",
  "monthly delegate report template": "#/forms/committee-report",
  "quarterly membership roster update": "#/council-admin/attendance/quarterly-roster-audit",
  "chapter dues payment confirmation": "#/council-admin/site-maintenance",
};

export function ResourcesPage() {
  const { data } = useResourcesData();

  const sharedForms = data?.sharedForms || [];
  const nationalOrgs = data?.nationalOrgs || [];
  const trainingResources = data?.trainingResources || [];

  const toViewer = (url: string) => `/viewer?src=${encodeURIComponent(url)}`;
  const isInternalFile = (url: string) => url.trim().startsWith("/");
  const resolveSharedFormLink = (form: { name: string; link: string }) => {
    const name = String(form?.name || "").trim();
    const link = String(form?.link || "").trim();
    const mapped = SHARED_FORM_ROUTE_BY_NAME[name.toLowerCase()];
    return mapped || link;
  };
  const isSharedFormInactive = (form: { name: string; link: string }) => {
    const link = resolveSharedFormLink(form);
    if (!link || link === "#") return true;
    return false;
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute bottom-0 left-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
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
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Forms + Reference Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-slate-900 mb-1">
            <span className="text-primary">Forms</span> &amp; Resources
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Submission forms, shared templates, external links, training materials, and governance reference documents.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="size-5" />
                Portal Forms & Requests
              </CardTitle>
              <CardDescription>
                Primary submission forms and status tracking are now available here in the same hub as resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/forms/my">
                    <ListChecks className="mr-2 size-4" />
                    My Submissions
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Budget Submission", to: "/forms/budget", icon: DollarSign },
                  { label: "Event Submission", to: "/forms/events", icon: CalendarDays },
                  { label: "Event Proposal & Budget", to: "/forms/event-proposal-budget", icon: FileCheck2 },
                  { label: "Reimbursement Request", to: "/forms/reimbursement", icon: Receipt },
                  { label: "Social Media Request", to: "/forms/social-media", icon: Megaphone },
                  { label: "Committee Report", to: "/forms/committee-report", icon: FileText },
                  { label: "Event Post-Report", to: "/forms/event-post-report-reconciliation", icon: ClipboardCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.to}
                      asChild
                      variant="outline"
                      className="h-auto justify-start border-black/15 bg-white/5 px-3 py-3 text-left text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                    >
                      <Link to={item.to}>
                        <Icon className="mr-2 size-4 shrink-0" />
                        <span className="whitespace-normal leading-snug">{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="forms" className="space-y-6">
          <TabsList className="w-full sm:w-auto flex-wrap justify-start border border-black/10 bg-white/5 backdrop-blur-xl">
            <TabsTrigger value="forms" className="text-xs sm:text-sm">Shared Forms / Templates</TabsTrigger>
            <TabsTrigger value="national" className="text-xs sm:text-sm">National Organizations</TabsTrigger>
            <TabsTrigger value="training" className="text-xs sm:text-sm">Training & Onboarding</TabsTrigger>
          </TabsList>

          {/* Shared Forms */}
          <TabsContent value="forms" className="space-y-6">
            {sharedForms.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: catIndex * 0.1, duration: 0.5 }}
              >
                <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.forms.map((form, index) => (
                        (() => {
                          const inactive = isSharedFormInactive(form);
                          const resolvedLink = resolveSharedFormLink(form);
                          return (
                        <motion.div
                          key={form.id}
                          initial={{ x: -15, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className={`flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 rounded-lg border gap-3 group transition-all duration-200 ${
                            inactive
                              ? "border-black/10 bg-white/5 opacity-65"
                              : "border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg border border-black/10 bg-white/5 flex-shrink-0 transition-colors ${
                              inactive ? "" : "group-hover:border-primary/30 group-hover:bg-white/10"
                            }`}>
                              <FileText className="size-4 sm:size-5 text-slate-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-slate-900 mb-1 text-sm sm:text-base">{form.name}</h3>
                              <p className="text-sm text-slate-600">{form.description}</p>
                              {inactive ? (
                                <p className="mt-1 text-xs font-semibold text-slate-500">Inactive for now</p>
                              ) : null}
                            </div>
                          </div>
                          {inactive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="gap-2 border-black/15 bg-white/5 text-slate-900/40 w-full sm:w-auto"
                            >
                              <ExternalLink className="size-3.5" />
                              Inactive
                            </Button>
                          ) : (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 w-full sm:w-auto transition-all duration-200"
                            >
                              <a href={resolvedLink} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-3.5" />
                                Open
                              </a>
                            </Button>
                          )}
                        </motion.div>
                          );
                        })()
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* National Organizations */}
          <TabsContent value="national" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Divine Nine National Headquarters</CardTitle>
                  <CardDescription className="text-sm">
                    Official websites for the nine NPHC member organizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {nationalOrgs.map((org, index) => (
                      <motion.div
                        key={org.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-colors gap-3 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg border border-black/10 bg-white/5 flex-shrink-0 group-hover:border-primary/30 group-hover:bg-white/10 transition-colors">
                            <Building2 className="size-4 sm:size-5 text-slate-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 text-sm sm:text-base">{org.name}</h3>
                            <p className="text-xs sm:text-sm text-slate-500">Founded {org.founded}</p>
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-primary w-full sm:w-auto">
                          <a href={org.website} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5" />
                            Visit Website
                          </a>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-black/10 bg-white/5 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <strong className="text-slate-900">National Pan-Hellenic Council, Inc.</strong> coordinates the activities
                      of its nine member organizations on a national and international scale. Visit{" "}
                      <a href="https://nphchq.org" className="underline text-primary hover:no-underline">
                        nphchq.org
                      </a>{" "}
                      for national council information.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Training & Onboarding */}
          <TabsContent value="training" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Training Materials & Reference Documents</CardTitle>
                  <CardDescription className="text-sm">
                    Educational resources for council members and leadership
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trainingResources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-colors gap-3 group"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg border border-black/10 bg-white/5 flex-shrink-0 group-hover:border-primary/30 group-hover:bg-white/10 transition-colors">
                            <BookOpen className="size-4 sm:size-5 text-slate-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-slate-900 mb-1 text-sm sm:text-base">{resource.title}</h3>
                                <p className="text-sm text-slate-600 mb-1">{resource.description}</p>
                                <p className="text-xs text-slate-400">Last updated: {resource.updated}</p>
                              </div>
                              <Badge variant="secondary" className="whitespace-nowrap w-fit border border-primary/25 bg-primary/15 text-primary">
                                {resource.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {resource.fileUrl ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 w-full sm:w-auto lg:ml-4 transition-all duration-200"
                          >
                            {isInternalFile(resource.fileUrl) ? (
                              <Link to={toViewer(resource.fileUrl)}>
                                <FileText className="size-3.5" />
                                View
                              </Link>
                            ) : (
                              <a href={resource.fileUrl} target="_blank" rel="noreferrer">
                                <FileText className="size-3.5" />
                                View
                              </a>
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="gap-2 border-black/15 bg-white/5 text-slate-900/35 w-full sm:w-auto lg:ml-4"
                          >
                            <FileText className="size-3.5" />
                            View
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
