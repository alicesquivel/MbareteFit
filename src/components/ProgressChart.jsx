import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { convertFromKg } from "../utils/helpers";

// Register all necessary Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

export default function ProgressChart({ weightData, units, goalWeight }) {
  const sortedData = useMemo(
    () => [...weightData].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [weightData]
  );

  const chartData = useMemo(() => {
    const dataPoints = sortedData.map((d) => ({
      x: new Date(d.date),
      y: convertFromKg(d.weight, units),
      note: d.note,
    }));

    const datasets = [
      {
        label: `Weight (${units})`,
        data: dataPoints,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.2,
        pointRadius: 4,
      },
    ];

    // Add goal line if it exists
    if (goalWeight && dataPoints.length > 0) {
      datasets.push({
        label: `Goal (${units})`,
        data: [
          { x: dataPoints[0].x, y: convertFromKg(goalWeight, units) },
          {
            x: dataPoints[dataPoints.length - 1].x,
            y: convertFromKg(goalWeight, units),
          },
        ],
        borderColor: "#10b981",
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      });
    }

    return { datasets };
  }, [sortedData, units, goalWeight]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: { unit: "day", tooltipFormat: "MMM d, hh:mm a" },
        },
        y: { ticks: { callback: (value) => `${value.toFixed(1)} ${units}` } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) =>
              `Weight: ${context.parsed.y.toFixed(1)} ${units}`,
            afterBody: (items) =>
              chartData.datasets[0].data[items[0].dataIndex]?.note || "",
          },
        },
      },
    }),
    [units, chartData]
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md relative min-h-[300px]">
      <h2 className="text-xl font-semibold mb-4">Progress Chart</h2>
      {weightData.length > 0 ? (
        <Line options={chartOptions} data={chartData} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          Chart appears here once you log your weight.
        </div>
      )}
    </div>
  );
}
