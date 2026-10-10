//page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconButton, useColorMode } from "@chakra-ui/react";
import { GiMedicines } from "react-icons/gi";
import { RiRobot3Line } from "react-icons/ri";
import { FaSun, FaMoon, FaExchangeAlt, FaRegClock } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import MainComponent from "@/app/medicine";
import { Medicine } from "./types";
import AIComponent from "@/app/components/aidoctor/ai";
import InteractionsView from "@/app/components/interactions/interactionsView";
import ScheduleView from "@/app/components/schedule/scheduleView";

// Example medicines preloaded on first run so a new user sees how the app
// works. They behave like normal medicines and can be deleted/replaced.
const EXAMPLE_MEDICINES: Medicine[] = [
  { id: "example-aspirin", body: "Aspirin" },
  { id: "example-viagra", body: "Viagra" },
];

const STORAGE_KEY = "medicine_Medicine";

const NAV = [
  { key: "Medicine", label: "Adverse Effects", icon: GiMedicines },
  { key: "Interactions", label: "Interactions", icon: FaExchangeAlt },
  { key: "Schedule", label: "Schedule", icon: FaRegClock },
  { key: "AI", label: "AI Assistant", icon: RiRobot3Line },
] as const;

const medicineApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("Medicine");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const didMount = useRef(false);

  const { colorMode, toggleColorMode } = useColorMode();

  // Load saved medicines, or seed the example set on the very first run.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const seeded = localStorage.getItem("example_seeded");
    if (stored) {
      setMedicines(JSON.parse(stored));
    } else if (!seeded) {
      localStorage.setItem("example_seeded", "1");
      setMedicines(EXAMPLE_MEDICINES);
    }
  }, []);

  // Persist medicines on every change (add/delete, dose/times edits) after mount.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
  }, [medicines]);

  const activeLabel = NAV.find((n) => n.key === activeSection)?.label ?? "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            menuOpen ? "block" : "hidden"
          } fixed bottom-0 left-0 top-14 z-20 w-60 border-r border-slate-200 bg-white md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)] md:overflow-y-auto`}
        >
          <div className="flex h-full flex-col p-3">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </div>
            <nav className="space-y-1">
              {NAV.map(({ key, label, icon: Icon }) => {
                const active = activeSection === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveSection(key);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-blue-50 text-brand-blue"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="text-lg" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {menuOpen && (
          <div
            className="fixed inset-0 top-14 z-10 bg-black/20 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              {activeLabel}
            </h1>
            <IconButton
              className="ml-auto"
              aria-label="Toggle color mode"
              size="sm"
              variant="ghost"
              borderRadius="full"
              icon={colorMode === "light" ? <FaSun /> : <FaMoon />}
              onClick={toggleColorMode}
            />
          </div>

          <div className="px-4 pb-10 sm:px-6">
            {activeSection === "Medicine" && (
              <MainComponent
                medicines={medicines}
                setMedicines={setMedicines}
                section={activeSection}
              />
            )}
            {activeSection === "Interactions" && (
              <InteractionsView medicines={medicines} />
            )}
            {activeSection === "Schedule" && (
              <ScheduleView
                medicines={medicines}
                setMedicines={setMedicines}
              />
            )}
            {activeSection === "AI" && (
              <AIComponent
                input={[
                  { id: "1", body: "aspirin" },
                  { id: "2", body: "viagra" },
                ]}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default medicineApp;
