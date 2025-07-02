import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Import Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler
);

const WeightChart = ({ weights = [] }) => {
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const data = {
    labels: sortedWeights.map((w) => format(new Date(w.date), "MMM d")),
    datasets: [
      {
        label: "Weight (kg)",
        data: sortedWeights.map((w) => w.weight),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true, // Explicitly tell it to fill
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Weight Progress",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default WeightChart;
