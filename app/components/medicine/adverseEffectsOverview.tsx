"use client";

import React, { useMemo } from "react";
import { SideEffectsResult } from "../../types";
import { FaExclamationTriangle } from "react-icons/fa";
import {
  DrugFrequencyPie,
  FrequencyComparisonChart,
  FREQ_BUCKETS,
  FREQ_COLORS,
} from "./drugCharts";

interface AdverseEffectsOverviewProps {
  sideEffects: Record<string, SideEffectsResult>;
}

const MED_COLORS = [
  "#e11d48", // rose
  "#2563eb", // blue
  "#059669", // emerald
  "#d97706", // amber
  "#7c3aed", // violet
  "#db2777", // pink
  "#0891b2", // cyan
  "#65a30d", // lime
];

// Keyword heuristic to flag potentially serious effects. This is an
// approximation, not a clinical classification. Word-boundary matching avoids
// accidental matches (e.g. "coma" inside "glaucoma").
const SERIOUS_PATTERNS = [
  /\banaphyl\w*/i,
  /\bangioedema\b/i,
  /\bshock\b/i,
  /\bmyocardial\s+infarction\b/i,
  /\bstroke\b/i,
  /\bseizure/i,
  /\bconvulsion/i,
  /\bcoma\b/i,
  /\brespiratory\s+depression\b/i,
  /\brenal\s+failure\b/i,
  /\bkidney\s+failure\b/i,
  /\bhepatic\s+failure\b/i,
  /\bliver\s+failure\b/i,
  /\bhepatotoxicity\b/i,
  /\baplastic\s+anemia\b/i,
  /\bagranulocytosis\b/i,
  /\bneutropenia\b/i,
  /\bpancytopenia\b/i,
  /\bstevens[- ]johnson/i,
  /\btoxic\s+epidermal/i,
  /\btorsade/i,
  /\bventricular\s+arrhythmia\b/i,
  /\bgi\s+bleeding\b/i,
  /\bgastrointestinal\s+bleeding\b/i,
  /\bhemorrhage\b/i,
  /\bhaemorrhage\b/i,
  /\bpancreatitis\b/i,
  /\bsuicidal\b/i,
  /\bsuicide\b/i,
  /\boverdose\b/i,
  /\bdeath\b/i,
  /\bfatal/i,
  /\brhabdomyolysis\b/i,
  /\bserotonin\s+syndrome\b/i,
  /\bneuroleptic\s+malignant\b/i,
];

function percentageToNumber(percentage?: string): number {
  if (!percentage) return 0;
  const numbers = percentage.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return numbers.length ? Math.max(...numbers) : 0;
}

function isSerious(symptom: string): boolean {
  return SERIOUS_PATTERNS.some((re) => re.test(symptom));
}

interface SymptomCell {
  num: number;
  label: string;
}
interface SymptomRow {
  display: string;
  per: Map<string, SymptomCell>;
  max: number;
  serious: boolean;
}

