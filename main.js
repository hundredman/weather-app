// 사용자 입력(input)과 검색 버튼 요소를 변수로 가져옴
const input = document.getElementById("locInput");
const button = document.getElementById("searchButton");

// 엔터 키를 누르면 날씨 검색 실행
input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

// 버튼 클릭 시 날씨 검색 실행
button.addEventListener("click", getWeather);

// 날씨 코드(weather_code)를 아이콘, 설명, 배경색으로 매핑해주는 함수
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

// 날씨 데이터를 가져오는 메인 함수
async function getWeather() {
    const loc = document.getElementById("locInput").value.trim(); // 입력된 위치
    const result = document.getElementById("weatherDiv");         // 결과를 보여줄 div

    result.innerHTML = "Please wait a moment..."; // 로딩 메시지 출력

    try {
        let lat, lon, display_name;

        if (loc) {
            // 사용자가 입력한 위치를 지오코딩 API로 위도/경도 찾기
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.length) {
                result.innerHTML = "No locations found.";
                return;
            }

            ({ lat, lon, display_name } = geoData[0]); // 첫 번째 결과의 위치 정보 사용
        } else {
            // 입력값이 없으면 현재 위치를 사용 (브라우저 위치 API)
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            display_name = "Your Current Location";
        }

        // 날씨 API 요청 (현재 + 시간별 + 일별)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const { current, hourly, daily } = weatherData; // 데이터 추출
        const weatherInfo = getWeatherInfo(current.weather_code); // 날씨 코드 해석

        // 배경색 변경 (날씨에 따라)
        document.body.style.backgroundColor = weatherInfo.color;

        // 현재 날씨 정보를 화면에 출력
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

        // 시간별/일별 예보 표시
        displayHourlyForecast(hourly);
        displayDailyForecast(daily);

    } catch (error) {
        result.innerHTML = "Error fetching weather.";
        console.error(error);
    }
}

// 시간별 예보 출력 함수 (24시간치)
function displayHourlyForecast(hourly) {
    const forecastDiv = document.getElementById("hourly-forecast");
    let html = "<h3>Hourly Forecast</h3><div class='forecast-container'>";

    const now = new Date();
    const currentHour = now.getHours();

    // 현재 시각과 같은 시간대의 인덱스 찾기
    const startIndex = hourly.time.findIndex(t => new Date(t).getHours() === currentHour);

    if (startIndex === -1) return; // 오류 방지

    // 현재 시간부터 24시간치 예보 출력
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

// 일별(주간) 예보 출력 함수
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

// 페이지 로드시 자동으로 현재 위치 날씨 가져오기
window.addEventListener("load", getWeather);