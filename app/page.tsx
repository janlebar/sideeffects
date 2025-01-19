"use client";

import React, { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  IconButton,
  Input,
  useColorMode,
} from "@chakra-ui/react";
import { FaSun, FaMoon } from "react-icons/fa";
import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";
import { Todo } from "./types";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() =>
    JSON.parse(localStorage.getItem("todos") || "[]")
  );
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

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
      <Input
        placeholder="Search todos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={4}
        variant="filled"
      />
      <TodoList todos={filteredList} deleteTodo={deleteTodo} />
      <AddTodo addTodo={addTodo} />
    </VStack>
  );
};

export default App;
