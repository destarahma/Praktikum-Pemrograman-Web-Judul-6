function displayCurrentWeather(data, units, isCurrentLocation = false) {
    const cityName = document.getElementById('cityName');
    const timestamp = document.getElementById('timestamp');
    const temperature = document.getElementById('temperature');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherCondition = document.getElementById('weatherCondition');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');

    const locationBadge = isCurrentLocation ? '<span class="location-badge">Lokasi Anda</span>' : '';
    
    cityName.innerHTML = `${data.name}, ${data.sys.country} ${locationBadge}`;
    timestamp.textContent = formatTimestamp(data.dt);
    temperature.textContent = `${Math.round(data.main.temp)}°${units === 'metric' ? 'C' : 'F'}`;
    weatherCondition.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}`;

    const iconCode = data.weather[0].icon;
    weatherIcon.innerHTML = `<i class="${getWeatherIcon(iconCode)}"></i>`;
}

function displayForecast(data, units) {
    const forecastContainer = document.getElementById('forecastCards');

    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
    });

    const forecastDays = Object.keys(dailyForecasts).slice(0, 5);
    
    let forecastHTML = '';
    forecastDays.forEach(day => {
        const dayData = dailyForecasts[day];
        const date = new Date(day);
        const minTemp = Math.round(Math.min(...dayData.map(item => item.main.temp_min)));
        const maxTemp = Math.round(Math.max(...dayData.map(item => item.main.temp_max)));
        const iconCode = dayData[0].weather[0].icon;
        const description = dayData[0].weather[0].description;

        forecastHTML += `
            <div class="forecast-card">
                <div class="forecast-date">${formatDate(date)}</div>
                <div class="forecast-icon"><i class="${getWeatherIcon(iconCode)}"></i></div>
                <div class="forecast-desc">${description}</div>
                <div class="forecast-temp">
                    <span class="temp-max">${maxTemp}°${units === 'metric' ? 'C' : 'F'}</span>
                    <span class="temp-min">${minTemp}°${units === 'metric' ? 'C' : 'F'}</span>
                </div>
            </div>
        `;
    });

    forecastContainer.innerHTML = forecastHTML;
}

function showLoading(message = 'Memuat data cuaca...') {
    document.querySelectorAll('.loading').forEach(el => {
        el.classList.remove('hidden');
        if (!el.querySelector('.loading-text')) {
            const loadingText = document.createElement('div');
            loadingText.className = 'loading-text';
            loadingText.textContent = message;
            el.appendChild(loadingText);
        } else {
            el.querySelector('.loading-text').textContent = message;
        }
    });
    document.querySelectorAll('.weather-content').forEach(el => el.classList.add('hidden'));
}

function displayFavoriteCities(favorites, onCityClick, onCityRemove) {
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = '';

    favorites.forEach(city => {
        const favoriteElement = document.createElement('div');
        favoriteElement.className = 'favorite-city';
        favoriteElement.innerHTML = `
            <i class="fas fa-star"></i>
            <span>${city}</span>
            <i class="fas fa-times remove-btn"></i>
        `;

        favoriteElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-btn')) {
                onCityClick(city);
            }
        });

        const removeBtn = favoriteElement.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onCityRemove(city);
        });
        
        container.appendChild(favoriteElement);
    });

    if (favorites.length < 5) {
        const addFavorite = document.createElement('div');
        addFavorite.className = 'favorite-city';
        addFavorite.innerHTML = `
            <i class="fas fa-plus"></i>
            <span>Tambah Favorit</span>
        `;
        addFavorite.addEventListener('click', () => {
            const city = prompt('Masukkan nama kota:');
            if (city) {
                onCityAdd(city);
            }
        });
        container.appendChild(addFavorite);
    }
}

function displayAutocomplete(suggestions, onSelect) {
    const list = document.getElementById('autocompleteList');
    
    if (suggestions.length === 0) {
        list.style.display = 'none';
        return;
    }
    
    list.innerHTML = '';
    suggestions.forEach(city => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = city;
        item.addEventListener('click', () => onSelect(city));
        list.appendChild(item);
    });
    
    list.style.display = 'block';
}

function showLoading() {
    document.querySelectorAll('.loading').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.weather-content').forEach(el => el.classList.add('hidden'));
}

function hideLoading() {
    document.querySelectorAll('.loading').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.weather-content').forEach(el => el.classList.remove('hidden'));
}

function updateTheme(isDark) {
    const themeIcon = document.querySelector('#themeToggle i');
    const themeText = document.querySelector('#themeToggle span');
    
    if (isDark) {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    }
}

function updateUnitDisplay(unit) {
    const unitText = document.querySelector('#unitToggle span');
    unitText.textContent = unit === 'metric' ? '°C / °F' : '°F / °C';
}

function showError(message) {
    alert('Terjadi kesalahan: ' + message);
}