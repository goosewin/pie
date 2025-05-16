"use client";

import { Progress } from "@/components/ui/progress";
import type { Activity, InputMode } from "@/types";

interface ProgressBarComponentProps {
  activities: Activity[];
  inputMode: InputMode;
}

export function ProgressBarComponent({ activities, inputMode }: ProgressBarComponentProps) {
  const totalValue = activities.reduce((sum, act) => sum + (act.value || 0), 0);
  const quota = inputMode === "hours" ? 168 : 100;

  // Ensure progressValue is not negative and correctly capped at a bit more than 100% for visual overflow if needed.
  // For actual display, it usually doesn't exceed 100% in the bar itself unless styled to show overage.
  let progressPercentage = (totalValue / quota) * 100;
  progressPercentage = Math.max(0, progressPercentage); // Ensure non-negative

  let progressBarColorClass = "bg-primary"; // Default/Green for = quota
  let statusText = "";
  let statusTextColorClass = "text-foreground";

  if (totalValue < quota) {
    progressBarColorClass = "bg-amber-500"; // Amber for < quota (AC-6)
    statusText = "Under quota";
    statusTextColorClass = "text-amber-500";
  } else if (totalValue > quota) {
    progressBarColorClass = "bg-destructive"; // Red for > quota (AC-6)
    statusText = "Over quota!";
    statusTextColorClass = "text-destructive";
    // Cap the visual progress at 100% for the bar, even if totalValue exceeds quota.
    // The text will indicate the overage.
    // progressPercentage = 100; // Option: cap visual bar at 100% when over, or let it overflow a bit based on actual progressPercentage
  } else { // totalValue === quota
    statusText = "Quota met!";
    statusTextColorClass = "text-green-500";
    // progressBarColorClass remains bg-primary (or could be explicit green)
  }

  const displayValue = inputMode === "hours" ? `${totalValue.toFixed(1)}h` : `${totalValue.toFixed(1)}%`;
  const displayQuota = inputMode === "hours" ? `${quota}h` : `${quota}%`;

  return (
    <div className="p-4 border rounded-md bg-card space-y-3">
      <div className="flex justify-between items-center font-medium">
        <span className={`${statusTextColorClass}`}>{statusText}</span>
        <span>{displayValue} / {displayQuota}</span>
      </div>
      <Progress
        value={progressPercentage}
        className={`h-3 ${progressBarColorClass}`}
      />
      {/* PRD 5.1: Progress bar animates width for delight - shadcn/ui Progress has built-in transition */}
    </div>
  );
} 
