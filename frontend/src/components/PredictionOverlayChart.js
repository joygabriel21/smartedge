import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const PredictionOverlayChart = ({ predictions }) => {
  const labels = predictions.map(p => p.timestamp.split("T")[1].slice(0, 8));
  const predicted = predictions.map(p => p.load_prediction);
  const actual = predictions.map(p => p.actual_load ?? null);

  const data = {
    labels,
    datasets: [
      {
        label: "Predicted Load",
        data: predicted,
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.1)",
        fill: false,
        tension: 0.3
      },
      {
        label: "Actual Load",
        data: actual,
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,0.1)",
        fill: false,
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Load (kW)"
        }
      },
      x: {
        title: {
          display: true,
          text: "Time"
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};

export default PredictionOverlayChart;
