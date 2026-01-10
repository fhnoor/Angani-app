// OpenWeather API Configuration
const API_KEY = '4a6d854f67df1355a78ef1a87510fcb2'; // Replace with your OpenWeather API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const loading = document.getElementById('loading');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');
const continueBtn = document.getElementById('continueBtn');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');

// Get user's current location
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(lat, lon);
        },
        // Error callback
        (error) => {
            handleLocationError(error);
        }
    );
}

// Handle geolocation errors
function handleLocationError(error) {
    loading.classList.add('hidden');
    errorMessage.classList.add('active');
    continueBtn.classList.add('active');

    let errorMsg = 'Unable to get your location. ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMsg += 'Please enable location services to see your local weather.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMsg += 'The request to get your location timed out.';
            break;
        default:
            errorMsg += 'An unknown error occurred.';
            break;
    }
    errorMessage.textContent = errorMsg;
}

// Fetch weather data from OpenWeather API
async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(
            `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Weather data could not be fetched');
        }

        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError('Failed to fetch weather data. Please try again later.');
    }
}

// Display weather information
function displayWeather(data) {
    loading.classList.add('hidden');
    weatherInfo.classList.add('active');
    continueBtn.classList.add('active');

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    
    // Render weather animation
    const main = data.weather[0].main;
    const tempC = Math.round(data.main.temp);
    renderConditionAnimation(main, tempC);
}

// Show error message
function showError(message) {
    loading.classList.add('hidden');
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
    continueBtn.classList.add('active');
}

// Handle continue button click
continueBtn.addEventListener('click', () => {
    window.location.href = 'signin.html';
});

// Initialize the app
function init() {
    // Get user's location and fetch weather
    getUserLocation();
}

// Decide which animation to show based on condition
function renderConditionAnimation(main, tempC = 20) {
    const holder = document.getElementById('condition-anim');
    if (!holder) return;
    const type = (main || '').toLowerCase();

    if (['rain', 'drizzle', 'thunderstorm'].includes(type)) {
        holder.innerHTML = createRainHTML();
    } else if (['snow'].includes(type) || (tempC <= 0 && type === 'clouds')) {
        holder.innerHTML = createSnowHTML();
    } else if (['clear'].includes(type)) {
        holder.innerHTML = `
            <div class="anim-sun">
                <div class="rays"></div>
                <div class="core"></div>
            </div>`;
    } else {
        holder.innerHTML = `
            <div class="anim-clouds">
                <div class="cloud"></div>
            </div>`;
    }
}

// Generate rain drops with random properties
function createRainHTML() {
    const drops = Array.from({ length: 18 }).map((_, i) => {
        const left = Math.random() * 150;
        const delay = Math.random() * 1;
        const dur = 0.8 + Math.random() * 0.5;
        return `<span class="drop" style="left:${left}px; animation-duration:${dur}s; animation-delay:${delay}s;"></span>`;
    }).join('');
    return `<div class="anim-rain">${drops}</div>`;
}

// Generate snowflakes with random properties
function createSnowHTML() {
    const flakes = Array.from({ length: 50 }).map(() => {
        const left = Math.random() * 220;
        const delay = -(Math.random() * 3);
        const size = 2 + Math.random() * 7;
        const fallDur = 2.5 + Math.random() * 3;
        const swayDur = 2 + Math.random() * 2.5;
        const opacity = 0.5 + Math.random() * 0.5;
        
        return `<span class="flake" style="left:${left}px; width:${size}px; height:${size}px; animation: snowFall ${fallDur}s linear infinite, snowSway ${swayDur}s ease-in-out infinite; animation-delay:${delay}s; opacity:${opacity};"></span>`;
    }).join('');
    return `<div class="anim-snow">${flakes}</div>`;
}

// Start the app when DOM is loaded
init();
