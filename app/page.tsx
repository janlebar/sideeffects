//page.tsx
//page.tsx
"use client";

import React, { useState } from "react";
import {
  Grid,
  GridItem,
  IconButton,
  useColorMode,
  VStack,
  Box,
} from "@chakra-ui/react";
import { GiMedicines } from "react-icons/gi";
import { RiRobot3Line } from "react-icons/ri";
import { FaSun, FaMoon } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import MainComponent from "@/app/medicine";
import { Medicine, MenuItemProps } from "./types";
import AIComponent from "@/app/components/aidoctor/ai";

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
}) => (
  <div
    className="flex items-center p-4 hover:bg-gray-200 cursor-pointer"
    onClick={onClick}
  >
    <Icon className={`text-xl mr-4 ${className || ""}`} />
    <span>{label}</span>
  </div>
);

const medicineApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("Medicine");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [todayMedicines, setTodayMedicines] = useState<Medicine[]>([]);
  const [upcomingMedicines, setUpcomingMedicines] = useState<Medicine[]>([]);

  const { colorMode, toggleColorMode } = useColorMode();
  const followingInput = "Aspirin";

  const sectionIcons: Record<string, React.ReactNode> = {
    Today: <GiMedicines className="text-xl mr-2" />,
    AI: <RiRobot3Line className="text-pink-400 text-xl mr-2" />,
  };

  const getSectionProps = () => {
    switch (activeSection) {
      case "Medicine":
        return { medicines: todayMedicines, setMedicines: setTodayMedicines };
      case "AI":
        return { medicines: todayMedicines, setMedicines: setTodayMedicines };
      default:
        return { medicines: [], setMedicines: () => {} };
    }
  };

  const { medicines, setMedicines } = getSectionProps();

  return (
    <div className={`h-screen`}>
      <Grid
        templateColumns={{ base: "1fr", md: "250px 1fr" }}
        templateRows={{ base: "auto 1fr", md: "1fr" }}
        h="100%"
      >
        {/* Mobile Menu */}
        <GridItem
          display={{ base: "block", md: "none" }}
          className="p-4 border-b border-gray-300"
        >
          <IconButton
            aria-label="Toggle menu"
            icon={<FiMenu />}
            onClick={() => setMenuOpen(!menuOpen)}
            variant="outline"
          />
        </GridItem>

        {/* Menu */}
        <GridItem
          className={`border-r border-gray-300 ${
            colorMode === "light" ? "bg-white" : "bg-black-700"
          } ${menuOpen ? "block" : "hidden"} md:block`}
          w={{ base: "full", md: "250px" }}
        >
          <div className="h-full flex flex-col">
            <div
              className={`text-center p-4 border-b ${
                colorMode === "light" ? "border-gray-300" : "border-gray-600"
              } font-bold text-lg`}
            >
              My Medicine
            </div>
            <div className="flex-1">
              <MenuItem
                icon={GiMedicines}
                label="Medicine"
                onClick={() => {
                  setActiveSection("Medicine");
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                className="text-pink-400"
                icon={RiRobot3Line}
                label="AI"
                onClick={() => {
                  setActiveSection("AI");
                  setMenuOpen(false);
                }}
              />
            </div>
          </div>
        </GridItem>

        {/* Medicine & AI Sections */}
        <GridItem>
          <Box className={`p-4 md:p-8`}>
            <VStack>
              <IconButton
                icon={colorMode === "light" ? <FaSun /> : <FaMoon />}
                isRound
                size="lg"
                alignSelf="flex-end"
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
              />
            </VStack>
            <h1 className="text-2xl font-bold mb-4 flex items-center">
              {sectionIcons[activeSection] || null} {activeSection}
            </h1>

            {activeSection === "Medicine" ? (
              <MainComponent
                medicines={medicines}
                setMedicines={setMedicines}
                section={activeSection}
              />
            ) : (
              <AIComponent
                input={[
                  { id: "1", body: "aspirin" },
                  { id: "2", body: "viagra" },
                ]}
              />

              // <AIComponent input={medicines} />
            )}
          </Box>
        </GridItem>
      </Grid>
    </div>
  );
};

export default medicineApp;
