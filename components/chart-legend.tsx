"use client";

import type { Activity } from "@/types";

interface ChartLegendComponentProps {
  activities: Activity[];
}

export function ChartLegendComponent({ activities }: ChartLegendComponentProps) {
  if (!activities || activities.length === 0) {
    return null; // Don't render legend if no activities
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => {
        // Filter out activities with 0 value from the legend as they are not on the chart
        if (activity.value <= 0) return null;
        return (
          <div key={activity.id} className="flex items-center space-x-2">
            <span
              className="inline-block h-4 w-4 rounded-sm border"
              style={{ backgroundColor: activity.color }}
            />
            <span className="text-sm text-muted-foreground truncate" title={activity.name}>
              {activity.name}
            </span>
          </div>
        );
      })}
    </div>
  );
} 
