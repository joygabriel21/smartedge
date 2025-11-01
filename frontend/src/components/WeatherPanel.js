import React, { useEffect, useState } from "react";

function WeatherPanel({ onWeatherUpdate }) {
  const [weather, setWeather] = useState(null);
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
  const city = process.env.REACT_APP_WEATHER_CITY || "Jakarta";

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        const weatherInfo = {
          ext_temperature: data.main.temp,
          ext_humidity: data.main.humidity,
          ext_condition: data.weather[0].main
        };
        setWeather(weatherInfo);
        if (onWeatherUpdate) onWeatherUpdate(weatherInfo);
      } catch (err) {
        console.error("Weather fetch failed:", err);
      }
    };

    fetchWeather();
  }, [apiKey, city, onWeatherUpdate]);

  if (!weather) return null;

  return (
    <div style={{ marginTop: "20px", fontSize: "0.9em" }}>
      <h4>External Weather ({city})</h4>
      <ul>
        <li>Temperature: {weather.ext_temperature} °C</li>
        <li>Humidity: {weather.ext_humidity} %</li>
        <li>Condition: {weather.ext_condition}</li>
      </ul>
    </div>
  );
}

export default WeatherPanel;
