/**
 * Reusable status badge styling used across multiple pages.
 * Maps status strings (from data) to consistent color treatments.
 */

import { Badge } from "./ui/badge";

const statusStyles: Record<string, string> = {
  // Green — positive / complete
  Active:     "bg-emerald-500/15 text-emerald-200 border-emerald-400/25",
  Current:    "bg-emerald-500/15 text-emerald-200 border-emerald-400/25",
  Submitted:  "bg-emerald-500/15 text-emerald-200 border-emerald-400/25",
  Completed:  "bg-emerald-500/15 text-emerald-200 border-emerald-400/25",
  Final:      "bg-emerald-500/15 text-emerald-200 border-emerald-400/25",
  Open:       "bg-emerald-500/15 text-emerald-200 border-emerald-400/25",

  // Blue — informational
  "In Progress": "bg-sky-500/15 text-sky-200 border-sky-400/25",

  // Amber / Orange — attention needed
  Draft:         "bg-amber-500/15 text-amber-200 border-amber-400/25",
  Pending:       "bg-amber-500/15 text-amber-200 border-amber-400/25",
  "Coming Soon": "bg-white/10 text-white/70 border-white/15",

  // Red — high priority
  High:        "bg-rose-500/15 text-rose-200 border-rose-400/25",

  // Yellow — medium priority
  Medium:      "bg-amber-500/15 text-amber-200 border-amber-400/25",

  // Gray — neutral / archived
  Filed:        "bg-white/10 text-white/70 border-white/15",
  Low:          "bg-white/10 text-white/70 border-white/15",
  "Not Started": "bg-white/10 text-white/70 border-white/15",
  Closed:       "bg-white/10 text-white/70 border-white/15",
};

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
  className?: string;
}

export function StatusBadge({ status, variant, className = "" }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-white/10 text-white/70 border-white/15";

  if (variant === "outline") {
    // For outline variant, use border color + text color only
    const outlineStyles: Record<string, string> = {
      "In Progress": "border-sky-400/40 text-sky-200",
      Pending:       "border-amber-400/40 text-amber-200",
      "Not Started": "border-white/20 text-white/60",
    };
    const outlineStyle = outlineStyles[status] || "border-white/20 text-white/60";
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
