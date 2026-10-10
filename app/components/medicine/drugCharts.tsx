"use client";

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// Frequency buckets in severity order, with an intuitive color gradient.
export const FREQ_BUCKETS = [
  "Very common",
  "Common",
  "Uncommon",
  "Rare",
  "Very rare",
  "Frequency not reported",
  "Postmarketing reports",
  "Reported",
];

export const FREQ_COLORS: Record<string, string> = {
  "Very common": "#dc2626",
  Common: "#f97316",
  Uncommon: "#facc15",
  Rare: "#38bdf8",
  "Very rare": "#818cf8",
  "Frequency not reported": "#9ca3af",
  "Postmarketing reports": "#a1a1aa",
  Reported: "#94a3b8",
};

function useChart(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: any,
  deps: React.DependencyList
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const chart = new Chart(canvas, config);
    return () => chart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

interface DrugFrequencyPieProps {
  labels: string[];
  counts: number[];
  colors: string[];
}

/** Small doughnut showing one drug's mix of effect frequencies. */
export function DrugFrequencyPie({
  labels,
  counts,
  colors,
}: DrugFrequencyPieProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useChart(
    ref,
    {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderColor: "#ffffff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "42%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    },
    [JSON.stringify(labels), JSON.stringify(counts)]
  );

  if (labels.length === 0) {
    return <div className="text-xs text-gray-400">No data</div>;
  }

  return (
    <div className="relative h-28 w-28 mx-auto">
      <canvas ref={ref} />
    </div>
  );
}

interface ComparisonDataset {
  label: string;
  data: number[];
  backgroundColor: string;
}

interface FrequencyComparisonChartProps {
  labels: string[];
  datasets: ComparisonDataset[];
}

/** Grouped bar chart comparing drugs across frequency buckets (the overlap). */
export function FrequencyComparisonChart({
  labels,
  datasets,
}: FrequencyComparisonChartProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useChart(
    ref,
    {
      type: "bar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12 } },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: { ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    },
    [JSON.stringify(labels), JSON.stringify(datasets)]
  );

  if (labels.length === 0) {
    return <div className="text-xs text-gray-400">No data</div>;
  }

  return (
    <div className="relative h-56 w-full">
      <canvas ref={ref} />
    </div>
  );
}
