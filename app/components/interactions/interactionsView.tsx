"use client";

import React, { useState, useEffect } from "react";
import { FaTimes, FaExchangeAlt } from "react-icons/fa";
import { Medicine } from "@/app/types";

interface InteractionsViewProps {
  medicines: Medicine[];
}

export default function InteractionsView({ medicines }: InteractionsViewProps) {
  const [names, setNames] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/medicine-names")
      .then((r) => r.json())
      .then((d) => setNames(d.names ?? []))
      .catch(() => setNames([]));
  }, []);

  const suggestions =
    query.trim().length > 0
      ? names
          .filter(
            (n) =>
              n.toLowerCase().includes(query.toLowerCase()) &&
              !selected.includes(n)
          )
          .slice(0, 8)
      : [];

  const add = (name: string) => {
    if (!selected.includes(name)) setSelected([...selected, name]);
    setQuery("");
  };
  const remove = (name: string) =>
    setSelected(selected.filter((n) => n !== name));

  const check = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: selected }),
      });
      const data = await res.json();
      setResult(data.response || data.error || "No response");
    } catch {
      setResult("Error checking interactions.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          Search for a medication...
        </label>

        <div className="relative mt-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medications..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => add(s)}
                    className="w-full px-3 py-2 text-left text-sm capitalize hover:bg-slate-100"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {medicines.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your medicines
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              {medicines.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => add(m.body)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 capitalize hover:border-blue-300 hover:text-brand-blue"
                >
                  + {m.body}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Select at least 2 medications to begin.
        </p>

        <div className="mt-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Selected
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {selected.length === 0 && (
              <span className="text-sm text-slate-400">None</span>
            )}
            {selected.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-brand-blue capitalize"
              >
                {s}
                <button
                  type="button"
                  aria-label={`Remove ${s}`}
                  onClick={() => remove(s)}
                  className="text-blue-400 hover:text-red-500"
                >
                  <FaTimes className="text-xs" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={check}
          disabled={selected.length < 2 || loading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaExchangeAlt />
          {loading ? "Checking..." : "Check Interaction"}
        </button>
      </div>

      {(loading || result) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-blue" />
              Checking for an interaction...
            </p>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
