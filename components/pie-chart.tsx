"use client";

import type { Activity, InputMode } from "@/types";
import { useState } from "react";
import type { PieLabelRenderProps } from "recharts";
import { Cell, Pie, PieChart, Sector } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PieChartComponentProps {
  activities: Activity[];
  inputMode: InputMode;
}

// Ensure activities with 0 value aren't passed to the chart to avoid display issues
const filterZeroValueActivities = (activities: Activity[]) => activities.filter(a => a.value > 0);

const RADIAN = Math.PI / 180;
interface CustomLabelProps extends PieLabelRenderProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: string;
  value: number;
  inputMode: InputMode;
}

const renderCustomizedLabel = (props: CustomLabelProps) => {
  const { cx, cy, midAngle, outerRadius, percent, name, value, inputMode } = props;

  if (percent * 100 < 3) { // PRD 5.2: hide slices < 3%
    return null;
  }

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";
  const unit = inputMode === 'hours' ? 'h' : '%';


  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="currentColor" fill="none" />
      <circle cx={ex} cy={ey} r={2} fill="currentColor" stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="currentColor" dy={".35em"}>
        {`${name} (${value}${unit})`}
      </text>
    </g>
  );
};

// Minimal interface for props passed to activeShape, as Recharts doesn't export PieSectorDataItem
interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  // Add other props like payload, percent, value, name if they become needed
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const { cx, cy, innerRadius, outerRadius = 0, startAngle, endAngle, fill } = props;
  // Added default for outerRadius to handle potential undefined
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Increase radius for active shape
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function PieChartComponent({ activities, inputMode }: PieChartComponentProps) {
  const chartData = filterZeroValueActivities(activities);
  const totalValue = chartData.reduce((sum, act) => sum + act.value, 0);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground">
        Add some activities to see the chart.
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="max-h-[400px]">
      <PieChart>
        <ChartTooltip
          cursor={true}
          content={
            <ChartTooltipContent
              formatter={(value, name, props) => {
                const percentage = totalValue === 0 ? 0 : (Number(value) / totalValue) * 100;
                const originalValue = props.payload?.value;
                const unit = inputMode === 'hours' ? 'h' : '%';
                return `${originalValue}${unit} (${percentage.toFixed(1)}%)`;
              }}
            />
          }
        />
        <Pie
          data={chartData}
          className="mx-0! aspect-auto!"
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120} // Adjust as needed
          innerRadius={0} // PRD 5.2: no donut
          labelLine={false} // Using custom label with leader lines
          label={(props) => renderCustomizedLabel({ ...(props as PieLabelRenderProps & { name: string, value: number, inputMode: InputMode }), inputMode, cx: props.cx as number, cy: props.cy as number, midAngle: props.midAngle as number, outerRadius: props.outerRadius as number, percent: props.percent as number })}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(undefined)}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} /> // PRD 5.2: Use <Cell> for colors
          ))}
        </Pie>
        {/* Legend - Basic version for now, PRD 5.2 requests legend below chart */}
        {/* <Legend /> */}
      </PieChart>
    </ChartContainer>
  );
} 
