describe("Home Page", () => {
  beforeEach(() => {
    // Visit your homepage
    cy.visit("http://localhost:3000"); // Adjust if your app runs on a different port
  });

  it("should display the Medicine menu item and be clickable", () => {
    // Check that the "Medicine" menu item is visible
    cy.contains("Medicine").should("be.visible");

    // Click the "Medicine" menu item
    cy.contains("Medicine").click();

    // After clicking, we expect the page to switch sections (you can check something else here)
    cy.url().should("include", "medicine"); // Check if the URL changed or check the section
  });
});
