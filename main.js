const input = document.getElementById("locInput");
const button = document.getElementById("searchButton");
const clearButton = document.getElementById("clearSearchButton");
const weatherApp = document.querySelector('.weather-app');
const unsplashAccessKey = UNSPLASH_ACCESS_KEY;

// Event listener for input to show/hide clear button
input.addEventListener("input", function() {
    if (input.value.length > 0) {
        clearButton.style.display = "block";
    } else {
        clearButton.style.display = "none";
    }
});

// Event listener for clear button
clearButton.addEventListener("click", function() {
    input.value = ""; // Clear the input
    clearButton.style.display = "none"; // Hide the clear button
    getWeather(); // Fetch weather for current location
});

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});
button.addEventListener("click", getWeather);

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

function getWeatherInfo(code) {
    return weatherConditions[code] || { icon: 'help-circle', text: 'Unknown', query: 'weather' };
}

async function getBackgroundImage(query) {
    const cacheKey = `bg_image_${query.replace(/\s/g, '_')}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        const { url, timestamp } = JSON.parse(cachedData);
        // Cache for 1 hour
        if (Date.now() - timestamp < 3600000) {
            return url;
        }
    }

    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();
        if (data.urls && data.urls.regular) {
            const imageUrl = data.urls.regular;
            localStorage.setItem(cacheKey, JSON.stringify({ url: imageUrl, timestamp: Date.now() }));
            return imageUrl;
        } else {
            return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2865&auto=format&fit=crop';
        }
    } catch (error) {
        console.error('Error fetching from Unsplash:', error);
        return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2865&auto=format&fit=crop';
    }
}

function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;
    });
}

function createIcon(iconName, className) {
    return `<i data-feather="${iconName}" class="${className}"></i>`;
}

async function getWeather() {
    const loc = input.value.trim();
    const resultDiv = document.getElementById("weatherDiv");
    const hourlyDiv = document.getElementById("hourly-forecast");
    const dailyDiv = document.getElementById("daily-forecast");
    const loader = document.getElementById("loader");

    weatherApp.classList.remove('visible');
    loader.style.display = "block";
    resultDiv.innerHTML = "";
    hourlyDiv.innerHTML = "";
    dailyDiv.innerHTML = "";

    try {
        let lat, lon, display_name;

        if (loc) {
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.length) {
                resultDiv.innerHTML = "<h2>Location not found</h2>";
                loader.style.display = "none";
                weatherApp.classList.add('visible');
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

        const backgroundImageUrl = await getBackgroundImage(weatherInfo.query);
        await preloadImage(backgroundImageUrl);
        document.body.style.backgroundImage = `url('${backgroundImageUrl}')`;

        let formatted_display_name;
        if (display_name === "Current Location") {
            formatted_display_name = display_name;
        } else {
            const parts = display_name.split(',').map(part => part.trim());
            if (parts.length > 1) {
                formatted_display_name = `${parts[0]}, ${parts[parts.length - 1]}`;
            } else {
                formatted_display_name = display_name;
            }
        }

        resultDiv.innerHTML = `
            <h2>${formatted_display_name}</h2>
            ${createIcon(weatherInfo.icon, 'main-weather-icon')}
            <div class="weather-text">
                <p>${Math.round(current.temperature_2m)}°C</p>
                <p>${weatherInfo.text}</p>
            </div>
        `;

        displayHourlyForecast(hourly);
        displayDailyForecast(daily);

        loader.style.display = "none";
        weatherApp.classList.add('visible');
        feather.replace();

    } catch (error) {
        loader.style.display = "none";
        resultDiv.innerHTML = "<h2>Could not fetch weather data.</h2><p>Please try again or check your connection.</p>";
        weatherApp.classList.add('visible');
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
                ${createIcon(weatherInfo.icon, 'forecast-icon')}
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
                ${createIcon(weatherInfo.icon, 'forecast-icon')}
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
