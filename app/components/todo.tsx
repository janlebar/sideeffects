"use client";

import React, { useState, useEffect } from "react";
import { VStack, Heading, IconButton, useColorMode } from "@chakra-ui/react";
import { FaSun, FaMoon } from "react-icons/fa";
import TodoList from "./todoList";
import AddTodo from "./addTodo";
import SearchBar from "./searchBar";
import { Todo } from "../types";

interface MainComponentProps {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  section: string;
}

const MainComponent: React.FC<MainComponentProps> = ({
  todos,
  setTodos,
  section,
}) => {
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const storedTodos = localStorage.getItem(`todos_${section}`);
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, [section, setTodos]);

  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem(`todos_${section}`, JSON.stringify(todos));
    }
  }, [todos, section]);

  const { colorMode, toggleColorMode } = useColorMode();

  function deleteTodo(id: number) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function addTodo(todo: Todo) {
    setTodos([...todos, todo]);
  }

  const filteredList = todos.filter((todo) =>
    todo.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VStack p={4}>
      <IconButton
        icon={colorMode === "light" ? <FaSun /> : <FaMoon />}
        isRound
        size="lg"
        alignSelf="flex-end"
        onClick={toggleColorMode}
        aria-label="Toggle color mode"
      />
      <Heading mb={4} fontSize="xl">
        Todo App
      </Heading>
      <SearchBar search={search} setSearch={setSearch} />
      <AddTodo addTodo={addTodo} />
      <TodoList todos={filteredList} deleteTodo={deleteTodo} />
    </VStack>
  );
};

export default MainComponent;
