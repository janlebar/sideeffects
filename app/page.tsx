"use client";

import React, { useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { FaHome, FaTasks, FaCalendar, FaUser } from "react-icons/fa";
import { MdLocalGroceryStore, MdOutlineWork } from "react-icons/md";
import { RxHobbyKnife } from "react-icons/rx";
import MainComponent from "@/app/todo";

const MenuItem = ({ icon: Icon, label, onClick }) => (
  <div
    className="flex items-center p-4 hover:bg-gray-200 cursor-pointer"
    onClick={onClick}
  >
    <Icon className="text-xl mr-4" />
    <span>{label}</span>
  </div>
);

const TodoApp = () => {
  const [activeSection, setActiveSection] = useState("Home");

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
                icon={FaHome}
                label="Home"
                onClick={() => setActiveSection("Home")}
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
