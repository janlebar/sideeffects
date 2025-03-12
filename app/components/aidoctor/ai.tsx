// ai.tsx

"use client";

import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useEffect } from "react";

type LamafunctionProps = {
  input: any;
};

const AIComponent: React.FC<LamafunctionProps> = ({ input }) => {
  const medicinename = input.map((item: any) => item.body).join(", ");
  console.log("Medicine Name:", medicinename);

  const [responseText, setResponseText] = useState<string>("");

  useEffect(() => {
    console.log("Input received in AIComponent:", medicinename);
  }, [medicinename]); // Log whenever input changes

  const fetchData = async () => {
    try {
      console.log(`AI Request Input: ${JSON.stringify(medicinename)} TLE`);
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ medicinename }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      setResponseText(data.response.trim());
    } catch (error) {
      console.error("Error fetching data:", error);
      setResponseText("Error: Could not retrieve data.");
    }
  };

  return (
    <Box className="p-4 border rounded-lg shadow-md text-left max-w-[30vw] ">
      <Text className="text-xl font-bold">AI Assistant</Text>
      <Text className="mt-2">This is the AI-powered assistant section.</Text>

      <div>
        <button
          className="bg-gray-100 hover:bg-gray-200 font-bold py-2 px-4 rounded-md mt-1 border border-pink-400"
          onClick={fetchData}
        >
          Check medicine combination with AI
        </button>
        <div className="mt-2">
          <textarea
            className="w-full"
            value={responseText}
            readOnly
            rows={10}
          />
        </div>
      </div>
    </Box>
  );
};

export default AIComponent;
