import { Button, HStack, Input, useToast } from "@chakra-ui/react";
import { useState, FormEvent } from "react";
import { AddTodoProps, Todo } from "../types";

const AddTodo: React.FC<AddTodoProps> = ({ addTodo }) => {
  const toast = useToast();
  const [content, setContent] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: "No content",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const todo: Todo = {
      id: Date.now(),
      body: content,
    };

    addTodo(todo);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <HStack
        mt="8"
        borderColor="gray.100"
        borderWidth="2px"
        p="4"
        borderRadius="lg"
        w="100%"
        maxW={{ base: "90vw", sm: "80vw", lg: "50vw", xl: "40vw" }}
        alignItems="stretch"
      >
        <Input
          variant="filled"
          placeholder="Add a Todo"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setContent(e.target.value)
          }
        />
        <Button px="8" type="submit">
          Add Todo
        </Button>
      </HStack>
    </form>
  );
};

export default AddTodo;
