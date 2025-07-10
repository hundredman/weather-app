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

    result.innerHTML = "Please wait a moment...";

    try {
        let lat, lon, display_name;

        if (city) {
            // 입력한 도시로 위치 찾기
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.length) {
                result.innerHTML = "No locations found.";
                return;
            }

            ({ lat, lon, display_name } = geoData[0]);
        } else {
            // 현재 위치 사용
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            display_name = "Your Current Location";
        }

        // 날씨 API 사용
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        const weatherCode = weatherData.current.weather_code;
        const weatherInfo = getWeatherInfo(weatherCode);

        document.body.style.backgroundColor = weatherInfo.color;

        result.innerHTML = `
            <h2>${display_name}</h2>
            <div class="weather-icon">${weatherInfo.icon}</div>
            <div class="weather-text">
                <p>Temperature: ${weatherData.current.temperature_2m}°C</p>
                <p>Description: ${weatherInfo.text}</p>
            </div>
        `;
    } catch (error) {
        result.innerHTML = "Error fetching weather.";
        console.error(error);
    }
}

// 페이지 로드시 현재 위치로 날씨 자동 조회
window.addEventListener("load", getWeather);
