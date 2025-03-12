//medicine.tsx

"use client";

import React, { useState, useEffect } from "react";
import { VStack, Heading, Button, useToast, Box, Text } from "@chakra-ui/react";
import MedicineList from "./components/medicine/medicineList";
import AddMedicine from "./components/medicine/addMedicine";
import SearchBar from "./components/searchBar";
import { Medicine, MainComponentProps } from "./types";
import PieChart from "./components/medicine/pieChart";
import RadarChart from "./components/medicine/radarChart";

const MainComponent: React.FC<MainComponentProps> = ({
  medicines,
  setMedicines,
  section,
}) => {
  const [search, setSearch] = useState<string>("");
  const [sideEffects, setSideEffects] = useState<Record<string, any>>({});
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

  // 🔹 Fetch side effects from /api/scrape.ts
  const fetchSideEffects = async () => {
    setLoading(true);
    const newSideEffects: Record<string, any> = {};

    for (const medicine of medicines) {
      const formattedName = medicine.body.toLowerCase().replace(/\s+/g, "-"); // Format medicine name
      const apiUrl = `/api/scrape?url=https://www.drugs.com/sfx/${formattedName}-side-effects.html`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok)
          throw new Error(`Error fetching data for ${medicine.body}`);

        const data = await response.json();
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
              {Object.entries(sideEffects).map(([medName, effects]) => (
                <Box
                  key={medName}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  w="100%"
                >
                  <Heading size="sm" mb={2} textAlign="left">
                    {medName}
                  </Heading>
                  {effects.map((effect: any) => (
                    <Box
                      key={effect.categoryId}
                      p={2}
                      mb={2}
                      borderBottom="1px solid #ccc"
                    >
                      <Text fontWeight="bold">
                        {effect.category} ({effect.occurrence}% occurrence)
                      </Text>
                      <ul style={{ paddingLeft: "20px" }}>
                        {effect.symptoms.map(
                          (symptom: string, index: number) => (
                            <li key={index}>
                              <Text fontSize="sm">{symptom}</Text>
                            </li>
                          )
                        )}
                      </ul>
                    </Box>
                  ))}
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
                <RadarChart data={Object.values(sideEffects)} color={colors} />
                <PieChart data={Object.values(sideEffects)} color={colors} />
              </div>
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default MainComponent;
