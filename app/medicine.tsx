"use client";

import React, { useState, useEffect } from "react";
import { VStack, Heading, Button, useToast, Box, Text } from "@chakra-ui/react";
import MedicineList from "./components/medicine/medicineList";
import AddMedicine from "./components/medicine/addMedicine";
import SearchBar from "./components/searchBar";
import { Medicine, MainComponentProps } from "./types";
import PieChart from "./components/medicine/pieChart";
import RadarChart from "./components/medicine/radarChart";
import initSqlJs from "sql.js";

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

  // const fetchSideEffects = async () => {
  //   setLoading(true);
  //   const newSideEffects: Record<string, any> = {};

  //   try {
  //     const SQL = await initSqlJs({
  //       locateFile: (file) => `https://sql.js.org/dist/${file}`,
  //     });

  //     const response = await fetch("/medicine.sqlite");
  //     const buffer = await response.arrayBuffer();
  //     const db = new SQL.Database(new Uint8Array(buffer));

  //     for (const medicine of medicines) {
  //       const query =
  //         "SELECT * FROM medicine_data WHERE LOWER(medicine) = LOWER(?)";
  //       const stmt = db.prepare(query);
  //       stmt.bind([medicine.body.toLowerCase()]);

  //       const rows: any[] = [];

  //       while (stmt.step()) {
  //         rows.push(stmt.getAsObject());
  //       }
  //       stmt.free();

  //       console.log(`Raw Query Result for ${medicine.body}:`, rows);

  //       if (rows.length > 0) {
  //         newSideEffects[medicine.body] = rows.flatMap((row) => {
  //           return row.side_effects
  //             .split("\n")
  //             .map((line: string) => {
  //               const match = line.match(
  //                 /^(.*?)\s\(([\d.]+)% occurrence\):\s(.+)$/
  //               );
  //               if (match) {
  //                 return {
  //                   category: match[1].trim(),
  //                   occurrence: parseFloat(match[2]),
  //                   symptoms: match[3].split(", ").map((s) => s.trim()),
  //                 };
  //               }
  //               return null;
  //             })
  //             .filter(Boolean); // Remove null values
  //         });
  //       } else {
  //         // API fallback if no data is found in the database
  //         const formattedName = medicine.body
  //           .toLowerCase()
  //           .replace(/\s+/g, "-");
  //         const apiUrl = `/api/scrape?url=https://www.drugs.com/sfx/${formattedName}-side-effects.html`;

  //         console.log(`Fetching side effects from API: ${apiUrl}`);

  //         const apiResponse = await fetch(apiUrl);
  //         if (!apiResponse.ok)
  //           throw new Error(`Error fetching data for ${medicine.body}`);
  //         const data = await apiResponse.json();

  //         console.log(`API Response for ${medicine.body}:`, data);

  //         newSideEffects[medicine.body] = data;
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Database error:", error);
  //     toast({
  //       title: "Error accessing the database",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }

  //   console.log("Final Parsed Side Effects Data:", newSideEffects);
  //   setSideEffects(newSideEffects);
  //   setLoading(false);
  // };

  const fetchSideEffects = async () => {
    setLoading(true);
    const newSideEffects: Record<string, any> = {};

    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      const response = await fetch("/medicine.sqlite");
      const buffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buffer));

      for (const medicine of medicines) {
        const query =
          "SELECT side_effects FROM medicine_data WHERE LOWER(medicine) = LOWER(?)";
        const stmt = db.prepare(query);
        stmt.bind([medicine.body.toLowerCase()]);

        let rows: any[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();

        console.log(`Raw Query Result for ${medicine.body}:`, rows);

        if (rows.length > 0) {
          newSideEffects[medicine.body] = rows.flatMap((row) => {
            return row.side_effects
              .split("||")
              .map((section: string) => {
                const match = section.match(
                  /(.+?):\s(?:Very common|Common|Uncommon|Rare|Very rare):\s\(([\d.<]+)%.*?\):\s(.+)/
                );
                if (match) {
                  return {
                    category: match[1].trim(),
                    occurrence: parseFloat(match[2].replace("<", "")), // Convert "<0.1" to 0.1
                    symptoms: match[3].split(", ").map((s: string) => s.trim()),
                    medicine: medicine.body, // Include medicine name for RadarChart
                  };
                }
                return null;
              })
              .filter(Boolean);
          });
        } else {
          // API fallback if no data is found in the database
          const formattedName = medicine.body
            .toLowerCase()
            .replace(/\s+/g, "-");
          const apiUrl = `/api/scrape?url=https://www.drugs.com/sfx/${formattedName}-side-effects.html`;

          console.log(`Fetching side effects from API: ${apiUrl}`);

          const apiResponse = await fetch(apiUrl);
          if (!apiResponse.ok)
            throw new Error(`Error fetching data for ${medicine.body}`);
          const data = await apiResponse.json();

          console.log(`API Response for ${medicine.body}:`, data);
          newSideEffects[medicine.body] = data;
        }
      }
    } catch (error) {
      console.error("Database error:", error);
      toast({
        title: "Error accessing the database",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    console.log("Final Parsed Side Effects Data:", newSideEffects);
    setSideEffects(newSideEffects);
    setLoading(false);
  };

  return (
    <VStack p={4}>
      <Heading mb={4} fontSize="xl">
        Medicine Tracker
      </Heading>
      <SearchBar search={search} setSearch={setSearch} />
      <AddMedicine
        addMedicine={(medicine) => setMedicines([...medicines, medicine])}
      />
      <Button mt={4} onClick={fetchSideEffects} isLoading={loading}>
        Find Side Effects
      </Button>
      <MedicineList
        medicine={medicines.filter((m) =>
          m.body.toLowerCase().includes(search.toLowerCase())
        )}
        deleteMedicine={(id) =>
          setMedicines(medicines.filter((m) => m.id !== id))
        }
      />
      {Object.keys(sideEffects).length > 0 && (
        <VStack mt={4} p={4} borderWidth="1px" borderRadius="lg" w="100%">
          <Heading size="md">Side Effects</Heading>
          <Button
            onClick={() => setViewMode(viewMode === "list" ? "graph" : "list")}
            mb={4}
          >
            {viewMode === "list"
              ? "Switch to Graph View"
              : "Switch to List View"}
          </Button>
          {viewMode === "list" && (
            <VStack w="100%">
              {Object.entries(sideEffects).map(([medName, effects]) => (
                <Box
                  key={medName}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  w="100%"
                >
                  <Heading size="sm" mb={2}>
                    {medName}
                  </Heading>
                  {effects.map((effect: any) => (
                    <Box
                      key={effect.category}
                      p={2}
                      mb={2}
                      borderBottom="1px solid #ccc"
                    >
                      <Text fontWeight="bold">
                        {effect.category} ({effect.occurrence}% occurrence)
                      </Text>
                      <ul>
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
          {viewMode === "graph" && (
            <Box p={4} w="100%" textAlign="center">
              <Text fontSize="lg" fontWeight="bold">
                Graphical representation.
              </Text>
              <div className="max-w-sm mx-auto">
                <RadarChart
                  data={Object.values(sideEffects)}
                  color={["#1748ffB3", "#17bcffB3"]}
                />
                <PieChart
                  data={Object.values(sideEffects)}
                  color={["#31c3ffB3", "#7ed9ffB3"]}
                />
              </div>
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default MainComponent;
