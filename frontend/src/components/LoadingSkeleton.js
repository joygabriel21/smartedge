import React from "react";

const LoadingSkeleton = () => {
  const boxStyle = {
    backgroundColor: "#eee",
    borderRadius: "4px",
    marginBottom: "10px",
    animation: "pulse 1.5s infinite",
  };

  return (
    <div style={{ padding: "10px", marginBottom: "20px" }}>
      <div style={{ ...boxStyle, height: "20px", width: "40%" }} />
      <div style={{ ...boxStyle, height: "200px", width: "100%" }} />
      <div style={{ ...boxStyle, height: "20px", width: "60%" }} />
      <div style={{ ...boxStyle, height: "20px", width: "30%" }} />
    </div>
  );
};

export default LoadingSkeleton;
