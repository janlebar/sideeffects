//medicine.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  VStack,
  Heading,
  Button,
  useToast,
  Box,
  Text,
  Badge,
} from "@chakra-ui/react";
import MedicineList from "./components/medicine/medicineList";
import AddMedicine from "./components/medicine/addMedicine";
import SearchBar from "./components/searchBar";
import { Medicine, MainComponentProps, SideEffectsResult } from "./types";
import AdverseEffectsOverview from "./components/medicine/adverseEffectsOverview";

// Example medicines preloaded on first run so a new user sees how the app
// works. They behave like normal medicines and can be deleted/replaced.
const EXAMPLE_MEDICINES: Medicine[] = [
  { id: "example-aspirin", body: "Aspirin" },
  { id: "example-viagra", body: "Viagra" },
];

const MainComponent: React.FC<MainComponentProps> = ({
  medicines,
  setMedicines,
  section,
}) => {
  const [search, setSearch] = useState<string>("");
  const [sideEffects, setSideEffects] = useState<
    Record<string, SideEffectsResult>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const [viewMode, setViewMode] = useState<"overview" | "details">("overview");

  const didMount = useRef(false);
  const didInitialFetch = useRef(false);

  // Load saved medicines, or seed the example set on the very first run.
  useEffect(() => {
    const stored = localStorage.getItem(`medicine_${section}`);
    const seeded = localStorage.getItem("example_seeded");
    if (stored) {
      setMedicines(JSON.parse(stored));
    } else if (!seeded) {
      localStorage.setItem("example_seeded", "1");
      setMedicines(EXAMPLE_MEDICINES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Persist medicines on every change after the initial mount.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    localStorage.setItem(`medicine_${section}`, JSON.stringify(medicines));
  }, [medicines, section]);

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

  return (
    <VStack p={4} align="stretch">
      <Heading mb={2} fontSize="xl">
        Adverse effects
      </Heading>
      <SearchBar search={search} setSearch={setSearch} />
      <AddMedicine addMedicine={addMedicine} />
      <Button
        className=" font-bold py-2 px-4 rounded-md ml-5 mt-1 mr-10 border border-blue-400"
        mt={2}
        onClick={() => fetchSideEffects(medicines)}
        isLoading={loading}
        alignSelf="flex-start"
      >
        Find Side Effects
      </Button>
      <MedicineList medicine={filteredList} deleteMedicine={deleteMedicine} />

      {/* 🔹 Side Effects Display */}
      {Object.keys(sideEffects).length > 0 && (
        <VStack mt={4} p={4} borderWidth="1px" borderRadius="lg" w="100%" align="stretch">
          {/* 🔹 View toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              colorScheme={viewMode === "overview" ? "blue" : "gray"}
              onClick={() => setViewMode("overview")}
            >
              Overview
            </Button>
            <Button
              size="sm"
              colorScheme={viewMode === "details" ? "blue" : "gray"}
              onClick={() => setViewMode("details")}
            >
              Details
            </Button>
            <Badge ml="auto" colorScheme="green">
              {Object.values(sideEffects).filter(
                (r) => r.source === "database"
              ).length}{" "}
              cached
            </Badge>
          </div>

          {/* 🔹 Overview (comparison bars) */}
          {viewMode === "overview" && (
            <AdverseEffectsOverview sideEffects={sideEffects} />
          )}

          {/* 🔹 Details (full per-drug data — nothing dismissed) */}
          {viewMode === "details" && (
            <VStack w="100%" align="stretch">
              {Object.entries(sideEffects).map(([medName, result]) => (
                <Box
                  key={medName}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  w="100%"
                >
                  <Heading size="sm" mb={2} textAlign="left" className="capitalize">
                    {medName}
                    <Badge
                      ml={2}
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
                  </Heading>

                  {result.categories.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      No side-effect data found.
                    </Text>
                  ) : (
                    result.categories.map((cat) => (
                      <Box
                        key={cat.category}
                        p={2}
                        mb={2}
                        borderBottom="1px solid #ccc"
                      >
                        <Text fontWeight="bold">{cat.category}</Text>
                        {cat.effects.map((effect, i) => (
                          <Box key={`${effect.frequency}-${i}`} mt={1}>
                            <Text fontSize="sm" fontWeight="semibold">
                              {effect.frequency}
                              {effect.percentage
                                ? ` (${effect.percentage})`
                                : ""}
                            </Text>
                            <ul style={{ paddingLeft: "20px" }}>
                              {effect.symptoms.map((symptom, index) => (
                                <li key={index}>
                                  <Text fontSize="sm">{symptom}</Text>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        ))}
                      </Box>
                    ))
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default MainComponent;
