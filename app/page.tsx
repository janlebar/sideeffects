"use client";

import React, { useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { MdLocalGroceryStore, MdOutlineWork, MdStars } from "react-icons/md";
import { RxHobbyKnife } from "react-icons/rx";
import { IoCalendarSharp } from "react-icons/io5";
import { FaLayerGroup } from "react-icons/fa";
import MainComponent from "@/app/components/todo";
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
    <Icon className={`text-xl mr-4 ${className || ""}`} />
    <span>{label}</span>
  </div>
);

const TodoApp = () => {
  const [activeSection, setActiveSection] = useState<string>("Today");

  const [todayTodos, setTodayTodos] = useState([]);
  const [upcomingTodos, setUpcomingTodos] = useState([]);
  const [anytimeTodos, setAnytimeTodos] = useState([]);
  const [workTodos, setWorkTodos] = useState([]);
  const [groceryTodos, setGroceryTodos] = useState([]);
  const [hobbyTodos, setHobbyTodos] = useState([]);

  const sectionIcons: Record<string, React.ReactNode> = {
    Today: <MdStars className="text-yellow-400 text-xl mr-2" />,
    Upcoming: <IoCalendarSharp className="text-pink-400 text-xl mr-2" />,
    Anytime: <FaLayerGroup className="text-green-400 text-xl mr-2" />,
    Work: <MdOutlineWork className="text-blue-400 text-xl mr-2" />,
    Groceries: <MdLocalGroceryStore className="text-orange-400 text-xl mr-2" />,
    Hobbies: <RxHobbyKnife className="text-purple-400 text-xl mr-2" />,
  };

  const getSectionProps = () => {
    switch (activeSection) {
      case "Today":
        return { todos: todayTodos, setTodos: setTodayTodos };
      case "Upcoming":
        return { todos: upcomingTodos, setTodos: setUpcomingTodos };
      case "Anytime":
        return { todos: anytimeTodos, setTodos: setAnytimeTodos };
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
        {/* Sidebar */}
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
                onClick={() => setActiveSection("Today")}
              />
              <MenuItem
                className="text-pink-400"
                icon={IoCalendarSharp}
                label="Upcoming"
                onClick={() => setActiveSection("Upcoming")}
              />
              <MenuItem
                className="text-green-400"
                icon={FaLayerGroup}
                label="Anytime"
                onClick={() => setActiveSection("Anytime")}
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

        {/* Main Section */}
        <GridItem>
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
              {sectionIcons[activeSection] || null} {activeSection}
            </h1>
            <MainComponent todos={todos} setTodos={setTodos} />
          </div>
        </GridItem>
      </Grid>
    </div>
  );
};

export default TodoApp;
