let currentUnit = 'metric';
let currentTheme = localStorage.getItem('theme') || 'light';
let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
let currentCity = null;
let currentLocation = null;
let autoRefreshInterval;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    updateTheme(currentTheme === 'dark');

    updateUnitDisplay(currentUnit);

    await loadInitialWeatherData();

    loadFavoriteCities();

    setupEventListeners();
}

async function loadInitialWeatherData() {
    showLoading();
    
    try {
        const userLocation = await getUserLocation();
        currentLocation = userLocation;

        await loadWeatherDataByCoords(userLocation.lat, userLocation.lon);

        const locationInfo = await getCurrentWeatherByCoords(userLocation.lat, userLocation.lon);
        currentCity = locationInfo.name;
        
    } catch (error) {
        console.log('Tidak bisa mendapatkan lokasi, menggunakan kota default:', error.message);

        const fallbackCity = favoriteCities.length > 0 ? favoriteCities[0] : 'Jakarta';
        currentCity = fallbackCity;
        await loadWeatherData(fallbackCity);
    }
    startAutoRefresh();
}

function setupEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    const unitToggle = document.getElementById('unitToggle');
    const refreshBtn = document.getElementById('refreshBtn');
    const searchBox = document.getElementById('searchBox');
    
    themeToggle.addEventListener('click', toggleTheme);
    unitToggle.addEventListener('click', toggleUnit);
    refreshBtn.addEventListener('click', refreshWeather);
    searchBox.addEventListener('input', handleSearchInput);
    searchBox.addEventListener('keydown', handleSearchKeydown);
    
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !document.getElementById('autocompleteList').contains(e.target)) {
            document.getElementById('autocompleteList').style.display = 'none';
        }
    });
}

async function loadWeatherData(city) {
    showLoading();
    
    try {
        const [currentData, forecastData] = await Promise.all([
            getCurrentWeather(city, currentUnit),
            getForecast(city, currentUnit)
        ]);
        
        displayCurrentWeather(currentData, currentUnit);
        displayForecast(forecastData, currentUnit);
        currentCity = city;
        currentLocation = null; 
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function loadWeatherDataByCoords(lat, lon) {
    showLoading();
    
    try {
        const [currentData, forecastData] = await Promise.all([
            getCurrentWeatherByCoords(lat, lon, currentUnit),
            getForecastByCoords(lat, lon, currentUnit)
        ]);
        
        displayCurrentWeather(currentData, currentUnit);
        displayForecast(forecastData, currentUnit);
        currentLocation = { lat, lon };
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function refreshWeather() {
    if (currentLocation) {
        loadWeatherDataByCoords(currentLocation.lat, currentLocation.lon);
    } else {
        loadWeatherData(currentCity);
    }
    
    const refreshIcon = document.querySelector('#refreshBtn i');
    refreshIcon.classList.add('fa-spin');
    setTimeout(() => {
        refreshIcon.classList.remove('fa-spin');
    }, 1000);
}

function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    autoRefreshInterval = setInterval(() => {
        if (currentLocation) {
            loadWeatherDataByCoords(currentLocation.lat, currentLocation.lon);
        } else {
            loadWeatherData(currentCity);
        }
    }, 5 * 60 * 1000);
}

async function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        document.getElementById('autocompleteList').style.display = 'none';
        return;
    }
    
    const suggestions = await searchCities(query);
    displayAutocomplete(suggestions, (city) => {
        searchBox.value = city;
        searchCity(city);
    });
}

function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        searchCity(searchBox.value);
    }
}

function searchCity(city) {
    if (city) {
        currentCity = city;
        currentLocation = null; 
        loadWeatherData(city);
        searchBox.value = '';
        document.getElementById('autocompleteList').style.display = 'none';
    }
}

function loadFavoriteCities() {
    displayFavoriteCities(favoriteCities, 
        (city) => { 
            currentCity = city;
            currentLocation = null; 
            loadWeatherData(city);
        },
        (city) => {
            removeFavoriteCity(city);
        }
    );
}

function onCityAdd(city) {
    if (city && !favoriteCities.includes(city)) {
        favoriteCities.push(city);
        saveFavoriteCities();
        loadFavoriteCities();
    }
}

function removeFavoriteCity(city) {
    if (confirm(`Hapus ${city} dari daftar favorit?`)) {
        favoriteCities = favoriteCities.filter(fav => fav !== city);
        saveFavoriteCities();
        loadFavoriteCities();
    }
}

function saveFavoriteCities() {
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    updateTheme(currentTheme === 'dark');
    localStorage.setItem('theme', currentTheme);
}

function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    updateUnitDisplay(currentUnit);
    
    if (currentLocation) {
        loadWeatherDataByCoords(currentLocation.lat, currentLocation.lon);
    } else {
        loadWeatherData(currentCity);
    }
}