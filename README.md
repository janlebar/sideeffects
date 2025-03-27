# Medicine Side Effects Tracker

## Overview

Medicine Side Effects Tracker is a React-based application designed to help users track and manage their medications. It allows users to add, search, and delete medicines, as well as fetch potential side effects using an SQLite database or an external API. The application also includes graphical representations of side effects through Radar and Pie charts.

## Features

- **Medicine Management**: Add, search, and delete medicines.
- **Side Effects Lookup**: Fetch side effects from a local SQLite database or external API.
- **Graphical Analysis**: Display side effects using Radar and Pie charts.
- **AI Assistant**: Check medicine combinations with an AI-powered assistant.
- **Dark Mode Support**: Toggle between light and dark themes.

## Technologies Used

- **React** with Hooks
- **Chakra UI** for UI components and styling
- **SQL.js** for client-side database interactions
- **Chart.js** for data visualization
- **Next.js API routes** for AI-powered medicine analysis

## Installation & Setup

### Prerequisites

Ensure you have the following installed:

- Node.js (>= 14.x)
- npm or yarn

### Steps

1. Clone the repository:
   ```sh
   git clone janlebar/sideeffects
   cd medicine-tracker
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Run the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. Open the application in your browser at `http://localhost:3000`.

## Folder Structure

```
medicine-tracker/
├── components/
│   ├── medicine/
│   │   ├── MedicineList.tsx
│   │   ├── AddMedicine.tsx
│   │   ├── PieChart.tsx
│   │   ├── RadarChart.tsx
│   ├── aidoctor/
│   │   ├── AIComponent.tsx
│   ├── SearchBar.tsx
├── pages/
│   ├── index.tsx
│   ├── api/
│   │   ├── ai.tsx
├── types/
│   ├── index.ts
├── public/
│   ├── medicine.sqlite (Database File)
├── styles/
├── package.json
├── README.md
```

## Usage

1. **Adding Medicines**: Enter the name of the medicine and add it to the list.
2. **Searching**: Use the search bar to filter medicines.
3. **Fetching Side Effects**: Click the "Find Side Effects" button to retrieve information.
4. **Switch Views**: Toggle between list and graph views.
5. **AI Assistant**: Click "Check medicine combination with AI" to analyze medicine compatibility.

## API Integration

- Uses `sql.js` to query a local SQLite database for medicine data.
- Falls back to an external API if no data is found.
- AI component interacts with a backend API to analyze medicine combinations.

## Future Improvements

- User authentication and profiles.
- Push notifications for medicine reminders.
- Integration with external health databases.

## License

This project is licensed under the MIT License.
