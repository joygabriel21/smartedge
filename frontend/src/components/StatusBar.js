import React from "react";

function StatusBar({ connected, lastTimestamp, samplingRate, timeWindow, modelMode }) {
  const formatTime = ts => ts ? new Date(ts).toLocaleTimeString() : "-";

  return (
    <div style={{ marginBottom: "10px", fontSize: "0.9em", color: "#444" }}>
      <p>
        <strong>Status:</strong> {connected ? "🟢 Connected" : "🔴 Disconnected"} |{" "}
        <strong>Last update:</strong> {formatTime(lastTimestamp)} |{" "}
        <strong>Sampling rate:</strong> {samplingRate}s |{" "}
        <strong>Time window:</strong> {timeWindow}s |{" "}
        <strong>Model mode:</strong> {modelMode}
      </p>
    </div>
  );
}

export default StatusBar;
