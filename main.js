// Unsplash API 키 (config.js에서 로드)
const unsplashAccessKey = UNSPLASH_ACCESS_KEY;

// DOM 요소 가져오기
const input = document.getElementById("locInput");
const button = document.getElementById("searchButton");
const clearButton = document.getElementById("clearSearchButton");
const weatherApp = document.querySelector('.weather-app');

// --- 이벤트 리스너 설정 ---

// 검색창 입력 시 'X' 버튼 표시/숨김
input.addEventListener("input", () => {
    clearButton.style.display = input.value.length > 0 ? "block" : "none";
});

// 'X' 버튼 클릭 시 입력 내용 지우고 현재 위치 날씨 로드
clearButton.addEventListener("click", () => {
    input.value = "";
    clearButton.style.display = "none";
    getWeather();
});

// Enter 키 또는 검색 버튼 클릭 시 날씨 검색
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") getWeather();
});
button.addEventListener("click", getWeather);

// 페이지 첫 로드 시 현재 위치 날씨 가져오기
window.addEventListener("load", () => {
    getWeather();
    feather.replace();
});


// Open-Meteo 날씨 코드와 앱 내부 데이터를 매핑
const weatherConditions = {
    0: { icon: 'sun', text: 'Clear Sky', query: 'clear blue sky' },
    1: { icon: 'sun', text: 'Mainly Clear', query: 'clear sky' },
    2: { icon: 'cloud', text: 'Partly Cloudy', query: 'partly cloudy sky' },
    3: { icon: 'cloud', text: 'Overcast', query: 'overcast sky' },
    45: { icon: 'wind', text: 'Fog', query: 'foggy weather' },
    48: { icon: 'wind', text: 'Depositing Rime Fog', query: 'frosty fog' },
    51: { icon: 'cloud-drizzle', text: 'Light Drizzle', query: 'light rain drizzle' },
    53: { icon: 'cloud-drizzle', text: 'Moderate Drizzle', query: 'drizzle rain' },
    55: { icon: 'cloud-drizzle', text: 'Dense Drizzle', query: 'heavy drizzle' },
    61: { icon: 'cloud-rain', text: 'Slight Rain', query: 'light rain weather' },
    63: { icon: 'cloud-rain', text: 'Moderate Rain', query: 'rainy day' },
    65: { icon: 'cloud-rain', text: 'Heavy Rain', query: 'heavy rain storm' },
    71: { icon: 'cloud-snow', text: 'Slight Snowfall', query: 'light snow' },
    73: { icon: 'cloud-snow', text: 'Moderate Snowfall', query: 'snowy landscape' },
    75: { icon: 'cloud-snow', text: 'Heavy Snowfall', query: 'heavy snowfall winter' },
    80: { icon: 'cloud-lightning', text: 'Slight Rain Showers', query: 'rain showers' },
    81: { icon: 'cloud-lightning', text: 'Moderate Rain Showers', query: 'rain showers' },
    82: { icon: 'cloud-lightning', text: 'Violent Rain Showers', query: 'violent storm' },
    95: { icon: 'cloud-lightning', text: 'Thunderstorm', query: 'thunderstorm lightning' },
};

/**
 * 날씨 코드를 받아 해당하는 아이콘, 텍스트, 검색어를 반환합니다.
 * @param {number} code - WMO 날씨 코드
 */
function getWeatherInfo(code) {
    return weatherConditions[code] || { icon: 'help-circle', text: 'Unknown', query: 'weather' };
}

/**
 * Unsplash API로 배경 이미지를 가져옵니다. (1시간 캐싱 적용)
 * @param {string} query - 이미지 검색어
 */
async function getBackgroundImage(query) {
    const cacheKey = `bg_image_${query.replace(/\s/g, '_')}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        const { url, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 3600000) { // 1시간
            return url;
        }
    }

    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${unsplashAccessKey}`);
        const data = await response.json();
        if (data.urls && data.urls.regular) {
            const imageUrl = data.urls.regular;
            localStorage.setItem(cacheKey, JSON.stringify({ url: imageUrl, timestamp: Date.now() }));
            return imageUrl;
        }
        // API 응답 실패 시 기본 이미지 반환
        return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2865&auto=format&fit=crop';
    } catch (error) {
        console.error('Error fetching from Unsplash:', error);
        // 네트워크 에러 시 기본 이미지 반환
        return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2865&auto=format&fit=crop';
    }
}

/**
 * 이미지를 미리 로드하여 부드러운 배경 전환을 돕습니다.
 * @param {string} url - 이미지 URL
 */
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;
    });
}

