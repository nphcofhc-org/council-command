import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Calendar, FileText, Users, MapPin, Clock, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useProgramsData } from "../hooks/use-site-data";
import { StatusBadge } from "../components/status-badge";

const ART_MARBLE = "https://images.unsplash.com/photo-1678756466078-1ff0d7b09431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25vY2hyb21lJTIwYWJzdHJhY3QlMjBtYXJibGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MDUxMzIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function ProgramsPage() {
  const { data } = useProgramsData();

  const upcomingEvents = data?.upcomingEvents || [];
  const archivedEvents = data?.archivedEvents || [];
  const eventFlyers = data?.eventFlyers || [];
  const signupForms = data?.signupForms || [];

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
        <img src={ART_MARBLE} alt="" className="w-full h-full object-cover" />
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
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Council Programming</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-slate-900 mb-1">
            Programs <span className="text-primary">&amp;</span> Events
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Council programming, event calendar, and member registration access
          </p>
        </motion.div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="w-full sm:w-auto flex-wrap justify-start border border-black/10 bg-white/5 backdrop-blur-xl">
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">Event Calendar</TabsTrigger>
            <TabsTrigger value="flyers" className="text-xs sm:text-sm">Event Materials</TabsTrigger>
            <TabsTrigger value="signup" className="text-xs sm:text-sm">Sign-Up Forms</TabsTrigger>
          </TabsList>

          {/* Event Calendar */}
          <TabsContent value="calendar" className="space-y-8">
            <div>
              <motion.h2
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-lg sm:text-xl text-slate-900 mb-4"
              >
                Upcoming Events
              </motion.h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                  >
                    <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2.5 rounded-lg border border-black/10 bg-white/5 flex-shrink-0">
                                <Calendar className="size-5 text-slate-900" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl text-slate-900 mb-1">{event.title}</h3>
                                <p className="text-slate-600 text-sm mb-3">{event.description}</p>
                                <div className="space-y-1.5 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="size-3.5 flex-shrink-0" />
                                    <span>{event.date}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="size-3.5 flex-shrink-0 mt-0.5" />
                                    <span className="break-words">{event.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:text-right gap-2 w-full sm:w-auto">
                            <Badge className="w-fit border border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">
                              {event.type}
                            </Badge>
                            <Button
                              size="sm"
                              className={
                                event.registration === "Open"
                                  ? "bg-primary text-primary-foreground hover:brightness-110 w-full sm:w-auto"
                                  : "bg-white/10 text-slate-400 w-full sm:w-auto cursor-default"
                              }
                              disabled={event.registration !== "Open"}
                            >
                              {event.registration}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div>
              <motion.h2
                initial={{ x: -15, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-lg sm:text-xl text-slate-900 mb-4"
              >
                Recent Events
              </motion.h2>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <CardContent className="p-0">
                    {archivedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ x: -15, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 ${
                          index < archivedEvents.length - 1 ? "border-b border-black/10" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className="text-slate-900">{event.title}</h3>
                          <p className="text-sm text-slate-500">{event.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-slate-500">{event.attendees}</p>
                          <StatusBadge status={event.status} />
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Event Materials */}
          <TabsContent value="flyers" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Event One-Pagers & Promotional Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {eventFlyers.map((flyer, index) => (
                      <motion.div
                        key={flyer.id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="rounded-xl border border-black/10 bg-white/5 p-4 transition-all duration-300 group hover:border-primary/30 hover:bg-white/10"
                      >
                        <div className="aspect-[8.5/11] bg-gradient-to-br from-black via-gray-800 to-gray-700 rounded-lg mb-4 flex items-center justify-center group-hover:from-gray-800 group-hover:to-gray-600 transition-all duration-300">
                          <FileText className="size-12 sm:size-16 text-slate-900/15" />
                        </div>
                        <h3 className="text-slate-900 text-sm mb-1">{flyer.title}</h3>
                        <p className="text-xs text-slate-500 mb-1">{flyer.type}</p>
                        <p className="text-xs text-slate-400 mb-3">{flyer.date}</p>
                        {flyer.fileUrl ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition-all duration-200"
                          >
                            <a href={flyer.fileUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="size-3" />
                              View
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="w-full gap-2 border-black/15 bg-white/5 text-slate-900/35">
                            <ExternalLink className="size-3" />
                            Missing
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Sign-Up Forms */}
          <TabsContent value="signup" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Event Registration & Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {signupForms.map((form, index) => (
                      <motion.div
                        key={form.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-colors gap-4"
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="p-2 rounded-lg border border-black/10 bg-white/5 flex-shrink-0">
                            <Users className="size-5 text-slate-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 mb-1">{form.title}</h3>
                            <p className="text-sm text-slate-600 mb-2">{form.description}</p>
                            <p className="text-xs text-slate-400">
                              <strong>Deadline:</strong> {form.deadline}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <StatusBadge status={form.status} />
                          {form.status === "Active" && form.formUrl ? (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 w-full sm:w-auto"
                            >
                              <a href={form.formUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-3" />
                                Open Form
                              </a>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 border-black/15 bg-white/5 text-slate-900/35 w-full sm:w-auto"
                              disabled
                            >
                              <ExternalLink className="size-3" />
                              {form.formUrl ? "Closed" : "Missing"}
                            </Button>
                          )}
                        </div>
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