export default function AdverseEffectsOverview({
  sideEffects,
}: AdverseEffectsOverviewProps) {
  const { medicines, rows, scaleMax, perMedFreq, cmpLabels, shared } = useMemo(() => {
    // Sort for a stable column order (parallel fetches resolve in any order).
    const medicines = Object.keys(sideEffects).sort();

    // symptomKey (lowercase) -> { display, per: medicine -> {num,label} }
    const grouped = new Map<
      string,
      { display: string; per: Map<string, SymptomCell> }
    >();

    // Per-medicine counts per frequency bucket (each reported effect entry).
    const perMedFreq: Record<string, Record<string, number>> = {};

    for (const med of medicines) {
      const counts: Record<string, number> = {};
      for (const cat of sideEffects[med].categories) {
        for (const eff of cat.effects) {
          counts[eff.frequency] = (counts[eff.frequency] ?? 0) + 1;
          const num = percentageToNumber(eff.percentage);
          const label = eff.percentage ?? eff.frequency;
          for (const raw of eff.symptoms) {
            const display = raw.trim().replace(/\s+/g, " ");
            if (!display) continue;
            const key = display.toLowerCase();

            let group = grouped.get(key);
            if (!group) {
              group = { display, per: new Map() };
              grouped.set(key, group);
            }
            const prev = group.per.get(med);
            if (!prev || num > prev.num) group.per.set(med, { num, label });
          }
        }
      }
      perMedFreq[med] = counts;
    }

    const rows: SymptomRow[] = [...grouped.values()]
      .map((g) => ({
        display: g.display,
        per: g.per,
        max: Math.max(0, ...[...g.per.values()].map((v) => v.num)),
        serious: isSerious(g.display),
      }))
      .sort((a, b) => b.max - a.max || a.display.localeCompare(b.display));

    const scaleMax = Math.max(1, ...rows.map((r) => r.max));

    // Buckets that have any data across medicines (for the comparison chart).
    const cmpLabels = FREQ_BUCKETS.filter((b) =>
      medicines.some((m) => (perMedFreq[m][b] ?? 0) > 0)
    );

    // Shared effects: symptoms present in 2+ medicines (the overlap).
    const shared = [...grouped.values()]
      .filter((g) => g.per.size >= 2)
      .map((g) => ({ display: g.display, meds: [...g.per.keys()] }))
      .sort(
        (a, b) =>
          b.meds.length - a.meds.length || a.display.localeCompare(b.display)
      );

    return { medicines, rows, scaleMax, perMedFreq, cmpLabels, shared };
  }, [sideEffects]);

  const colorOf = (med: string) =>
    MED_COLORS[medicines.indexOf(med) % MED_COLORS.length];

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No side-effect data.</p>;
  }

  const gridCols = `repeat(${medicines.length}, minmax(150px, 1fr)) 1.4fr`;
  const gridMinWidth = medicines.length * 190 + 240;

  const pieFor = (med: string) => {
    const counts = perMedFreq[med];
    const labels = FREQ_BUCKETS.filter((b) => (counts[b] ?? 0) > 0);
    return {
      labels,
      counts: labels.map((b) => counts[b]),
      colors: labels.map((b) => FREQ_COLORS[b]),
    };
  };

  const cmpDatasets = medicines.map((med) => ({
    label: med,
    data: cmpLabels.map((b) => perMedFreq[med][b] ?? 0),
    backgroundColor: colorOf(med),
  }));

  return (
    <div className="w-full">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Left column: per-drug distribution + shared effects */}
        <div className="space-y-4">
          <div className="border rounded p-3 bg-white">
            <h4 className="font-bold text-sm mb-3">Per-drug effects</h4>
            <div className="space-y-4">
              {medicines.map((med) => {
                const pie = pieFor(med);
                return (
                  <div key={med} className="text-center">
                    <div
                      className="text-sm font-semibold capitalize mb-1"
                      style={{ color: colorOf(med) }}
                    >
                      {med}
                    </div>
                    <DrugFrequencyPie
                      labels={pie.labels}
                      counts={pie.counts}
                      colors={pie.colors}
                    />
                  </div>
                );
              })}
            </div>
            {/* severity color legend */}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
              {FREQ_BUCKETS.filter((b) => cmpLabels.includes(b)).map((b) => (
                <span
                  key={b}
                  className="text-[10px] text-gray-600 flex items-center gap-1"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: FREQ_COLORS[b] }}
                  />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {shared.length > 0 && (
            <div className="border rounded p-3 bg-white">
              <h4 className="font-bold text-sm mb-2">
                Shared effects ({shared.length})
              </h4>
              <ul className="text-xs text-gray-700 space-y-1 max-h-48 overflow-y-auto">
                {shared.map((s) => (
                  <li key={s.display} className="flex justify-between gap-2">
                    <span>{s.display}</span>
                    <span className="text-gray-400 shrink-0">
                      {s.meds.length} drugs
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column: frequency comparison chart + comparison bars */}
        <div className="space-y-4">
          <div className="border rounded p-3 bg-white">
            <h4 className="font-bold text-sm mb-2">Frequency comparison</h4>
            <FrequencyComparisonChart
              labels={cmpLabels}
              datasets={cmpDatasets}
            />
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">
              Most frequent adverse effects
            </h3>

            <div className="max-h-[540px] overflow-auto border rounded bg-white">
              {/* Header */}
              <div
                className="grid items-center gap-x-3 px-3 py-2 border-b bg-gray-50 sticky top-0 z-10"
                style={{ gridTemplateColumns: gridCols, minWidth: gridMinWidth }}
              >
                {medicines.map((med) => (
                  <div
                    key={med}
                    className="text-xs font-bold truncate capitalize"
                    style={{ color: colorOf(med) }}
                  >
                    {med}
                  </div>
                ))}
                <div className="text-xs font-bold text-gray-600">
                  Adverse effect
                </div>
              </div>

              {/* Rows */}
              {rows.map((row) => (
                <div
                  key={row.display}
                  className="grid items-center gap-x-3 px-3 py-1.5 border-b last:border-0 hover:bg-gray-50"
                  style={{
                    gridTemplateColumns: gridCols,
                    minWidth: gridMinWidth,
                  }}
                >
                  {medicines.map((med) => {
                    const cell = row.per.get(med);
                    const num = cell?.num ?? 0;
                    const widthPct =
                      num > 0 ? Math.max(4, (num / scaleMax) * 100) : 3;
                    return (
                      <div key={med} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 w-14 shrink-0">
                          {cell ? (num > 0 ? `> ${num}%` : "n/r") : "—"}
                        </span>
                        <div
                          className="h-3 rounded-sm"
                          style={{
                            width: `${widthPct}%`,
                            background: cell ? colorOf(med) : "#e5e7eb",
                          }}
                        />
                      </div>
                    );
                  })}
                  <div className="text-sm flex items-center gap-1.5">
                    {row.serious && (
                      <FaExclamationTriangle
                        className="text-red-500 shrink-0"
                        title="Flagged by a severity-keyword heuristic (approximation)"
                      />
                    )}
                    <span>{row.display}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Bars show the reported upper percentage per drug (&quot;n/r&quot;
              = not reported numerically).{" "}
              <FaExclamationTriangle className="inline text-red-500" /> marks
              effects flagged by a severity-keyword heuristic — an
              approximation, not a clinical grade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
