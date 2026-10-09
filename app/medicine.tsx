//medicine.tsx

"use client";

import React, { useState, useEffect } from "react";
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
import PieChart from "./components/medicine/pieChart";
import RadarChart from "./components/medicine/radarChart";

// Extract the largest percentage from a label like "1% to 10%", "10% or more",
// "0.01% to 0.1%" or "less than 0.1%" for the (placeholder) charts.
function percentageToNumber(percentage?: string): number {
  if (!percentage) return 0;
  const numbers = percentage.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return numbers.length ? Math.max(...numbers) : 0;
}

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
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");

  const colors = [
    "#1748ffB3",
    "#17bcffB3",
    "#31c3ffB3",
    "#7ed9ffB3",
    "#98e1ffB3",
    "#002366B3", // Deep Navy Blue
    "#005f99B3", // Medium Persian Blue
    "#008ECCB3", // Vivid Sky Blue
    "#0F52BAB3", // Sapphire Blue
    "#1D2951B3", // Space Cadet Blue
    "#4682B4B3", // Steel Blue
    "#5D8AA8B3", // Air Force Blue
  ];

  useEffect(() => {
    const storedMedicines = localStorage.getItem(`medicine_${section}`);
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
    }
  }, [section, setMedicines]);

  useEffect(() => {
    if (medicines.length > 0) {
      localStorage.setItem(`medicine_${section}`, JSON.stringify(medicines));
    }
  }, [medicines, section]);

  function deleteMedicine(id: string) {
    setMedicines(medicines.filter((medicine) => medicine.id !== id));
  }

  function addMedicine(medicine: Medicine) {
    setMedicines([...medicines, medicine]);
  }

  // 🔹 Fetch side effects: uses the SQLite cache, falling back to a live scrape.
  const fetchSideEffects = async () => {
    setLoading(true);
    const newSideEffects: Record<string, SideEffectsResult> = {};

    for (const medicine of medicines) {
      const apiUrl = `/api/side-effects?medicine=${encodeURIComponent(
        medicine.body
      )}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok)
          throw new Error(`Error fetching data for ${medicine.body}`);

        const data: SideEffectsResult = await response.json();
        newSideEffects[medicine.body] = data;
      } catch (error) {
        toast({
          title: `Failed to fetch side effects for ${medicine.body}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }

    setSideEffects(newSideEffects);
    setLoading(false);
  };

  const filteredList = medicines.filter((medicine) =>
    medicine.body.toLowerCase().includes(search.toLowerCase())
  );

  // Flatten results into the shape the (placeholder) charts expect.
  const graphData = Object.entries(sideEffects).map(([medName, result]) =>
    result.categories.flatMap((cat) =>
      cat.effects.map((effect) => ({
        category: cat.category,
        occurrence: percentageToNumber(effect.percentage),
        medicine: medName,
      }))
    )
  );

  return (
    <VStack p={4}>
      <Heading mb={4} fontSize="xl">
        Medicine Tracker
      </Heading>
      <SearchBar search={search} setSearch={setSearch} />
      <AddMedicine addMedicine={addMedicine} />
      <Button
        className=" font-bold py-2 px-4 rounded-md ml-5 mt-1 mr-10 border border-blue-400"
        mt={4}
        onClick={fetchSideEffects}
        isLoading={loading}
      >
        Find Side Effects
      </Button>
      <MedicineList medicine={filteredList} deleteMedicine={deleteMedicine} />

      {/* 🔹 Side Effects Display */}
      {Object.keys(sideEffects).length > 0 && (
        <VStack mt={4} p={4} borderWidth="1px" borderRadius="lg" w="100%">
          <Heading size="md">Side Effects</Heading>

          {/* 🔹 Toggle Button */}
          <Button
            className=" font-bold py-2 px-4 rounded-md ml-5 mt-1 mr-10 border border-blue-400"
            onClick={() => setViewMode(viewMode === "list" ? "graph" : "list")}
            mb={4}
          >
            {viewMode === "list"
              ? "Switch to Graph View"
              : "Switch to List View"}
          </Button>

          {/* 🔹 List View */}
          {viewMode === "list" && Object.keys(sideEffects).length > 0 && (
            <VStack w="100%">
              {Object.entries(sideEffects).map(([medName, result]) => (
                <Box
                  key={medName}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  w="100%"
                >
                  <Heading size="sm" mb={2} textAlign="left">
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

          {/* 🔹 Graphical View (Placeholder) */}
          {viewMode === "graph" && (
            <Box p={4} w="100%" textAlign="center">
              <Text fontSize="lg" fontWeight="bold">
                Graphical representation.
              </Text>
              {/* 🚀 Placeholder for future graphs */}
              <div className="max-w-sm mx-auto">
                <RadarChart data={graphData} color={colors} />
                <PieChart data={graphData} color={colors} />
              </div>
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default MainComponent;
