import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// Define the types for the props
interface Symptom {
  category: string;
  occurrence: number;
  medicine: string;
}

interface PieChartProps {
  data: Symptom[][];
  color: string[];
}

function PieChart({ data, color }: PieChartProps) {
  // Create a reference to the canvas element for the chart
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  let chart: Chart | null = null; // Initialize a variable to hold the Chart.js instance

  // This useEffect hook will run whenever the 'data' prop changes
  useEffect(() => {
    console.log(data + " piechart");
    buildChart(); // Build the chart when the component mounts or when 'data' prop changes
    return () => {
      destroyChart(); // Destroy the chart when the component unmounts to prevent memory leaks
    };
  }, [data]);

  const buildChart = () => {
    if (!chartRef.current) return; // If the canvas element is not available, return early

    const myChartRef = chartRef.current.getContext("2d"); // Get the 2D context of the canvas
    if (!myChartRef) return;

    if (chart) {
      destroyChart(); // If there is an existing chart instance, destroy it first
    }

    const categories = new Set<string>();
    // Collect all unique categories from the 'data' array of symptoms
    for (const symptoms of data) {
      for (const symptom of symptoms) {
        categories.add(symptom.category);
      }
    }

    const datasets = [];
    // Create datasets for each set of symptoms (presumably for different medicines) in 'data'
    for (const symptoms of data) {
      if (symptoms.length === 0) continue;
      const medicineName = symptoms[0].medicine;

      const occurrences: Record<string, number> = {};
      // Calculate the occurrences of each category for a specific set of symptoms (medicine)
      for (const category of categories) {
        const symptom = symptoms.find(
          (symptom) => symptom.category === category
        );
        occurrences[category] = symptom ? symptom.occurrence : 0;
      }

      // Add a dataset for the medicine with its occurrences for each category
      datasets.push({
        label: `Niz podatkov ${medicineName}`,
        data: Object.values(occurrences),
        backgroundColor: Array.from(categories).map((_, i) => color[i]),
        borderColor: Array.from(categories).map((_, i) => color[i]),
        borderWidth: 1,
      });
    }

    // Create a new Chart.js instance with the gathered data
    chart = new Chart(myChartRef, {
      type: "pie", // Chart type is pie
      data: {
        labels: Array.from(categories), // The labels for the pie chart slices (category names)
        datasets: datasets, // The data and settings for each dataset (medicine)
      },
    });
  };

  const destroyChart = () => {
    if (chart) {
      chart.destroy(); // Destroy the existing Chart.js instance when unmounting the component
      chart = null; // Reset the chart variable
    }
  };

  return <canvas ref={chartRef}></canvas>; // Render the canvas element that will hold the chart
}

export default PieChart;
