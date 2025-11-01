import React from "react";

const AlertBar = ({ data }) => {
  const latest = data[data.length - 1];
  if (!latest) return null;

  const alerts = [];
  if (latest.irradiance > 1000) alerts.push("⚠️ Irradiance is too high!");
  if (latest.temperature > 35) alerts.push("🔥 Temperature exceeds safe threshold!");
  if (latest.humidity < 30) alerts.push("💧 Humidity is too low!");

  return alerts.length ? (
    <div style={{ background: "#ffe0e0", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
      {alerts.map((msg, i) => (
        <div key={i} style={{ color: "red", fontWeight: "bold" }}>{msg}</div>
      ))}
    </div>
  ) : null;
};

export default AlertBar;
