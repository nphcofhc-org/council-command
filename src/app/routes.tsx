import { createHashRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage";
import { ChapterInfoPage } from "./pages/ChapterInfoPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { CouncilAdminPage } from "./pages/CouncilAdminPage";
import { CouncilCompliancePage } from "./pages/CouncilCompliancePage";
import { CouncilContentManagerPage } from "./pages/CouncilContentManagerPage";
import { FigmaStagingPage } from "./pages/FigmaStagingPage";
import { CouncilHomeContentPage } from "./pages/CouncilHomeContentPage";
import { CouncilMeetingsContentPage } from "./pages/CouncilMeetingsContentPage";
import { CouncilProgramsContentPage } from "./pages/CouncilProgramsContentPage";
import { CouncilResourcesContentPage } from "./pages/CouncilResourcesContentPage";
import { DecisionPortalPage } from "./pages/DecisionPortalPage";

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
      { path: "decision-portal", Component: DecisionPortalPage },
      { path: "figma-staging", Component: FigmaStagingPage },
      { path: "council-admin", Component: CouncilAdminPage },
      { path: "council-admin/compliance", Component: CouncilCompliancePage },
      { path: "council-admin/content", Component: CouncilContentManagerPage },
      { path: "council-admin/content/home", Component: CouncilHomeContentPage },
      { path: "council-admin/content/meetings", Component: CouncilMeetingsContentPage },
      { path: "council-admin/content/programs", Component: CouncilProgramsContentPage },
      { path: "council-admin/content/resources", Component: CouncilResourcesContentPage },
    ],
  },
]);
