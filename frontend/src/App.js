import React, { useState, useEffect } from "react";
import LineChart from "./components/LineChart";
import PredictionChart from "./components/PredictionChart";
import PredictionOverlayChart from "./components/PredictionOverlayChart";
import StatsPanel from "./components/StatsPanel";
import StatusBar from "./components/StatusBar";
import AlertBar from "./components/AlertBar";
import ExportButton from "./components/ExportButton";
import WeatherPanel from "./components/WeatherPanel";
import LoadingSkeleton from "./components/LoadingSkeleton";
import PredictionSkeleton from "./components/PredictionSkeleton";
import "./styles.css";

function App() {
  const [rawData, setRawData] = useState([]);
  const [rawPredictions, setRawPredictions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [paused, setPaused] = useState(false);
  const [trend, setTrend] = useState(null);
  const [anomaly, setAnomaly] = useState(false);
  const [modelMode, setModelMode] = useState("-");
  const [forecastHorizon, setForecastHorizon] = useState(10);
  const [weatherContext, setWeatherContext] = useState({});
  const [sensorMap, setSensorMap] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);

  const samplingRate = 2;
  const timeWindow = samplingRate * 20;

  useEffect(() => {
    fetch("http://localhost:8000/mode")
      .then(res => res.json())
      .then(data => setModelMode(data.model_mode));
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = event => {
      const payload = JSON.parse(event.data);
      setLastTimestamp(Date.now());
      if (paused) return;

      if (payload.sensor) {
        const { sensor_id, location } = payload.sensor;
        const locationLabel = selectedLocation ?? "No location yet";

        setSensorMap(prev => {
          const updated = { ...prev };
          if (!updated[location]) updated[location] = [];
          if (!updated[location].includes(sensor_id)) {
            updated[location].push(sensor_id);
          }
          return updated;
        });

        setRawData(prev => [...prev.slice(-100), payload.sensor]);

        if (!selectedLocation) setSelectedLocation(location);
        if (!selectedSensor) setSelectedSensor(sensor_id);
      }

      if (payload.prediction) {
        setRawPredictions(prev => [...prev.slice(-100), payload.prediction]);

        if (payload.prediction.anomaly) {
          setAnomaly(true);
        }

        const prev = rawPredictions.filter(p => p.sensor_id === selectedSensor);
        if (prev.length >= 1) {
          const prevVal = prev[prev.length - 1]?.load_prediction;
          const currVal = payload.prediction.load_prediction;
          if (prevVal !== undefined) {
            setTrend(currVal > prevVal ? "up" : currVal < prevVal ? "down" : "flat");
          }
        }
      }
    };

    return () => ws.close();
  }, [paused, rawPredictions, selectedSensor, selectedLocation]);

  const handleClear = () => {
    setRawData([]);
    setRawPredictions([]);
    setTrend(null);
    setAnomaly(false);
  };

  const getFilteredData = () => {
    if (selectedSensor === "ALL") {
      return rawData.filter(d => sensorMap[selectedLocation]?.includes(d.sensor_id));
    }
    return rawData.filter(d => d.sensor_id === selectedSensor);
  };

  const getFilteredPredictions = () => {
    if (selectedSensor === "ALL") {
      return rawPredictions.filter(p => sensorMap[selectedLocation]?.includes(p.sensor_id));
    }
    return rawPredictions.filter(p => p.sensor_id === selectedSensor);
  };

  const filteredData = getFilteredData();
  const filteredPredictions = getFilteredPredictions();

  return (
    <div className="container">
      <h2>SmartEdge Streaming Dashboard</h2>

      <StatusBar
        connected={connected}
        lastTimestamp={lastTimestamp}
        samplingRate={samplingRate}
        timeWindow={timeWindow}
        modelMode={modelMode}
      />

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "10px" }}>
          Forecast Horizon:
          <select
            value={forecastHorizon}
            onChange={e => setForecastHorizon(parseInt(e.target.value))}
            style={{ marginLeft: "5px" }}
          >
            {[5, 10, 15].map(min => (
              <option key={min} value={min}>{min} min</option>
            ))}
          </select>
        </label>
        <button onClick={() => setPaused(!paused)}>
          {paused ? "Resume Stream" : "Pause Stream"}
        </button>
        <button onClick={handleClear} style={{ marginLeft: "10px" }}>
          Clear Data
        </button>
      </div>

      {/* Tabs per location */}
      {Object.keys(sensorMap).length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <strong>Locations:</strong>{" "}
          {Object.keys(sensorMap).map(loc => (
            <button
              key={loc}
              onClick={() => {
                setSelectedLocation(loc);
                setSelectedSensor(sensorMap[loc][0]);
              }}
              style={{
                marginRight: "8px",
                padding: "6px 14px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: loc === selectedLocation ? "#007acc" : "#e6e6e6",
                color: loc === selectedLocation ? "#fff" : "#333",
                fontWeight: loc === selectedLocation ? "bold" : "normal",
                cursor: "pointer",
                boxShadow: loc === selectedLocation ? "0 0 6px rgba(0,0,0,0.2)" : "none",
                transition: "background-color 0.2s ease"
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      )}


      {/* Sensor dropdown per location */}
      {selectedLocation && sensorMap[selectedLocation] && (
        <div style={{ marginBottom: "10px" }}>
          <strong>Sensors in {selectedLocation}:</strong>{" "}
          {["ALL", ...sensorMap[selectedLocation]].map(id => (
            <button
              key={id}
              onClick={() => setSelectedSensor(id)}
              style={{
                marginRight: "6px",
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: id === selectedSensor ? "#4da6ff" : "#e0e0e0",
                color: id === selectedSensor ? "#fff" : "#333",
                fontWeight: id === selectedSensor ? "bold" : "normal",
                cursor: "pointer",
                boxShadow: id === selectedSensor ? "0 0 4px rgba(0,0,0,0.2)" : "none"
              }}
            >
              {id === "ALL" ? "All Sensors" : id}
            </button>
          ))}
        </div>
      )}


      {anomaly && (
        <div style={{ color: "red", fontWeight: "bold", marginBottom: "10px" }}>
          ⚠️ Anomaly detected in prediction!
          <div style={{ fontSize: "0.85em", color: "#800" }}>
            This means the predicted load deviates significantly from expected patterns. Check for sensor spikes or unusual weather.
          </div>
        </div>
      )}

      <p>
        <strong>Trend:</strong>{" "}
        {trend === "up" && "📈 Increasing load"}
        {trend === "down" && "📉 Decreasing load"}
        {trend === "flat" && "➖ Stable load"}
        {!trend && "No sensor data yet..."}
      </p>

      <AlertBar data={filteredData} />

      {filteredData.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <>
          <LineChart data={filteredData} />
          <StatsPanel data={filteredData} />
        </>
      )}

      <h3 style={{ marginTop: "30px" }}>Prediction vs Actual</h3>
      <p style={{ fontSize: "0.9em", color: "#666" }}>
        This chart displays predicted electrical load based on incoming sensor data. The shaded confidence band represents statistical uncertainty.
      </p>

      {filteredPredictions.length === 0 ? (
        <PredictionSkeleton />
      ) : (
        <PredictionChart predictions={filteredPredictions} />
      )}

      {filteredPredictions.length > 0 && selectedSensor !== "ALL" && (
        <div style={{ marginTop: "10px", fontSize: "0.9em", color: "#444" }}>
          <strong>Prediction Evaluation:</strong><br />
          Forecasted Load: {filteredPredictions.at(-1).load_prediction} kW<br />
          {filteredPredictions.at(-1).actual_load !== undefined ? (
            <>
              Actual Load: {filteredPredictions.at(-1).actual_load} kW<br />
              Error: {filteredPredictions.at(-1).error} kW
            </>
          ) : (
            <span style={{ color: "#999" }}>
              ⏳ Waiting for actual data to evaluate prediction...
            </span>
          )}
        </div>
      )}

      {/* <h3 style={{ marginTop: "30px" }}>Prediction vs Actual</h3>
      <PredictionOverlayChart predictions={filteredPredictions} />

      <WeatherPanel onWeatherUpdate={setWeatherContext} />
      <ExportButton />
      <p style={{ fontSize: "0.85em", color: "#666", marginTop: "10px" }}>
        {filteredPredictions.filter(p => p.actual_load !== undefined).length} predictions ready for export.
      </p>
      <p style={{ fontSize: "0.85em", color: "#888", marginTop: "10px" }}>
        Export predictions as CSV for offline analysis or reporting.
      </p> */}
    </div>
  );
}

export default App;
