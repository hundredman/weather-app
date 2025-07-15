const input = document.getElementById("locInput");
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
    const loc = document.getElementById("locInput").value.trim();
    const result = document.getElementById("weatherDiv");

    result.innerHTML = "Please wait a moment...";

    try {
        let lat, lon, display_name;

        if (loc) {
            // 입력한 위치 찾기
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json`;
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
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        const { current, hourly, daily } = weatherData;
        const weatherInfo = getWeatherInfo(current.weather_code);

        document.body.style.backgroundColor = weatherInfo.color;

        result.innerHTML = `
            <h2>${display_name}</h2>
            <div class="weather-icon">${weatherInfo.icon}</div>
            <div class="weather-text">
                <p>Temperature: ${current.temperature_2m}°C</p>
                <p>Description: ${weatherInfo.text}</p>
            </div>
            <div id="hourly-forecast"></div>
            <div id="daily-forecast"></div>
        `;

        displayHourlyForecast(hourly);
        displayDailyForecast(daily);

    } catch (error) {
        result.innerHTML = "Error fetching weather.";
        console.error(error);
    }
}

function displayHourlyForecast(hourly) {
    const forecastDiv = document.getElementById("hourly-forecast");
    let html = "<h3>Hourly Forecast</h3><div class='forecast-container'>";
    const now = new Date();
    const currentHour = now.getHours();

    // Find the index for the current hour
    const startIndex = hourly.time.findIndex(t => new Date(t).getHours() === currentHour);

    if (startIndex === -1) return; // Should not happen with timezone=auto

    // Display the next 24 hours
    for (let i = startIndex; i < startIndex + 24; i++) {
        if (i >= hourly.time.length) break;
        const time = new Date(hourly.time[i]);
        const weatherInfo = getWeatherInfo(hourly.weather_code[i]);
        html += `
            <div class="forecast-item">
                <p>${time.getHours()}:00</p>
                <div class="forecast-icon">${weatherInfo.icon}</div>
                <p>${hourly.temperature_2m[i]}°C</p>
            </div>
        `;
    }
    html += "</div>";
    forecastDiv.innerHTML = html;
}

function displayDailyForecast(daily) {
    const forecastDiv = document.getElementById("daily-forecast");
    let html = "<h3>Weekly Forecast</h3><div class='forecast-container'>";
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);
        html += `
            <div class="forecast-item">
                <p>${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <div class="forecast-icon">${weatherInfo.icon}</div>
                <p>${daily.temperature_2m_max[i]}° / ${daily.temperature_2m_min[i]}°</p>
            </div>
        `;
    }
    html += "</div>";
    forecastDiv.innerHTML = html;
}


// 페이지 로드시 현재 위치로 날씨 자동 조회
window.addEventListener("load", getWeather);