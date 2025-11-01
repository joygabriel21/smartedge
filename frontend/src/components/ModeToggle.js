import React from "react";

const ModeToggle = ({ mode, setMode }) => {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>
        <input
          type="checkbox"
          checked={mode === "simulation"}
          onChange={() => setMode(mode === "simulation" ? "production" : "simulation")}
        />
        Mode: {mode === "simulation" ? "Simulasi" : "Produksi"}
      </label>
    </div>
  );
};

export default ModeToggle;
