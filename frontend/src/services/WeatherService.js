export async function getWeather(city, apiKey) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    return {
      ext_temperature: data.main.temp,
      ext_humidity: data.main.humidity,
      ext_condition: data.weather[0].main
    };
  } catch (err) {
    console.error("WeatherService error:", err);
    return {
      ext_temperature: null,
      ext_humidity: null,
      ext_condition: null
    };
  }
}
