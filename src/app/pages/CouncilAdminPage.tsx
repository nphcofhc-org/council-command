import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Shield, FileText, Lock, AlertTriangle, ClipboardCheck, SlidersHorizontal, Home, Calendar, TrendingUp, FolderOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { motion } from "motion/react";
import { useCouncilAdminData } from "../hooks/use-site-data";
import { StatusBadge } from "../components/status-badge";
import { DynamicIcon } from "../components/icon-resolver";
import { Link } from "react-router";
import { CouncilAdminGate } from "../components/CouncilAdminGate";

const ART_MARBLE = "https://images.unsplash.com/photo-1678756466078-1ff0d7b09431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25vY2hyb21lJTIwYWJzdHJhY3QlMjBtYXJibGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MDUxMzIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function CouncilAdminPage() {
  const { data } = useCouncilAdminData();

  const internalDocuments = data?.internalDocuments || [];
  const tasks = data?.tasks || [];

  return (
    <CouncilAdminGate>
      <div className="relative min-h-screen">
        <div className="absolute top-20 right-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
          <img src={ART_MARBLE} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto relative z-10">
        {/* Restricted Access Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="mb-6 border-red-200 bg-red-50/80">
            <AlertTriangle className="size-4 text-red-600" />
            <AlertDescription className="text-red-800 ml-1 text-sm">
              <strong>Restricted Access {"\u2013"} Council Leadership Only.</strong>{" "}
              This section contains confidential council documents and administrative tools.
              Access is limited to Executive Board members and authorized personnel.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Shield className="size-5 text-black" />
            <span className="text-xs tracking-[0.2em] uppercase text-gray-400">Executive Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-black mb-1">Council Admin</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Internal documents, financial records, and strategic planning
          </p>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 grid gap-4 lg:grid-cols-2"
        >
          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-black sm:text-lg">NPHC Compliance Checklist</h3>
                <p className="text-sm text-gray-500">
                  Open the dedicated compliance tracking page to manage annual reporting readiness.
                </p>
              </div>
              <Button asChild className="w-full bg-black hover:bg-gray-800 sm:w-auto">
                <Link to="/council-admin/compliance">
                  <ClipboardCheck className="mr-2 size-4" />
                  Open Compliance Page
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-black sm:text-lg">Content Manager</h3>
                <p className="text-sm text-gray-500">
                  Update leadership names, chapters, emails, and photo URLs.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white sm:w-auto">
                <Link to="/council-admin/content">
                  <SlidersHorizontal className="mr-2 size-4" />
                  Open Content Manager
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-black sm:text-lg">Home Page Editor</h3>
                <p className="text-sm text-gray-500">
                  Update banner, president welcome, quick links, and internal news.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white sm:w-auto">
                <Link to="/council-admin/content/home">
                  <Home className="mr-2 size-4" />
                  Edit Home Page
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-black sm:text-lg">Meetings Editor</h3>
                <p className="text-sm text-gray-500">
                  Update upcoming meetings, minutes, and delegate report rows.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white sm:w-auto">
                <Link to="/council-admin/content/meetings">
                  <Calendar className="mr-2 size-4" />
                  Edit Meetings
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-black sm:text-lg">Programs Editor</h3>
                <p className="text-sm text-gray-500">
                  Update events, flyers, archives, and signup forms.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white sm:w-auto">
                <Link to="/council-admin/content/programs">
                  <TrendingUp className="mr-2 size-4" />
                  Edit Programs
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg ring-1 ring-black/5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base text-black sm:text-lg">Resources Editor</h3>
                <p className="text-sm text-gray-500">
                  Update shared forms, org links, and training resources.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white sm:w-auto">
                <Link to="/council-admin/content/resources">
                  <FolderOpen className="mr-2 size-4" />
                  Edit Resources
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 w-full sm:w-auto flex-wrap justify-start">
            <TabsTrigger value="documents" className="text-xs sm:text-sm">Internal Documents</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">Task Tracker</TabsTrigger>
          </TabsList>

          {/* Internal Documents */}
          <TabsContent value="documents" className="space-y-6">
            {internalDocuments.map((section, sectionIndex) => (
              <motion.div
                key={section.category}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: sectionIndex * 0.1, duration: 0.5 }}
              >
                <Card className="border-0 shadow-lg ring-1 ring-black/5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-black/5 rounded">
                        <DynamicIcon name={section.iconName} className="size-5 text-black" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{section.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.documents.map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ x: -15, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3 group"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-black/5 rounded flex-shrink-0 group-hover:bg-black/10 transition-colors">
                              <FileText className="size-4 sm:size-5 text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-black mb-1 text-sm sm:text-base">{doc.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-400">Last updated: {doc.updated}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                            <StatusBadge status={doc.status} />
                            {doc.fileUrl ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-2 border-gray-200 hover:border-black hover:bg-black hover:text-white w-full sm:w-auto transition-all duration-200"
                              >
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                                  <Lock className="size-3.5" />
                                  View
                                </a>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="gap-2 border-gray-200 w-full sm:w-auto"
                              >
                                <Lock className="size-3.5" />
                                View
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="bg-gray-50 border-0">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    <strong className="text-black">Document Security Notice:</strong> All documents in this section are
                    confidential and for authorized council leadership only. Do not share, forward,
                    or discuss contents outside of official council business.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Task Tracker */}
          <TabsContent value="tasks" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="border-0 shadow-lg ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Council Leadership Task Management</CardTitle>
                  <CardDescription className="text-sm">
                    Active assignments and administrative priorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-black mb-2">{task.task}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-sm text-gray-500">
                            <span>
                              <strong className="text-gray-600">Assigned to:</strong> {task.assignedTo}
                            </span>
                            <span className="hidden sm:inline text-gray-300">&middot;</span>
                            <span>
                              <strong className="text-gray-600">Due:</strong> {task.dueDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
                          <StatusBadge status={task.priority} />
                          <StatusBadge status={task.status} variant="outline" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-black hover:bg-gray-800 w-full sm:w-auto">
                  View Full Task Management System
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </CouncilAdminGate>
  );
}
