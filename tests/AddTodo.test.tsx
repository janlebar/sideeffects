import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTodo from "@/app/components/addTodo";

describe("AddTodo Component", () => {
  test("updates input field when user types", async () => {
    render(<AddTodo addTodo={jest.fn()} />); // Render the component with a mock function

    const input = screen.getByPlaceholderText("Add a Todo"); // Get the input field by its placeholder

    await userEvent.type(input, "Buy groceries"); // Simulate user typing

    expect(input).toHaveValue("Buy groceries"); // Assert that input field contains the entered text
  });
});

// import { render, screen, fireEvent } from "@testing-library/react";
// import AddTodo from "@/app/components/addTodo";
// import { ChakraProvider } from "@chakra-ui/react";
// import userEvent from "@testing-library/user-event";

// describe("AddTodo Component", () => {
//   let mockAddTodo: jest.Mock;

//   beforeEach(() => {
//     mockAddTodo = jest.fn();
//     render(
//       <ChakraProvider>
//         <AddTodo addTodo={mockAddTodo} />
//       </ChakraProvider>
//     );
//   });

//   it("renders input and button", () => {
//     expect(screen.getByPlaceholderText("Add a Todo")).toBeInTheDocument();
//     expect(
//       screen.getByRole("button", { name: /add todo/i })
//     ).toBeInTheDocument();
//   });

//   it("does not allow adding an empty todo", () => {
//     const button = screen.getByRole("button", { name: /add todo/i });
//     fireEvent.click(button);

//     expect(mockAddTodo).not.toHaveBeenCalled();
//   });

//   it("calls addTodo with correct input value", async () => {
//     const input = screen.getByPlaceholderText("Add a Todo");
//     const button = screen.getByRole("button", { name: /add todo/i });

//     await userEvent.type(input, "Learn Testing");
//     fireEvent.click(button);

//     expect(mockAddTodo).toHaveBeenCalledWith({
//       id: expect.any(Number),
//       body: "Learn Testing",
//     });

//     expect(input).toHaveValue(""); // Should reset input after submit
//   });
// });
