/**
 * Reusable status badge styling used across multiple pages.
 * Maps status strings (from data) to consistent color treatments.
 */

import { Badge } from "./ui/badge";

const statusStyles: Record<string, string> = {
  // Green — positive / complete
  Active:     "bg-green-50 text-green-700 border-green-200",
  Current:    "bg-green-50 text-green-700 border-green-200",
  Submitted:  "bg-green-50 text-green-700 border-green-200",
  Completed:  "bg-green-50 text-green-700 border-green-200",
  Final:      "bg-green-50 text-green-700 border-green-200",
  Open:       "bg-green-50 text-green-700 border-green-200",

  // Blue — informational
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",

  // Amber / Orange — attention needed
  Draft:       "bg-amber-50 text-amber-700 border-amber-200",
  Pending:     "bg-orange-50 text-orange-700 border-orange-200",
  "Coming Soon": "bg-gray-50 text-gray-500 border-gray-200",

  // Red — high priority
  High:        "bg-red-50 text-red-700 border-red-200",

  // Yellow — medium priority
  Medium:      "bg-amber-50 text-amber-700 border-amber-200",

  // Gray — neutral / archived
  Filed:       "bg-gray-50 text-gray-500 border-gray-200",
  Low:         "bg-gray-50 text-gray-500 border-gray-200",
  "Not Started": "bg-gray-50 text-gray-500 border-gray-200",
  Closed:      "bg-gray-50 text-gray-500 border-gray-200",
};

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
  className?: string;
}

export function StatusBadge({ status, variant, className = "" }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200";

  if (variant === "outline") {
    // For outline variant, use border color + text color only
    const outlineStyles: Record<string, string> = {
      "In Progress": "border-blue-300 text-blue-700",
      Pending:       "border-amber-300 text-amber-700",
      "Not Started": "border-gray-300 text-gray-500",
    };
    const outlineStyle = outlineStyles[status] || "border-gray-300 text-gray-500";
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
