"use client";

import React, { useState, useEffect } from "react";
import { VStack, Heading, IconButton, useColorMode } from "@chakra-ui/react";
import { FaSun, FaMoon } from "react-icons/fa";
import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";
import { Todo } from "./types";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() =>
    JSON.parse(localStorage.getItem("todos") || "[]")
  );

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
      <TodoList todos={todos} deleteTodo={deleteTodo} />
      <AddTodo addTodo={addTodo} />
    </VStack>
  );
};

export default App;