/**
 * Feather 아이콘 HTML을 생성합니다.
 * @param {string} iconName - 아이콘 이름
 * @param {string} className - 적용할 CSS 클래스
 */
function createIcon(iconName, className) {
    return `<i data-feather="${iconName}" class="${className}"></i>`;
}

/**
 * 날씨 정보를 가져와 화면에 표시하는 메인 함수
 */
async function getWeather() {
    const loc = input.value.trim();
    const resultDiv = document.getElementById("weatherDiv");
    const hourlyDiv = document.getElementById("hourly-forecast");
    const dailyDiv = document.getElementById("daily-forecast");
    const loader = document.getElementById("loader");

    // 1. UI 초기화 (로딩 스피너 표시)
    weatherApp.classList.remove('visible');
    loader.style.display = "block";
    resultDiv.innerHTML = "";
    hourlyDiv.innerHTML = "";
    dailyDiv.innerHTML = "";

    try {
        let lat, lon, display_name;

        // 2. 위치 정보 가져오기 (검색어 또는 Geolocation)
        if (loc) {
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.length) {
                throw new Error("Location not found");
            }
            ({ lat, lon, display_name } = geoData[0]);
        } else {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            display_name = "Current Location";
        }

        // 3. 날씨 API 호출
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        const { current, hourly, daily } = weatherData;
        const weatherInfo = getWeatherInfo(current.weather_code);

        // 4. 배경 이미지 사전 로딩 및 적용
        const backgroundImageUrl = await getBackgroundImage(weatherInfo.query);
        await preloadImage(backgroundImageUrl);
        document.body.style.backgroundImage = `url('${backgroundImageUrl}')`;

        // 5. 지역 이름 포맷팅
        let formatted_display_name = display_name;
        if (display_name !== "Current Location") {
            const parts = display_name.split(',').map(part => part.trim());
            formatted_display_name = parts.length > 1 ? `${parts[0]}, ${parts[parts.length - 1]}` : display_name;
        }

        // 6. 현재 날씨 UI 업데이트
        resultDiv.innerHTML = `
            <h2>${formatted_display_name}</h2>
            ${createIcon(weatherInfo.icon, 'main-weather-icon')}
            <div class="weather-text">
                <p>${Math.round(current.temperature_2m)}°C</p>
                <p>${weatherInfo.text}</p>
            </div>
        `;

        // 7. 예보 UI 업데이트
        displayHourlyForecast(hourly);
        displayDailyForecast(daily);

    } catch (error) {
        resultDiv.innerHTML = `<h2>Could not fetch weather data.</h2><p>${error.message}</p>`;
        console.error(error);
    } finally {
        // 8. 로딩 완료 후 UI 표시
        loader.style.display = "none";
        weatherApp.classList.add('visible');
        feather.replace();
    }
}

/**
 * 시간별 예보를 화면에 표시합니다.
 * @param {object} hourly - 시간별 예보 데이터
 */
function displayHourlyForecast(hourly) {
    const forecastDiv = document.getElementById("hourly-forecast");
    let html = "<h3>Next 24 Hours</h3><div class='forecast-container'>";
    const now = new Date();
    const startIndex = hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());

    if (startIndex === -1) return;

    for (let i = startIndex; i < startIndex + 24; i++) {
        if (i >= hourly.time.length) break;
        const time = new Date(hourly.time[i]);
        const weatherInfo = getWeatherInfo(hourly.weather_code[i]);
        const precip_prob = hourly.precipitation_probability[i];

        html += `
            <div class="forecast-item">
                <p>${time.getHours()}:00</p>
                ${createIcon(weatherInfo.icon, 'forecast-icon')}
                <p>${Math.round(hourly.temperature_2m[i])}°C</p>
                <div class="precip-bar-container">
                    <div class="precip-bar" style="height: ${precip_prob}%;"></div>
                </div>
                <p class="precip-text">${precip_prob}%</p>
            </div>
        `;
    }
    forecastDiv.innerHTML = html + "</div>";
}

/**
 * 주간 예보를 화면에 표시합니다.
 * @param {object} daily - 주간 예보 데이터
 */
function displayDailyForecast(daily) {
    const forecastDiv = document.getElementById("daily-forecast");
    let html = "<h3>This Week</h3><div class='forecast-container'>";
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);
        html += `
            <div class="forecast-item">
                <p>${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                ${createIcon(weatherInfo.icon, 'forecast-icon')}
                <p>${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</p>
            </div>
        `;
    }
    forecastDiv.innerHTML = html + "</div>";
}