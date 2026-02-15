import { createHashRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage";
import { ChapterInfoPage } from "./pages/ChapterInfoPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { TreasuryPage } from "./pages/TreasuryPage";
import { CouncilAdminPage } from "./pages/CouncilAdminPage";
import { CouncilCompliancePage } from "./pages/CouncilCompliancePage";
import { CouncilContentManagerPage } from "./pages/CouncilContentManagerPage";
import { FigmaStagingPage } from "./pages/FigmaStagingPage";
import { CouncilHomeContentPage } from "./pages/CouncilHomeContentPage";
import { CouncilMeetingsContentPage } from "./pages/CouncilMeetingsContentPage";
import { CouncilProgramsContentPage } from "./pages/CouncilProgramsContentPage";
import { CouncilResourcesContentPage } from "./pages/CouncilResourcesContentPage";
import { DecisionPortalPage } from "./pages/DecisionPortalPage";
import { CouncilDecisionPortalContentPage } from "./pages/CouncilDecisionPortalContentPage";
import { SignatureEventComparisonReportPage } from "./pages/SignatureEventComparisonReportPage";
import { DocumentViewerPage } from "./pages/DocumentViewerPage";
import { FormsPage } from "./pages/FormsPage";
import { BudgetSubmissionPage } from "./pages/BudgetSubmissionPage";
import { ReimbursementRequestPage } from "./pages/ReimbursementRequestPage";
import { SocialMediaRequestPage } from "./pages/SocialMediaRequestPage";
import { CommitteeReportPage } from "./pages/CommitteeReportPage";
import { CouncilSubmissionsPage } from "./pages/CouncilSubmissionsPage";
import { MySubmissionsPage } from "./pages/MySubmissionsPage";
import { CouncilNotificationSettingsPage } from "./pages/CouncilNotificationSettingsPage";
import { ForumPage } from "./pages/ForumPage";
import { ForumTopicPage } from "./pages/ForumTopicPage";
import { CouncilMemberDirectoryPage } from "./pages/CouncilMemberDirectoryPage";

// Hash routing is the most reliable option for static hosting + Google Sites embedding
// (no server-side rewrite rules needed to handle deep links).
export const router = createHashRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "chapter-information", Component: ChapterInfoPage },
      { path: "meetings-delegates", Component: MeetingsPage },
      { path: "programs-events", Component: ProgramsPage },
      { path: "resources", Component: ResourcesPage },
      { path: "treasury", Component: TreasuryPage },
      { path: "decision-portal", Component: DecisionPortalPage },
      { path: "forum", Component: ForumPage },
      { path: "forum/:id", Component: ForumTopicPage },
      { path: "reports/signature-event-comparison", Component: SignatureEventComparisonReportPage },
      { path: "viewer", Component: DocumentViewerPage },
      { path: "forms", Component: FormsPage },
      { path: "forms/budget", Component: BudgetSubmissionPage },
      { path: "forms/reimbursement", Component: ReimbursementRequestPage },
      { path: "forms/social-media", Component: SocialMediaRequestPage },
      { path: "forms/committee-report", Component: CommitteeReportPage },
      { path: "forms/my", Component: MySubmissionsPage },
      { path: "figma-staging", Component: FigmaStagingPage },
      { path: "council-admin", Component: CouncilAdminPage },
      { path: "council-admin/compliance", Component: CouncilCompliancePage },
      { path: "council-admin/content", Component: CouncilContentManagerPage },
      { path: "council-admin/content/home", Component: CouncilHomeContentPage },
      { path: "council-admin/content/meetings", Component: CouncilMeetingsContentPage },
      { path: "council-admin/content/programs", Component: CouncilProgramsContentPage },
      { path: "council-admin/content/resources", Component: CouncilResourcesContentPage },
      { path: "council-admin/content/decision-portal", Component: CouncilDecisionPortalContentPage },
      { path: "council-admin/content/members", Component: CouncilMemberDirectoryPage },
      { path: "council-admin/notifications", Component: CouncilNotificationSettingsPage },
      { path: "council-admin/submissions", Component: CouncilSubmissionsPage },
    ],
  },
]);
