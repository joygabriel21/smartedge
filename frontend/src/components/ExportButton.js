import React from "react";

const ExportButton = () => {
  const handleExport = async () => {
    try {
      const res = await fetch("http://localhost:8000/export");
      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();
      if (!data || data.length === 0) {
        alert("No prediction data available to export.");
        return;
      }

      const csv = [
        Object.keys(data[0]).join(","),
        ...data.map(row => Object.values(row).join(","))
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "predictions.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export predictions. Please check backend connection.");
    }
  };


  return <button onClick={handleExport}>Export Predictions</button>;
};

export default ExportButton;
