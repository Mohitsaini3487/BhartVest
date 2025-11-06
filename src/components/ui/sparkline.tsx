// Inspired by Tremor's Spark component https://github.com/tremor/tremor/blob/main/src/components/spark-charts/SparkAreaChart.tsx

"use client";
import React from "react";
import { Area, AreaChart, Dot, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface SparklineChartProps extends React.ComponentProps<"div"> {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  autoMinValue?: boolean;
  minValue?: number;
  maxValue?: number;
  connectNulls?: boolean;
  type?: "default" | "pattern";
}

const SparklineChart = React.forwardRef<HTMLDivElement, SparklineChartProps>(
  (props, ref) => {
    const {
      data = [],
      categories = [],
      index,
      colors = [],
      autoMinValue = false,
      minValue,
      maxValue,
      connectNulls = false,
      className,
      type = "default",
      ...other
    } = props;
    const category = categories[0];
    const color = colors[0] || "hsl(var(--chart-1))";

    const patternId = `pattern-${category.replace(/[^a-zA-Z0-9]/g, "")}`;

    return (
      <div ref={ref} className={cn("h-12 w-28", className)} {...other}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 2,
              left: 2,
              bottom: 0,
            }}
          >
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              content={({ active, payload, label }) =>
                active && payload && payload.length ? (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="text-sm text-muted-foreground">
                        {formatCurrency(payload[0].value as number)}
                    </div>
                  </div>
                ) : null
              }
            />
            <defs>
              {type === "pattern" ? (
                <pattern
                  id={patternId}
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="4" height="8" fill={color} fillOpacity={0.2}></rect>
                </pattern>
              ) : null}
            </defs>

            <XAxis hide dataKey={index} />

            <Area
              name={category}
              type="monotone"
              dataKey={category}
              stroke={color}
              fill={type === "pattern" ? `url(#${patternId})` : color}
              fillOpacity={type === "pattern" ? 1 : 0.2}
              strokeWidth={2}
              connectNulls={connectNulls}
              dot={false}
              activeDot={(props) => (
                <Dot
                  {...props}
                  r={4}
                  className="fill-background"
                  stroke={color}
                  strokeWidth={2}
                />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  },
);

SparklineChart.displayName = "SparklineChart";

const Sparkline = SparklineChart;

export { Sparkline, SparklineChart, type SparklineChartProps };

    