"use client";

import React, { useMemo } from "react";
import { SideEffectsResult } from "../../types";
import { FaExclamationTriangle } from "react-icons/fa";

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
  const { medicines, rows, scaleMax } = useMemo(() => {
    const medicines = Object.keys(sideEffects);

    // symptomKey (lowercase) -> { display, per: medicine -> {num,label} }
    const grouped = new Map<
      string,
      { display: string; per: Map<string, SymptomCell> }
    >();

    for (const med of medicines) {
      for (const cat of sideEffects[med].categories) {
        for (const eff of cat.effects) {
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
    return { medicines, rows, scaleMax };
  }, [sideEffects]);

  const colorOf = (med: string) =>
    MED_COLORS[medicines.indexOf(med) % MED_COLORS.length];

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No side-effect data.</p>;
  }

  const gridCols = `repeat(${medicines.length}, minmax(150px, 1fr)) 1.4fr`;
  const gridMinWidth = medicines.length * 190 + 240;

  return (
    <div className="w-full">
      <h3 className="font-bold text-lg mb-3">Most frequent adverse effects</h3>

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
          <div className="text-xs font-bold text-gray-600">Adverse effect</div>
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <div
            key={row.display}
            className="grid items-center gap-x-3 px-3 py-1.5 border-b last:border-0 hover:bg-gray-50"
            style={{ gridTemplateColumns: gridCols, minWidth: gridMinWidth }}
          >
            {medicines.map((med) => {
              const cell = row.per.get(med);
              const num = cell?.num ?? 0;
              const widthPct = num > 0 ? Math.max(4, (num / scaleMax) * 100) : 3;
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
        Bars show the reported upper percentage per drug (&quot;n/r&quot; = not
        reported numerically).{" "}
        <FaExclamationTriangle className="inline text-red-500" /> marks effects
        flagged by a severity-keyword heuristic — an approximation, not a
        clinical grade.
      </p>
    </div>
  );
}
