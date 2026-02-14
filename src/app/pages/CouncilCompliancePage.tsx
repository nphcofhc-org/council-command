import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Users,
  Award,
  Save,
  RefreshCw,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { fetchComplianceState, saveComplianceState } from "../data/admin-api";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { useCouncilSession } from "../hooks/use-council-session";

type TimelineItem = {
  id: string;
  title: string;
  deadline?: string;
  content: string;
  subDetails?: string[];
};

type TimelineSection = {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  description: string;
  items: TimelineItem[];
};

const timelineData: TimelineSection[] = [
  {
    id: "financial",
    title: "Financial Stability & Compliance",
    icon: <DollarSign className="h-6 w-6" />,
    color: "border-l-amber-500",
    description:
      "Demonstrate financial stability and adherence to statutory requirements.",
    items: [
      {
        id: "dues-payment",
        title: "Dues Payment",
        deadline: "March 15 (Local) / Jan 31 (National)",
        content:
          "Local Undergraduate/Graduate NPHC Councils are expected to pay annual dues to the NPHC Headquarters. Note: National dues are generally due by January 31st.",
      },
      {
        id: "bank-docs",
        title: "Bank Documentation",
        deadline: "March 1st",
        content:
          "A letter from the bank, on letterhead, is required. It must include specific verification details.",
        subDetails: [
          "The official name of the account, its Employer Identification Number (EIN) registered, the verifying account number, and the type of accounts held.",
          "Verification that the account has been and currently remains in good standing for the previous year.",
          "A list of the last four digits of any bank card(s) issued and the name of the person to whom it is issued.",
          "The names of the signatories currently on the account.",
        ],
      },
      {
        id: "financial-reporting",
        title: "Financial Reporting",
        deadline: "End of Fiscal Year",
        content:
          "Detailed fiscal year financial data is required. The fiscal year ending balance must match the preceding year's ending balance.",
        subDetails: [
          "Beginning balance.",
          "Itemized revenue items.",
          "Itemized expense items.",
          "Total revenue.",
          "Total expenses.",
          "Fiscal year ending balance.",
        ],
      },
      {
        id: "irs-status",
        title: "IRS and Fiscal Status",
        deadline: "Annual",
        content:
          "Reporting on IRS filing status and recognition type.",
        subDetails: [
          "Report whether the council has filed its IRS 990/990EZ/990N for the preceding fiscal year.",
          "Submit the council's IRS Recognition Type (e.g., 501(c)7).",
          "Upload a copy of the IRS 501 Determination Letter (if applicable).",
          "If the council uses a fiscal agent, that entity's information must be reported.",
        ],
      },
    ],
  },
  {
    id: "admin",
    title: "Administrative Compliance",
    icon: <FileText className="h-6 w-6" />,
    color: "border-l-slate-700",
    description:
      "Ensure general compliance and maintain current records via the NPHC Council Annual Report Form.",
    items: [
      {
        id: "bylaws",
        title: "Council Bylaws",
        deadline: "Annual Update",
        content:
          "Documentation regarding the governing documents of the council.",
        subDetails: [
          "Upload the most recent copy of the Council Bylaws.",
          "Report if bylaws were amended and approved by the National Parliamentarian during the reporting year.",
        ],
      },
      {
        id: "roster-contact",
        title: "Roster & Contact Information",
        deadline: "Ongoing",
        content:
          "Councils must confirm updates in The Gateway Portal.",
        subDetails: [
          "Confirm \"Updated All Council Profile Information\" in The Gateway Portal.",
          "Confirm \"Updated All Officer/Delegate/Member Chapter President Contact Information\" in the portal.",
          "Report on the number of active chapters and delegates/representatives in the council.",
          "Submit Executive Board member contact details.",
          "Submit Chapter President information.",
          "Submit Chapter Delegates/Representatives contact information.",
        ],
      },
      {
        id: "state-local",
        title: "State/Local Obligations",
        deadline: "Varies",
        content:
          "Confirmation that the council has completed its State/Local Reporting Obligations.",
      },
      {
        id: "logo",
        title: "Council Logo",
        deadline: "N/A",
        content:
          "Report if the council has a logo and if it has been approved by NPHC Headquarters (NPHCHQ).",
      },
    ],
  },
  {
    id: "programmatic",
    title: "Programmatic Accountability",
    icon: <Users className="h-6 w-6" />,
    color: "border-l-emerald-600",
    description:
      "Collect extensive metrics and narratives for the past year via the Annual Report Form.",
    items: [
      {
        id: "core-metrics",
        title: "Core Metrics",
        deadline: "Annual Report",
        content:
          "Quantitative data regarding council impact.",
        subDetails: [
          "Total # of Service Hours Performed.",
          "Total Funds ($) Raised.",
          "Total # of Scholarships Given.",
          "Total Amount ($) of Scholarships Given.",
        ],
      },
      {
        id: "program-events",
        title: "Program and Event Reporting",
        deadline: "Annual Report",
        content:
          "Reporting on initiatives and signature events.",
        subDetails: [
          "Report participation in initiatives like Divine9Votes.",
          "Report on other Social Action activities (confirm submission of Social Action Report).",
          "Report on signature events including: Description, Attendance figures, Funds raised, Community service hours performed.",
          "Optionally upload event photos/documents.",
        ],
      },
      {
        id: "strategic-review",
        title: "Strategic Review",
        deadline: "Annual Report",
        content:
          "Reflective analysis of the council's operational year.",
        subDetails: [
          "Reflect on goals set at the beginning of the year.",
          "Evaluate the status of those goals.",
          "Detail challenges faced.",
          "Summarize lessons learned.",
        ],
      },
      {
        id: "recognition",
        title: "Awards & Recognition",
        deadline: "Annual Report",
        content:
          "Report awards received by the council and awards earned by individual chapters or members.",
      },
    ],
  },
];

