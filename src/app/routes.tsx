import { createHashRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage";
import { ChapterInfoPage } from "./pages/ChapterInfoPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { CouncilAdminPage } from "./pages/CouncilAdminPage";

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
      { path: "council-admin", Component: CouncilAdminPage },
    ],
  },
]);
