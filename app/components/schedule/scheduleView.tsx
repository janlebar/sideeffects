"use client";

import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import { Medicine } from "@/app/types";

interface ScheduleViewProps {
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function ScheduleView({
  medicines,
  setMedicines,
}: ScheduleViewProps) {
  const [taken, setTaken] = useState<Record<string, boolean>>({});
  const [newTime, setNewTime] = useState<Record<string, string>>({});
  const date = todayKey();

  useEffect(() => {
    const stored = localStorage.getItem("schedule_taken");
    if (stored) {
      try {
        setTaken(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const saveTaken = (next: Record<string, boolean>) => {
    setTaken(next);
    localStorage.setItem("schedule_taken", JSON.stringify(next));
  };

  const doseKey = (id: string, time: string) => `${id}|${date}|${time}`;

  const update = (id: string, patch: Partial<Medicine>) =>
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );

  const addTime = (id: string) => {
    const time = newTime[id];
    if (!time) return;
    const m = medicines.find((x) => x.id === id);
    if (!m) return;
    const times = Array.from(new Set([...(m.times ?? []), time])).sort();
    update(id, { times });
    setNewTime({ ...newTime, [id]: "" });
  };

  const removeTime = (id: string, time: string) => {
    const m = medicines.find((x) => x.id === id);
    if (!m) return;
    update(id, { times: (m.times ?? []).filter((t) => t !== time) });
  };

  const toggleTaken = (id: string, time: string) => {
    const k = doseKey(id, time);
    const next = { ...taken };
    if (next[k]) delete next[k];
    else next[k] = true;
    saveTaken(next);
  };

  if (!medicines.length) {
    return (
      <p className="text-sm text-slate-400">
        Add medicines (in Adverse Effects) to build a schedule.
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {medicines.map((m) => {
        const times = (m.times ?? []).slice().sort();
        return (
          <div
            key={m.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-semibold capitalize text-slate-800">
                {m.body}
              </h3>
              <input
                value={m.dose ?? ""}
                placeholder="Dose (e.g. 500mg)"
                onChange={(e) => update(m.id, { dose: e.target.value })}
                className="ml-auto w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Scheduled times
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {times.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {t}
                    <button
                      type="button"
                      aria-label={`Remove ${t}`}
                      onClick={() => removeTime(m.id, t)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
                {times.length === 0 && (
                  <span className="text-sm text-slate-400">No times set</span>
                )}
                <input
                  type="time"
                  value={newTime[m.id] ?? ""}
                  onChange={(e) =>
                    setNewTime({ ...newTime, [m.id]: e.target.value })
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => addTime(m.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 hover:border-blue-300 hover:text-brand-blue"
                >
                  <FaPlus className="text-xs" /> Add
                </button>
              </div>
            </div>

            {times.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Today&apos;s doses
                </div>
                {times.map((t) => {
                  const done = !!taken[doseKey(m.id, t)];
                  return (
                    <div
                      key={t}
                      className={`flex items-center gap-3 rounded-lg border p-2 ${
                        done
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200"
                      }`}
                    >
                      <span className="text-sm font-medium text-slate-600">
                        {t}
                      </span>
                      {done && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                          <FaCheck className="text-[10px]" /> Done
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleTaken(m.id, t)}
                        className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition ${
                          done
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-brand-blue hover:bg-blue-700"
                        }`}
                      >
                        {done ? (
                          <>
                            <FaCheck /> Taken (tap to undo)
                          </>
                        ) : (
                          "Tap to take"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
