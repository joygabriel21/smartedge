import React from "react";

const PredictionSkeleton = () => {
  const boxStyle = {
    backgroundColor: "#eee",
    borderRadius: "4px",
    marginBottom: "10px",
    animation: "pulse 1.5s infinite",
  };

  return (
    <div style={{ padding: "10px", marginBottom: "20px" }}>
      <div style={{ ...boxStyle, height: "20px", width: "50%" }} />
      <div style={{ ...boxStyle, height: "250px", width: "100%" }} />
      <div style={{ ...boxStyle, height: "20px", width: "30%" }} />
    </div>
  );
};

export default PredictionSkeleton;
