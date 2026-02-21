/**
 * Reusable status badge styling used across multiple pages.
 * Maps status strings (from data) to consistent color treatments.
 */

import { Badge } from "./ui/badge";

const statusStyles: Record<string, string> = {
  // Green — positive / complete
  Active:     "bg-emerald-500/15 text-emerald-800 border-emerald-400/30",
  Current:    "bg-emerald-500/15 text-emerald-800 border-emerald-400/30",
  Submitted:  "bg-emerald-500/15 text-emerald-800 border-emerald-400/30",
  Completed:  "bg-emerald-500/15 text-emerald-800 border-emerald-400/30",
  Final:      "bg-emerald-500/15 text-emerald-800 border-emerald-400/30",
  Open:       "bg-emerald-500/15 text-emerald-800 border-emerald-400/30",

  // Blue — informational
  "In Progress": "bg-sky-500/15 text-sky-800 border-sky-400/30",

  // Amber / Orange — attention needed
  Draft:         "bg-amber-500/15 text-amber-800 border-amber-400/30",
  Pending:       "bg-amber-500/15 text-amber-800 border-amber-400/30",
  "Coming Soon": "bg-white/10 text-slate-600 border-black/15",

  // Red — high priority
  High:        "bg-rose-500/15 text-rose-800 border-rose-400/30",

  // Yellow — medium priority
  Medium:      "bg-amber-500/15 text-amber-800 border-amber-400/30",

  // Gray — neutral / archived
  Filed:        "bg-white/10 text-slate-600 border-black/15",
  Low:          "bg-white/10 text-slate-600 border-black/15",
  "Not Started": "bg-white/10 text-slate-600 border-black/15",
  Closed:       "bg-white/10 text-slate-600 border-black/15",
};

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
  className?: string;
}

export function StatusBadge({ status, variant, className = "" }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-white/10 text-slate-600 border-black/15";

  if (variant === "outline") {
    // For outline variant, use border color + text color only
    const outlineStyles: Record<string, string> = {
      "In Progress": "border-sky-400/40 text-sky-800",
      Pending:       "border-amber-400/40 text-amber-800",
      "Not Started": "border-black/15 text-slate-500",
    };
    const outlineStyle = outlineStyles[status] || "border-black/15 text-slate-500";
    return (
      <Badge variant="outline" className={`${outlineStyle} w-fit ${className}`}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge className={`${style} border w-fit ${className}`}>
      {status}
    </Badge>
  );
}
