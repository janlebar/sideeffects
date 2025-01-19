// types.tsx
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
