// types.tsx
import { IconType } from "react-icons";

export interface Todo {
  id: number;
  body: string;
}

export interface TodoListProps {
  todos: Todo[];
  deleteTodo: (id: number) => void;
}

export interface AddTodoProps {
  addTodo: (todo: Todo) => void;
}

export interface MenuItemProps {
  icon: IconType;
  label: string;
  onClick: () => void;
  className?: string;
}
