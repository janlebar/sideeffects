import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import AddMedicine from "@/app/components/medicine/addMedicine"; // Adjust path as needed
import { AddMedicineProps } from "@/app/types";
import userEvent from "@testing-library/user-event";

describe("AddTodo Component", () => {
  test("updates input field when user types", async () => {
    render(<AddMedicine addMedicine={jest.fn()} />); // Render the component with a mock function

    const input = screen.getByPlaceholderText("Add a Medicine"); // Get the input field by its placeholder

    await userEvent.type(input, "Aspirin"); // Simulate user typing

    expect(input).toHaveValue("Aspirin"); // Assert that input field contains the entered text
  });
});

// // Mock the addMedicine function
// const mockAddMedicine = jest.fn();

// const renderComponent = () =>
//   render(
//     <ChakraProvider>
//       <AddMedicine addMedicine={mockAddMedicine} />
//     </ChakraProvider>
//   );

// describe("AddMedicine Component", () => {
//   it("renders input and button", () => {
//     renderComponent();

//     expect(screen.getByPlaceholderText("Add a Medicine")).toBeInTheDocument();
//     expect(
//       screen.getByRole("button", { name: /add medicine/i })
//     ).toBeInTheDocument();
//   });

//   it("does not submit empty input and shows toast error", () => {
//     renderComponent();

//     const button = screen.getByRole("button", { name: /add medicine/i });
//     fireEvent.click(button);

//     expect(mockAddMedicine).not.toHaveBeenCalled();
//   });

//   it("submits when input has text and calls addMedicine function", () => {
//     renderComponent();

//     const input = screen.getByPlaceholderText("Add a Medicine");
//     const button = screen.getByRole("button", { name: /add medicine/i });

//     fireEvent.change(input, { target: { value: "Paracetamol" } });
//     fireEvent.click(button);

//     expect(mockAddMedicine).toHaveBeenCalled();
//   });
// });
