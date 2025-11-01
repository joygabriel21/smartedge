import React from "react";

function StatsPanel({ data }) {
  if (data.length === 0) {
    return <p>No sensor data available.</p>;
  }

  const avg = (arr, key) =>
    (arr.reduce((sum, item) => sum + item[key], 0) / arr.length).toFixed(2);

  const timestamps = data.map(d => new Date(d.timestamp).getTime());
  const intervals = timestamps.slice(1).map((t, i) => (t - timestamps[i]) / 1000);
  const avgInterval = intervals.length ? (intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(2) : "-";
  const duration = timestamps.length >= 2 ? ((timestamps.at(-1) - timestamps[0]) / 1000).toFixed(1) : "-";

  return (
    <div style={{ marginTop: "20px", fontSize: "0.9em" }}>
      <h4>Sensor Statistics</h4>
      <ul>
        <li>Avg Temperature: {avg(data, "temperature")} °C</li>
        <li>Avg Humidity: {avg(data, "humidity")} %</li>
        <li>Avg Irradiance: {avg(data, "irradiance")} W/m²</li>
        <li>Avg Sampling Interval: {avgInterval} seconds</li>
        <li>Time Window: {duration} seconds</li>
      </ul>
    </div>
  );
}

export default StatsPanel;
