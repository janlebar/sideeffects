"use client";

import React, { useState } from "react";
import { Grid, GridItem, IconButton } from "@chakra-ui/react";
import { MdLocalGroceryStore, MdOutlineWork, MdStars } from "react-icons/md";
import { RxHobbyKnife } from "react-icons/rx";
import { IoCalendarSharp } from "react-icons/io5";
import { FaLayerGroup } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import MainComponent from "@/app/components/todo";
import { Todo, MenuItemProps } from "./types";

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

const TodoApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("Today");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [upcomingTodos, setUpcomingTodos] = useState<Todo[]>([]);
  const [anytimeTodos, setAnytimeTodos] = useState<Todo[]>([]);
  const [workTodos, setWorkTodos] = useState<Todo[]>([]);
  const [groceryTodos, setGroceryTodos] = useState<Todo[]>([]);
  const [hobbyTodos, setHobbyTodos] = useState<Todo[]>([]);

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
      <Grid
        templateColumns={{ base: "1fr", md: "250px 1fr" }}
        templateRows={{ base: "auto 1fr", md: "1fr" }}
        h="100%"
      >
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

        <GridItem
          className={`border-r border-gray-300 bg-white ${
            menuOpen ? "block" : "hidden"
          } md:block`}
          w={{ base: "full", md: "250px" }}
        >
          <div className="h-full flex flex-col">
            <div className="text-center p-4 border-b border-gray-300 font-bold text-lg">
              My To-Do App
            </div>
            <div className="flex-1">
              <MenuItem
                className="text-yellow-400"
                icon={MdStars}
                label="Today"
                onClick={() => {
                  setActiveSection("Today");
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                className="text-pink-400"
                icon={IoCalendarSharp}
                label="Upcoming"
                onClick={() => {
                  setActiveSection("Upcoming");
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                className="text-green-400"
                icon={FaLayerGroup}
                label="Anytime"
                onClick={() => {
                  setActiveSection("Anytime");
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={MdOutlineWork}
                label="Work"
                onClick={() => {
                  setActiveSection("Work");
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={MdLocalGroceryStore}
                label="Groceries"
                onClick={() => {
                  setActiveSection("Groceries");
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={RxHobbyKnife}
                label="Hobbies"
                onClick={() => {
                  setActiveSection("Hobbies");
                  setMenuOpen(false);
                }}
              />
            </div>
          </div>
        </GridItem>

        <GridItem>
          <div className="p-4 md:p-8">
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
