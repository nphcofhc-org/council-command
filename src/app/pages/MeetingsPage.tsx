import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Calendar, FileText, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useLocation } from "react-router";
import { useMeetingsData } from "../hooks/use-site-data";
import { StatusBadge } from "../components/status-badge";

const ART_GEO = "https://images.unsplash.com/photo-1665680779817-11a0d63ee51e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwZ2VvbWV0cmljJTIwbWluaW1hbCUyMGFydHxlbnwxfHx8fDE3NzA1MTMyMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

function normalizeDocUrl(input: string | null | undefined): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return raw;
  // Allow legacy values like "Agenda_Jan_2026_GB.pdf" → /docs/Agenda_Jan_2026_GB.pdf
  return `/docs/${raw}`;
}

export function MeetingsPage() {
  const { data } = useMeetingsData();
  const location = useLocation();

  const upcomingMeetings = data?.upcomingMeetings || [];
  const meetingRecords = data?.meetingRecords || [];
  const delegateReports = data?.delegateReports || [];
  const calendarHref = "/2026-council-calendar.html";
  const tab = new URLSearchParams(location.search || "").get("tab") || "";
  const initialTab = tab === "records" ? "records" : tab === "reports" ? "reports" : "upcoming";

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 left-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
        <img src={ART_GEO} alt="" className="w-full h-full object-cover" />
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
            <div className="w-8 h-px bg-black" />
            <span className="text-xs tracking-[0.2em] uppercase text-gray-400">Council Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-black mb-1">Meetings & Delegates</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Council meeting schedule, agendas, minutes, and delegate reporting for the current governance cycle
          </p>
        </motion.div>

        <Tabs key={initialTab} defaultValue={initialTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 w-full sm:w-auto flex-wrap justify-start">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming Meetings</TabsTrigger>
            <TabsTrigger value="records" className="text-xs sm:text-sm">Agendas & Minutes</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Delegate Reports</TabsTrigger>
          </TabsList>

          {/* Upcoming Meetings */}
          <TabsContent value="upcoming" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="border-0 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg sm:text-xl">Council Meeting Calendar</CardTitle>
                    <Button asChild variant="outline" size="sm" className="w-fit">
                      <a href={calendarHref}>View 2026 Calendar</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="p-3 bg-black text-white rounded-xl text-center min-w-[4rem] flex-shrink-0">
                          <div className="text-2xl">{new Date(meeting.date).getDate()}</div>
                          <div className="text-[10px] uppercase tracking-wider opacity-70">
                            {new Date(meeting.date).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-black mb-2">{meeting.title}</h3>
                              <div className="space-y-1.5 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Clock className="size-3.5 flex-shrink-0" />
                                  <span>{meeting.time}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Calendar className="size-3.5 flex-shrink-0 mt-0.5" />
                                  <span className="break-words">{meeting.location}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-black text-white hover:bg-black w-fit">{meeting.type}</Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    <strong className="text-black">Note:</strong> General Body meetings are held on the third Saturday of each month.
                    Executive Board meetings convene on the first Wednesday. All members should review meeting
                    materials 48 hours in advance.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Agendas & Minutes */}
          <TabsContent value="records" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="border-0 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Meeting Documentation Archive</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meeting Date</TableHead>
                          <TableHead>Meeting Title</TableHead>
                          <TableHead>Agenda</TableHead>
                          <TableHead>Minutes</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meetingRecords.map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ x: -15, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            className="border-b transition-colors hover:bg-gray-50"
                          >
                            <TableCell className="text-gray-500">{record.date}</TableCell>
                            <TableCell className="font-medium">{record.title}</TableCell>
                            <TableCell>
                              {normalizeDocUrl(record.agendaFile) ? (
                                <Button asChild variant="ghost" size="sm" className="h-8 gap-2 text-black hover:bg-black/5">
                                  <a href={normalizeDocUrl(record.agendaFile) || "#"} target="_blank" rel="noreferrer">
                                    <FileText className="size-3.5" />
                                    <span className="text-xs">View</span>
                                  </a>
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" disabled className="h-8 gap-2 text-gray-400">
                                  <FileText className="size-3.5" />
                                  <span className="text-xs">Missing</span>
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              {normalizeDocUrl(record.minutesFile) ? (
                                <Button asChild variant="ghost" size="sm" className="h-8 gap-2 text-black hover:bg-black/5">
                                  <a href={normalizeDocUrl(record.minutesFile) || "#"} target="_blank" rel="noreferrer">
                                    <FileText className="size-3.5" />
                                    <span className="text-xs">View</span>
                                  </a>
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" disabled className="h-8 gap-2 text-gray-400">
                                  <FileText className="size-3.5" />
                                  <span className="text-xs">Missing</span>
                                </Button>
                              )}
                            </TableCell>
                            <TableCell><StatusBadge status={record.status} /></TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {meetingRecords.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                      >
                        <Card className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-black text-sm flex-1">{record.title}</h3>
                              <StatusBadge status={record.status} />
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{record.date}</p>
                            <div className="flex gap-2">
                              {normalizeDocUrl(record.agendaFile) ? (
                                <Button asChild variant="outline" size="sm" className="flex-1 gap-2 text-xs border-gray-200">
                                  <a href={normalizeDocUrl(record.agendaFile) || "#"} target="_blank" rel="noreferrer">
                                    <FileText className="size-3" />
                                    Agenda
                                  </a>
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" disabled className="flex-1 gap-2 text-xs border-gray-200">
                                  <FileText className="size-3" />
                                  Agenda
                                </Button>
                              )}
                              {normalizeDocUrl(record.minutesFile) ? (
                                <Button asChild variant="outline" size="sm" className="flex-1 gap-2 text-xs border-gray-200">
                                  <a href={normalizeDocUrl(record.minutesFile) || "#"} target="_blank" rel="noreferrer">
                                    <FileText className="size-3" />
                                    Minutes
                                  </a>
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" disabled className="flex-1 gap-2 text-xs border-gray-200">
                                  <FileText className="size-3" />
                                  Minutes
                                </Button>
                              )}
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

          {/* Delegate Reports */}
          <TabsContent value="reports" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="border-0 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Chapter Delegate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meeting Cycle</TableHead>
                          <TableHead>Chapter</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead>Date Submitted</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {delegateReports.map((report, index) => (
                          <motion.tr
                            key={report.id}
                            initial={{ x: -15, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            className="border-b transition-colors hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">{report.meetingCycle}</TableCell>
                            <TableCell>{report.chapter}</TableCell>
                            <TableCell>{report.submittedBy}</TableCell>
                            <TableCell className="text-gray-500">{report.dateSubmitted}</TableCell>
                            <TableCell><StatusBadge status={report.status} /></TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {delegateReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                      >
                        <Card className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-black text-sm flex-1">{report.meetingCycle}</h3>
                              <StatusBadge status={report.status} />
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-400 text-xs">Chapter</span>
                                <p className="text-gray-700">{report.chapter}</p>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-gray-500 flex-shrink-0">Submitted By:</span>
                                <span className="text-right">{report.submittedBy}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-gray-500 flex-shrink-0">Date:</span>
                                <span className="text-right">{report.dateSubmitted}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    <strong className="text-black">Reminder:</strong> Chapter delegate reports are due 72 hours prior to each General Body meeting.
                    Please use the official Delegate Report Form available in the Resources section.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
