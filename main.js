document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    const locInput = document.getElementById("locInput");
    const searchButton = document.getElementById("searchButton");
    const clearSearchButton = document.getElementById("clearSearchButton");
    const searchContainer = document.querySelector('.search-bar');
    const searchHistoryContainer = document.getElementById('search-history');
    const weatherApp = document.querySelector('.weather-app');
    const resultDiv = document.getElementById("weatherDiv");
    const hourlyDiv = document.getElementById("hourly-forecast");
    const dailyDiv = document.getElementById("daily-forecast");
    const loader = document.getElementById("loader");

    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // --- 검색 기록 관련 함수 ---

    let activeHistoryIndex = -1;

    function displaySearchHistory(filteredHistory) {
        searchHistoryContainer.innerHTML = '';
        activeHistoryIndex = -1; // Reset active index whenever history is displayed
        const history = (filteredHistory || searchHistory).slice(0, 4); // Limit to 4 items

        if (history.length > 0) {
            history.forEach(term => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                const historyText = document.createElement('span');
                historyText.className = 'history-text';
                historyText.textContent = term;
                historyItem.appendChild(historyText);
                historyItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    locInput.value = term;
                    searchHistoryContainer.style.display = 'none';
                    handleSearch();
                });

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-history-item';
                deleteButton.innerHTML = '&times;';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Remove the item from the main history array
                    searchHistory = searchHistory.filter(t => t !== term);
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

                    // Get the current filter term from the input
                    const currentFilter = locInput.value.toLowerCase();
                    
                    // Filter the (now updated) search history
                    const filteredHistory = searchHistory.filter(t => t.toLowerCase().includes(currentFilter));
                    
                    // Re-display the history with the filter still applied
                    displaySearchHistory(filteredHistory);
                });

                historyItem.appendChild(deleteButton);
                searchHistoryContainer.appendChild(historyItem);
            });

            const footer = document.createElement('div');
            footer.className = 'search-history-footer';
            const clearButton = document.createElement('button');
            clearButton.id = 'clear-history';
            clearButton.textContent = 'Clear All';
            clearButton.addEventListener('click', (e) => {
                e.stopPropagation();
                searchHistory = [];
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                searchHistoryContainer.style.display = 'none';
            });
            footer.appendChild(clearButton);
            searchHistoryContainer.appendChild(footer);

            searchHistoryContainer.style.display = 'block';
        } else {
            searchHistoryContainer.style.display = 'none';
        }
    }

    function addTermToHistory(term) {
        if (term && !searchHistory.includes(term)) {
            searchHistory.unshift(term);
            if (searchHistory.length > 10) {
                searchHistory.pop();
            }
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }
    }

    // --- 검색 실행 함수 ---
    
    function handleSearch() {
        const searchTerm = locInput.value.trim();
        if (searchTerm) {
            addTermToHistory(searchTerm);
        }
        getWeather(searchTerm);
        searchHistoryContainer.style.display = 'none';
    }

    // --- 이벤트 리스너 설정 ---

    function setSearchHistoryPosition() {
        const inputWrapper = document.querySelector('.input-wrapper');
        const rect = inputWrapper.getBoundingClientRect();
        searchHistoryContainer.style.left = `${rect.left}px`;
        searchHistoryContainer.style.top = `${rect.bottom + 5}px`;
        searchHistoryContainer.style.width = `${rect.width}px`;
    }

    locInput.addEventListener('focus', () => {
        setSearchHistoryPosition();
        const searchTerm = locInput.value.toLowerCase();
        const filteredHistory = searchHistory.filter(term => term.toLowerCase().includes(searchTerm));
        displaySearchHistory(filteredHistory);
    });

    window.addEventListener('resize', () => {
        if (searchHistoryContainer.style.display === 'block') {
            setSearchHistoryPosition();
        }
    });

    locInput.addEventListener("input", () => {
        clearSearchButton.style.display = locInput.value.length > 0 ? "block" : "none";
        const searchTerm = locInput.value.toLowerCase();
        const filteredHistory = searchHistory.filter(term => term.toLowerCase().includes(searchTerm));
        displaySearchHistory(filteredHistory);
    });

    locInput.addEventListener("keydown", (event) => {
        const items = searchHistoryContainer.querySelectorAll('.history-item');

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (items.length === 0) return; // Only return if no items for arrow navigation
            activeHistoryIndex++;
            if (activeHistoryIndex >= items.length) activeHistoryIndex = 0;
            updateActiveHistoryItem(items);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (items.length === 0) return; // Only return if no items for arrow navigation
            activeHistoryIndex--;
            if (activeHistoryIndex < 0) activeHistoryIndex = items.length - 1;
            updateActiveHistoryItem(items);
        } else if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission
            if (activeHistoryIndex > -1) {
                items[activeHistoryIndex].click();
            } else {
                handleSearch();
            }
        }
    });

    function updateActiveHistoryItem(items) {
        items.forEach(item => item.classList.remove('active'));
        if (activeHistoryIndex > -1) {
            const activeItem = items[activeHistoryIndex];
            activeItem.classList.add('active');
            locInput.value = activeItem.querySelector('.history-text').textContent;
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }

    clearSearchButton.addEventListener("click", () => {
        locInput.value = "";
        clearSearchButton.style.display = "none";
        getWeather(); // 기본 위치 날씨 다시 로드
    });

    searchButton.addEventListener('click', handleSearch);

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !searchHistoryContainer.contains(e.target)) {
            searchHistoryContainer.style.display = 'none';
        }
    });

    // 페이지 첫 로드 시 현재 위치 날씨 가져오기
    window.addEventListener("load", () => {
        getWeather();
        feather.replace();
    });

    // --- 날씨 API 및 데이터 처리 ---

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
            }
            return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2865&auto=format&fit=crop';
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

    async function getWeather(loc = '') {
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

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
            const weatherRes = await fetch(weatherUrl);
            const weatherData = await weatherRes.json();
            const { current, hourly, daily } = weatherData;
            const weatherInfo = getWeatherInfo(current.weather_code);

            const backgroundImageUrl = await getBackgroundImage(weatherInfo.query);
            await preloadImage(backgroundImageUrl);
            document.body.style.backgroundImage = `url('${backgroundImageUrl}')`;

            let formatted_display_name = display_name;
            if (display_name !== "Current Location") {
                const parts = display_name.split(',').map(part => part.trim());
                formatted_display_name = `${parts[0]}, ${parts[parts.length - 1]}`;
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

        } catch (error) {
            resultDiv.innerHTML = `<h2>Could not fetch weather data.</h2><p>${error.message}</p>`;
            console.error(error);
        } finally {
            loader.style.display = "none";
            weatherApp.classList.add('visible');
            feather.replace();
        }
    }

    function displayHourlyForecast(hourly) {
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
        hourlyDiv.innerHTML = html + "</div>";
    }

    function displayDailyForecast(daily) {
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
        dailyDiv.innerHTML = html + "</div>";
    }
});