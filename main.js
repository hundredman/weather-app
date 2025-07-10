const input = document.getElementById("cityInput");
const button = document.getElementById("searchButton");

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});
button.addEventListener("click", getWeather);

function getWeatherInfo(code) {
    if (code === 0) return { icon: "☀️", text: "Clear", color: "gold" };
    if (code <= 3) return { icon: "🌤️", text: "Mostly Sunny", color: "khaki" };
    if (code <= 48) return { icon: "🌫️", text: "Fog", color: "darkgray" };
    if (code <= 67) return { icon: "🌧️", text: "Rain", color: "dodgerblue" };
    if (code <= 77) return { icon: "🌨️", text: "Snow", color: "lightblue" };
    if (code <= 82) return { icon: "🌦️", text: "Showers", color: "skyblue" };
    if (code >= 95) return { icon: "⛈️", text: "Thunderstorm", color: "purple" };
    return { icon: "❓", text: "Unknown", color: "lightgray" };
}

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    const result = document.getElementById("weatherDiv");
    if (!city) {
        result.innerHTML = "Please enter a city.";
    }
    result.innerHTML = "Please wait a moment...";

    try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        if (!geoData.length) {
            result.innerHTML = "No locations found.";
            return;
        }
        const { lat, lon, display_name } = geoData[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        const weatherCode = weatherData.current.weather_code;
        const weatherIcon = getWeatherInfo(weatherCode).icon;
        const description = getWeatherInfo(weatherCode).text;
        const temperature = weatherData.current.temperature_2m;
        const bgColor = getWeatherInfo(weatherCode).color;
        
        document.body.style.backgroundColor = bgColor;

        result.innerHTML = `
            <h2>${display_name}</h2>
            <div class="weather-icon">${weatherIcon}</div>
            <div class="weather-text">
                <p>Temperature: ${temperature}°C</p>
                <p>Description: ${description}</p>
            </div>
        `;
    } catch (error) {
        result.innerHTML = "Error fetching weather.";
        console.error(error);
    }
}