const STORAGE_KEY = "nphc-council-compliance-checklist";

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mb-6 h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
      <div
        className="h-4 rounded-full bg-gradient-to-r from-slate-800 to-slate-600 transition-all duration-700 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function DetailToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-2 flex items-center text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
    >
      {isOpen ? "Hide Details" : "View Full Requirements"}
      {isOpen ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
    </button>
  );
}

function ChecklistItem({
  item,
  isChecked,
  onToggle,
}: {
  item: TimelineItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`relative mb-4 rounded-lg border bg-white p-4 shadow-sm transition-all duration-300 ${
        isChecked ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(item.id)}
          className={`mt-1 flex-shrink-0 transition-all duration-200 ${
            isChecked ? "text-green-600" : "text-gray-300 hover:text-gray-400"
          }`}
        >
          {isChecked ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
        </button>

        <div className="flex-grow">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4
              className={`text-lg font-bold ${
                isChecked ? "text-slate-600 line-through decoration-slate-400" : "text-slate-800"
              }`}
            >
              {item.title}
            </h4>
            {item.deadline && (
              <span className="flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                <Calendar className="mr-1 h-3 w-3" />
                {item.deadline}
              </span>
            )}
          </div>

          <p className={`mt-1 text-sm leading-relaxed ${isChecked ? "text-gray-400" : "text-gray-600"}`}>
            {item.content}
          </p>

          {item.subDetails && (
            <>
              <DetailToggle isOpen={showDetails} onClick={() => setShowDetails(!showDetails)} />
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  showDetails ? "mt-3 max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                  <ul className="ml-4 list-outside list-disc space-y-1">
                    {item.subDetails.map((detail, idx) => (
                      <li key={idx} className="leading-snug">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  section,
  checkedItems,
  toggleItem,
}: {
  section: TimelineSection;
  checkedItems: Record<string, boolean>;
  toggleItem: (id: string) => void;
}) {
  const totalItems = section.items.length;
  const completedItems = section.items.filter((item) => checkedItems[item.id]).length;
  const isComplete = totalItems === completedItems;

  return (
    <div className={`relative mb-10 border-l-4 pl-6 ${section.color}`}>
      <div
        className={`absolute -left-[11px] -top-1 h-5 w-5 rounded-full border-4 border-white ${
          isComplete ? "bg-green-500" : "bg-slate-300"
        }`}
      />

      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700">{section.icon}</div>
          <h2 className="text-2xl font-bold text-slate-800">{section.title}</h2>
        </div>
        <p className="max-w-2xl text-sm text-slate-500">{section.description}</p>
      </div>

      <div className="grid gap-2">
        {section.items.map((item) => (
          <ChecklistItem key={item.id} item={item} isChecked={!!checkedItems[item.id]} onToggle={toggleItem} />
        ))}
      </div>
    </div>
  );
}

export function CouncilCompliancePage() {
  const { session, loading: sessionLoading } = useCouncilSession();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncMode, setSyncMode] = useState<"checking" | "cloud" | "local">("checking");
  const [dirtyTick, setDirtyTick] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;

    let cancelled = false;

    const loadState = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setCheckedItems(JSON.parse(saved));
        } catch {
          setCheckedItems({});
        }
      }

      if (!session.isCouncilAdmin) {
        setSyncMode("local");
        setIsLoaded(true);
        return;
      }

      try {
        const cloudState = await fetchComplianceState();
        if (cancelled) return;
        setCheckedItems(cloudState.checkedItems);
        setLastSavedAt(cloudState.updatedAt);
        setSyncMode("cloud");
        setSyncError(null);
      } catch (error) {
        if (cancelled) return;
        setSyncMode("local");
        setSyncError(error instanceof Error ? error.message : "Cloud sync unavailable");
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    };

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [session.isCouncilAdmin, sessionLoading]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
    }
  }, [checkedItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded || syncMode !== "cloud" || dirtyTick === 0 || !session.isCouncilAdmin) return;

    const timeout = window.setTimeout(() => {
      void saveComplianceState(checkedItems)
        .then((savedState) => {
          setLastSavedAt(savedState.updatedAt);
          setSyncError(null);
        })
        .catch((error) => {
          setSyncMode("local");
          setSyncError(error instanceof Error ? error.message : "Cloud sync unavailable");
        });
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [checkedItems, dirtyTick, isLoaded, session.isCouncilAdmin, syncMode]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setDirtyTick((prev) => prev + 1);
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to clear all progress?")) {
      setCheckedItems({});
      setDirtyTick((prev) => prev + 1);
    }
  };

  const saveStatusText = useMemo(() => {
    if (syncMode === "cloud") {
      return "Progress syncs to council cloud storage";
    }
    if (syncMode === "local") {
      return "Progress is saved on this browser only";
    }
    return "Checking council cloud sync...";
  }, [syncMode]);

  const totalTasks = timelineData.reduce((acc, section) => acc + section.items.length, 0);
  const completedTasks = Object.values(checkedItems).filter(Boolean).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <CouncilLeaderGate>
      <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-900">
        <div className="relative overflow-hidden bg-slate-900 px-6 pb-24 pt-12 text-slate-900 md:px-12">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-slate-800 opacity-50" />
          <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-amber-500 opacity-10" />

          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="mb-4">
              <Link to="/council-admin" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Council Admin
              </Link>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl">
                  NPHC Council Compliance
                </h1>
                <p className="max-w-xl text-lg text-slate-300">
                  Interactive audit checklist for local chapter annual reporting, financial stability, and programmatic review.
                </p>
              </div>
              <div className="hidden text-right md:block">
                <div className="mb-1 text-xs uppercase tracking-widest text-slate-400">Current Status</div>
                <div className="text-3xl font-bold text-amber-400">{percentage}% Complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto -mt-16 max-w-4xl px-4 md:px-8">
          <div className="rounded-xl bg-white p-6 shadow-xl md:p-10">
            <div className="mb-8">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-sm font-semibold text-slate-500">Overall Progress</span>
                <span className="text-sm font-bold text-slate-800 md:hidden">{percentage}%</span>
              </div>
              <ProgressBar progress={percentage} />

              <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  {saveStatusText}
                </span>
                <button
                  onClick={resetProgress}
                  className="flex items-center gap-1 transition-colors hover:text-red-500"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset Checklist
                </button>
              </div>
              {lastSavedAt ? (
                <p className="mt-2 text-xs text-slate-400">Last synced: {new Date(lastSavedAt).toLocaleString()}</p>
              ) : null}
              {syncError ? <p className="mt-1 text-xs text-red-600">Sync issue: {syncError}</p> : null}
            </div>

            <div className="space-y-2">
              {timelineData.map((section) => (
                <Section key={section.id} section={section} checkedItems={checkedItems} toggleItem={toggleItem} />
              ))}
            </div>

            {percentage === 100 && (
              <div className="mt-8 rounded-lg bg-slate-900 p-6 text-center text-slate-900">
                <Award className="mx-auto mb-3 h-12 w-12 text-amber-400" />
                <h3 className="mb-2 text-2xl font-bold">Compliance Audit Complete</h3>
                <p className="text-slate-300">
                  All documentation requirements have been marked as ready for submission.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-slate-400">
          <p>Information based on NPHC Council Annual Report requirements.</p>
        </div>
      </div>
    </CouncilLeaderGate>
  );
}
