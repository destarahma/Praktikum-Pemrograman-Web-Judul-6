const API_KEY = '35d69864bd85b812305a574603958a3a'; //API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

async function getCurrentWeather(city, units = 'metric') {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${units}&lang=id`);
        if (!response.ok) {
            throw new Error('Kota tidak ditemukan');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Gagal mengambil data cuaca: ${error.message}`);
    }
}

async function getCurrentWeatherByCoords(lat, lon, units = 'metric') {
    try {
        const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}&lang=id`);
        if (!response.ok) {
            throw new Error('Gagal mengambil data cuaca');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Gagal mengambil data cuaca: ${error.message}`);
    }
}

async function getForecast(city, units = 'metric') {
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${units}&lang=id`);
        if (!response.ok) {
            throw new Error('Gagal mengambil data prakiraan');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Gagal mengambil data prakiraan: ${error.message}`);
    }
}

async function getForecastByCoords(lat, lon, units = 'metric') {
    try {
        const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}&lang=id`);
        if (!response.ok) {
            throw new Error('Gagal mengambil data prakiraan');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Gagal mengambil data prakiraan: ${error.message}`);
    }
}

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung oleh browser ini'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                let errorMessage = 'Gagal mendapatkan lokasi: ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Izin lokasi ditolak';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Informasi lokasi tidak tersedia';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Permintaan lokasi timeout';
                        break;
                    default:
                        errorMessage += 'Error tidak diketahui';
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

async function searchCities(query) {
    const cities = [
        'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang',
        'Makassar', 'Palembang', 'Denpasar', 'Yogyakarta', 'Malang',
        'London', 'New York', 'Tokyo', 'Paris', 'Sydney',
        'Singapore', 'Bangkok', 'Seoul', 'Berlin', 'Moscow'
    ];
    
    return cities.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    
    return iconMap[iconCode] || 'fas fa-cloud';
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}