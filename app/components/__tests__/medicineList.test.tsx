import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MedicineList from "@/app/components/medicine/medicineList";
import { MedicineListProps } from "../../types";
import { ChakraProvider } from "@chakra-ui/react";
import { ReactElement } from "react";

const renderWithProviders = (ui: ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("MedicineList Component", () => {
  test("renders 'No Medicine added!' when the list is empty", () => {
    renderWithProviders(
      <MedicineList medicine={[]} deleteMedicine={jest.fn()} />
    );
    expect(screen.getByText(/No Medicine added!/i)).toBeInTheDocument();
  });

  test("renders a list of medicines", () => {
    const medicines = [
      { id: "1", body: "Aspirin" },
      { id: "2", body: "Ibuprofen" },
    ];

    renderWithProviders(
      <MedicineList medicine={medicines} deleteMedicine={jest.fn()} />
    );

    expect(screen.getByText("Aspirin")).toBeInTheDocument();
    expect(screen.getByText("Ibuprofen")).toBeInTheDocument();
  });

  test("calls deleteMedicine when delete button is clicked", () => {
    const medicines = [{ id: "1", body: "Aspirin" }];
    const deleteMedicineMock = jest.fn();

    renderWithProviders(
      <MedicineList medicine={medicines} deleteMedicine={deleteMedicineMock} />
    );

    const deleteButton = screen.getByRole("button", { name: /delete todo/i });
    fireEvent.click(deleteButton);

    expect(deleteMedicineMock).toHaveBeenCalledWith("1");
  });
});
