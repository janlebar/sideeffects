import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// Definicija tipov za props
interface Symptom {
  category: string;
  occurrence: number;
  medicine: string;
}

type DataType = Symptom[][];

type RadarChartProps = {
  data: DataType;
  color: string[];
};

function RadarChart({ data, color }: RadarChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null); // Sklic na element platna (canvas)
  let chart: Chart | null = null; // Sklic na primer grafikona

  useEffect(() => {
    console.log("Klic useEffect");
    buildChart(); // Kličemo funkcijo buildChart, ko se komponenta inicializira ali
    //ko se spremeni prop 'data'

    return () => {
      console.log("Klic funkcije za čiščenje");
      destroyChart(); // Kličemo funkcijo destroyChart, ko se komponenta odstrani ali
      //ko se spremeni prop 'data'
    };
  }, [data]);

  const buildChart = () => {
    if (!chartRef.current) return; // Prekini, če referenca chartRef ni na voljo (platno ni izrisano)
    const myChartRef = chartRef.current.getContext("2d"); // Pridobi 2D kontekst platna
    if (!myChartRef) return;

    // Uniči obstoječi grafikon, če že obstaja
    if (chart) {
      destroyChart();
    }

    // HERE FIRST DATA COMES IN
    // Create a set of categories
    const categories = new Set<string>(); // Množica unikatnih kategorij v podatkih
    for (const symptoms of data) {
      for (const symptom of symptoms) {
        categories.add(symptom.category);
      }
    }
    // NAJPREJ PRAZEN AREJ KI GA NAFILAS
    const datasets: any[] = [];

    //gradis DATASET
    let i = 0;

    for (const symptoms of data) {
      const medicineName = symptoms[0].medicine;
      const occurrences: Record<string, number> = {};

      for (const symptom of symptoms) {
        for (const category of categories) {
          if (category in occurrences) continue;
          const foundSymptom = symptoms.find(
            (symptom) => symptom.category === category
          );
          occurrences[category] = foundSymptom ? foundSymptom.occurrence : 0;
        }
      }

      console.log(medicineName);

      datasets.push({
        label: `Niz podatkov ${medicineName}`,
        data: Object.values(occurrences),
        backgroundColor: color[i % color.length], // Use the color based on the index (i) and the length of the colors array
        borderColor: color[i % color.length], // Use the same color for the border
        borderWidth: 1,
      });

      i++;
    }

    chart = new Chart(myChartRef, {
      type: "radar",
      data: {
        labels: Array.from(categories), // Pretvori množico kategorij v polje za oznake na grafikonu
        datasets: datasets, // Dodeli sestavljene podatkovne nize grafikonu
      },
      options: {
        scales: {
          r: {
            min: 0, // Set the minimum value to 0
            max: 10, // Set the maximum value to 10
          },
        },
      },
    });
  };

  const destroyChart = () => {
    if (chart) {
      chart.destroy(); // Uniči obstoječi primer grafikona
      chart = null;
    }
  };

  return <canvas ref={chartRef}></canvas>; // Izriši element platna in dodeli mu chartRef kot referenco
}

export default RadarChart;
