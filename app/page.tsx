"use client";

import React, { useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { FaHome, FaTasks, FaCalendar, FaUser } from "react-icons/fa";
import { MdLocalGroceryStore, MdOutlineWork, MdStars } from "react-icons/md";
import { RxHobbyKnife } from "react-icons/rx";
import { IoCalendarSharp } from "react-icons/io5";
import { FaLayerGroup } from "react-icons/fa";
import MainComponent from "@/app/todo";
import { MenuItemProps } from "./types";

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
    {/* Add className only to the Icon */}
    <Icon className={`text-xl mr-4 ${className || ""}`} />
    <span>{label}</span>
  </div>
);

const TodoApp = () => {
  const [activeSection, setActiveSection] = useState<string | React.ReactNode>(
    "Home"
  );

  // Separate todo states for each section
  const [homeTodos, setHomeTodos] = useState([]);
  const [workTodos, setWorkTodos] = useState([]);
  const [groceryTodos, setGroceryTodos] = useState([]);
  const [hobbyTodos, setHobbyTodos] = useState([]);

  // Function to get the current section's todos and setTodos functions
  const getSectionProps = () => {
    switch (activeSection) {
      case "Home":
        return { todos: homeTodos, setTodos: setHomeTodos };
      case "Work":
        return { todos: workTodos, setTodos: setWorkTodos };
      case "Groceries":
        return { todos: groceryTodos, setTodos: setGroceryTodos };
      case "Hobbies":
        return { todos: hobbyTodos, setTodos: setHobbyTodos };
      default:
        return { todos: [], setTodos: () => {} };
    }
  };

  const { todos, setTodos } = getSectionProps();

  return (
    <div className="h-screen">
      <Grid templateColumns="250px 1fr" h="100%">
        {/* Static Menu */}
        <GridItem className="border-r border-gray-300">
          <div className="h-full flex flex-col">
            <div className="text-center p-4 border-b border-gray-300 font-bold text-lg">
              My To-Do App
            </div>
            <div className="flex-1">
              <MenuItem
                className="text-yellow-400"
                icon={MdStars}
                label="Today"
                onClick={() =>
                  setActiveSection(
                    <span className="flex items-center">
                      <MdStars className="text-yellow-400 text-xl mr-2" />
                      Today
                    </span>
                  )
                }
              />
              <MenuItem
                className="text-pink-400"
                icon={IoCalendarSharp}
                label="Upcoming"
                onClick={() =>
                  setActiveSection(
                    <span className="flex items-center">
                      <IoCalendarSharp className="text-pink-400 text-xl mr-2" />
                      Upcoming
                    </span>
                  )
                }
              />
              <MenuItem
                className="text-green-400"
                icon={FaLayerGroup}
                label="Anytime"
                onClick={() =>
                  setActiveSection(
                    <span className="flex items-center">
                      <FaLayerGroup className="text-green-400 text-xl mr-2" />
                      Anytime
                    </span>
                  )
                }
              />
              <MenuItem
                icon={MdOutlineWork}
                label="Work"
                onClick={() => setActiveSection("Work")}
              />
              <MenuItem
                icon={MdLocalGroceryStore}
                label="Groceries"
                onClick={() => setActiveSection("Groceries")}
              />
              <MenuItem
                icon={RxHobbyKnife}
                label="Hobbies"
                onClick={() => setActiveSection("Hobbies")}
              />
            </div>
          </div>
        </GridItem>

        {/* Main Content */}
        <GridItem>
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">{activeSection}</h1>
            {/* Render the corresponding MainComponent with the section's todos */}
            <MainComponent todos={todos} setTodos={setTodos} />
          </div>
        </GridItem>
      </Grid>
    </div>
  );
};

export default TodoApp;
