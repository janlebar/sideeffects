//medicine.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, useToast, Badge } from "@chakra-ui/react";
import MedicineList from "./components/medicine/medicineList";
import AddMedicine from "./components/medicine/addMedicine";
import SearchBar from "./components/searchBar";
import { Medicine, MainComponentProps, SideEffectsResult } from "./types";
import AdverseEffectsOverview from "./components/medicine/adverseEffectsOverview";

const MainComponent: React.FC<MainComponentProps> = ({
  medicines,
  setMedicines,
}) => {
  const [search, setSearch] = useState<string>("");
  const [sideEffects, setSideEffects] = useState<
    Record<string, SideEffectsResult>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const [viewMode, setViewMode] = useState<"overview" | "details">("overview");

  const didInitialFetch = useRef(false);

  const fetchSideEffects = async (list: Medicine[]) => {
    setLoading(true);
    const results: Record<string, SideEffectsResult> = {};

    await Promise.all(
      list.map(async (medicine) => {
        try {
          const response = await fetch(
            `/api/side-effects?medicine=${encodeURIComponent(medicine.body)}`
          );
          if (!response.ok)
            throw new Error(`Error fetching data for ${medicine.body}`);
          results[medicine.body] = await response.json();
        } catch (error) {
          toast({
            title: `Failed to fetch side effects for ${medicine.body}`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
    );

    setSideEffects(results);
    setLoading(false);
  };

  // Auto-fetch side effects on first load (uses the seeded examples).
  useEffect(() => {
    if (!didInitialFetch.current && medicines.length > 0) {
      didInitialFetch.current = true;
      fetchSideEffects(medicines);
      setViewMode("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicines]);

  function deleteMedicine(id: string) {
    setMedicines(medicines.filter((medicine) => medicine.id !== id));
  }

  function addMedicine(medicine: Medicine) {
    setMedicines([...medicines, medicine]);
  }

  const filteredList = medicines.filter((medicine) =>
    medicine.body.toLowerCase().includes(search.toLowerCase())
  );

  const cachedCount = Object.values(sideEffects).filter(
    (r) => r.source === "database"
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      {/* Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar search={search} setSearch={setSearch} />
          <Button
            size="sm"
            colorScheme="blue"
            className="sm:ml-auto"
            onClick={() => fetchSideEffects(medicines)}
            isLoading={loading}
          >
            Find Side Effects
          </Button>
        </div>

        <div className="mt-4">
          <AddMedicine addMedicine={addMedicine} />
        </div>

        <div className="mt-4">
          <MedicineList medicine={filteredList} deleteMedicine={deleteMedicine} />
        </div>
      </div>

      {/* Side effects */}
      {Object.keys(sideEffects).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode("overview")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === "overview"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode("details")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === "details"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Details
              </button>
            </div>
            <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {cachedCount} cached
            </span>
          </div>

          {viewMode === "overview" && (
            <AdverseEffectsOverview sideEffects={sideEffects} />
          )}

          {viewMode === "details" && (
            <div className="space-y-3">
              {Object.entries(sideEffects).map(([medName, result]) => (
                <div
                  key={medName}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-sm font-semibold capitalize text-slate-800">
                      {medName}
                    </h3>
                    <Badge
                      colorScheme={
                        result.source === "database"
                          ? "green"
                          : result.source === "scraped"
                          ? "orange"
                          : "gray"
                      }
                    >
                      {result.source === "database"
                        ? "cached"
                        : result.source === "scraped"
                        ? "live"
                        : "no data"}
                    </Badge>
                  </div>

                  {result.categories.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No side-effect data found.
                    </p>
                  ) : (
                    result.categories.map((cat) => (
                      <div
                        key={cat.category}
                        className="border-b border-slate-100 py-2 last:border-0"
                      >
                        <p className="text-sm font-semibold text-slate-700">
                          {cat.category}
                        </p>
                        {cat.effects.map((effect, i) => (
                          <div key={`${effect.frequency}-${i}`} className="mt-1">
                            <p className="text-xs font-medium text-slate-500">
                              {effect.frequency}
                              {effect.percentage
                                ? ` (${effect.percentage})`
                                : ""}
                            </p>
                            <ul className="ml-4 list-disc text-sm text-slate-700">
                              {effect.symptoms.map((symptom, index) => (
                                <li key={index}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MainComponent;
