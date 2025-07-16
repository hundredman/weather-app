const input = document.getElementById("locInput");
const button = document.getElementById("searchButton");
const weatherContent = document.querySelector('.weather-content');
const unsplashAccessKey = 'S-JGWTKlDt7pIdCYOvApqDfezdgvE-qxldkdwfDqs8w';

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});
button.addEventListener("click", getWeather);

const weatherConditions = {
    0: { icon: 'sun', text: 'Clear Sky' },
    1: { icon: 'sun', text: 'Mainly Clear' },
    2: { icon: 'cloud', text: 'Partly Cloudy' },
    3: { icon: 'cloud', text: 'Overcast' },
    45: { icon: 'wind', text: 'Fog' },
    48: { icon: 'wind', text: 'Depositing Rime Fog' },
    51: { icon: 'cloud-drizzle', text: 'Light Drizzle' },
    53: { icon: 'cloud-drizzle', text: 'Moderate Drizzle' },
    55: { icon: 'cloud-drizzle', text: 'Dense Drizzle' },
    61: { icon: 'cloud-rain', text: 'Slight Rain' },
    63: { icon: 'cloud-rain', text: 'Moderate Rain' },
    65: { icon: 'cloud-rain', text: 'Heavy Rain' },
    71: { icon: 'cloud-snow', text: 'Slight Snowfall' },
    73: { icon: 'cloud-snow', text: 'Moderate Snowfall' },
    75: { icon: 'cloud-snow', text: 'Heavy Snowfall' },
    80: { icon: 'cloud-lightning', text: 'Slight Rain Showers' },
    81: { icon: 'cloud-lightning', text: 'Moderate Rain Showers' },
    82: { icon: 'cloud-lightning', text: 'Violent Rain Showers' },
    95: { icon: 'cloud-lightning', text: 'Thunderstorm' },
};

function getWeatherInfo(code) {
    return weatherConditions[code] || { icon: 'help-circle', text: 'Unknown' };
}

async function getBackgroundImage(query) {
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${unsplashAccessKey}`);
        const data = await response.json();
        if (data.urls && data.urls.full) {
            return data.urls.full;
        } else {
            // Fallback image if no specific image is found
            return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2865&auto=format&fit=crop';
        }
    } catch (error) {
        console.error('Error fetching from Unsplash:', error);
        return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2865&auto=format&fit=crop';
    }
}

function createIcon(iconName) {
    return `<i data-feather="${iconName}" class="forecast-icon"></i>`;
}

async function getWeather() {
    const loc = input.value.trim();
    const resultDiv = document.getElementById("weatherDiv");
    const hourlyDiv = document.getElementById("hourly-forecast");
    const dailyDiv = document.getElementById("daily-forecast");
    const loader = document.getElementById("loader");

    weatherContent.classList.remove('visible');
    loader.style.display = "block";

    try {
        let lat, lon, display_name;

        if (loc) {
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.length) {
                resultDiv.innerHTML = "<h2>Location not found</h2>";
                loader.style.display = "none";
                weatherContent.classList.add('visible');
                return;
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

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        const { current, hourly, daily } = weatherData;
        const weatherInfo = getWeatherInfo(current.weather_code);

        const backgroundImageUrl = await getBackgroundImage(weatherInfo.text);
        document.body.style.backgroundImage = `url('${backgroundImageUrl}')`;

        let formatted_display_name;
        if (display_name === "Current Location") {
            formatted_display_name = display_name;
        } else {
            const parts = display_name.split(',').map(part => part.trim());
            if (parts.length > 1) {
                const firstPart = parts[0];
                const lastPart = parts[parts.length - 1];
                if (firstPart === lastPart) {
                    formatted_display_name = firstPart;
                } else {
                    formatted_display_name = `${firstPart}, ${lastPart}`;
                }
            } else {
                formatted_display_name = display_name;
            }
        }

        resultDiv.innerHTML = `
            <h2>${formatted_display_name}</h2>
            <div class="weather-icon">${createIcon(weatherInfo.icon)}</div>
            <div class="weather-text">
                <p>${Math.round(current.temperature_2m)}°C</p>
                <p>${weatherInfo.text}</p>
            </div>
        `;

        displayHourlyForecast(hourly);
        displayDailyForecast(daily);

        loader.style.display = "none";
        weatherContent.classList.add('visible');
        feather.replace();

    } catch (error) {
        loader.style.display = "none";
        resultDiv.innerHTML = "<h2>Could not fetch weather data.</h2><p>Please try again or check your connection.</p>";
        weatherContent.classList.add('visible');
        console.error(error);
    }
}

function displayHourlyForecast(hourly) {
    const forecastDiv = document.getElementById("hourly-forecast");
    let html = "<h3>Next 24 Hours</h3><div class='forecast-container'>";
    const now = new Date();
    const currentHour = now.getHours();
    const startIndex = hourly.time.findIndex(t => new Date(t).getHours() === currentHour);

    if (startIndex === -1) return;

    for (let i = startIndex; i < startIndex + 24; i++) {
        if (i >= hourly.time.length) break;
        const time = new Date(hourly.time[i]);
        const weatherInfo = getWeatherInfo(hourly.weather_code[i]);
        const precip_prob = hourly.precipitation_probability[i];

        html += `
            <div class="forecast-item">
                <p>${time.getHours()}:00</p>
                ${createIcon(weatherInfo.icon)}
                <p>${Math.round(hourly.temperature_2m[i])}°C</p>
                <div class="precip-bar-container">
                    <div class="precip-bar" style="height: ${precip_prob}%;"></div>
                </div>
                <p class="precip-text">${precip_prob}%</p>
            </div>
        `;
    }
    html += "</div>";
    forecastDiv.innerHTML = html;
}

function displayDailyForecast(daily) {
    const forecastDiv = document.getElementById("daily-forecast");
    let html = "<h3>This Week</h3><div class='forecast-container'>";
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);
        html += `
            <div class="forecast-item">
                <p>${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                ${createIcon(weatherInfo.icon)}
                <p>${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</p>
            </div>
        `;
    }
    html += "</div>";
    forecastDiv.innerHTML = html;
}

window.addEventListener("load", () => {
    getWeather();
    feather.replace(); 
});
