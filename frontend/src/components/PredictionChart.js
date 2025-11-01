import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const PredictionChart = ({ predictions }) => {
  const labels = predictions.map(p => p.timestamp.split("T")[1].slice(0, 8));
  const dataPoints = predictions.map(p => p.load_prediction);
  const ciLow = predictions.map(p => p.ci_low);
  const ciHigh = predictions.map(p => p.ci_high);
  const anomalyPoints = predictions.map(p => p.anomaly ? p.load_prediction : null);

  const data = {
    labels,
    datasets: [
      {
        label: "Predicted Load",
        data: dataPoints,
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.1)",
        fill: false,
        tension: 0.3
      },
      {
        label: "Confidence Low",
        data: ciLow,
        borderColor: "rgba(0,0,0,0.2)",
        borderDash: [5, 5],
        fill: false
      },
      {
        label: "Confidence High",
        data: ciHigh,
        borderColor: "rgba(0,0,0,0.2)",
        borderDash: [5, 5],
        fill: false
      },
      {
        label: "Anomaly",
        data: anomalyPoints,
        pointBackgroundColor: "red",
        pointBorderColor: "red",
        pointRadius: 6,
        showLine: false
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

export default PredictionChart;
