// YOUR API KEY HERE
const API_KEY = '4a6d854f67df1355a78ef1a87510fcb2'; // Replace with your actual key!
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get elements from HTML
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');

// When search button is clicked
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

// When Enter key is pressed in input
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

// Function to fetch weather from API
async function getWeather(city) {
    try {
        // Hide previous results
        weatherDisplay.classList.add('hidden');
        errorMessage.classList.add('hidden');

        // Make API request
        const response = await fetch(
            `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        // Parse body so we can show API error messages if any
        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
            // OpenWeather returns { message: '...' } for many errors
            throw new Error(data.message || 'City not found');
        }

        // Display the weather
        displayWeather(data);

    } catch (error) {
        // Log detailed error to console to help debugging
        console.error('Weather fetch error:', error);

        // Show a helpful message to the user
        errorMessage.textContent = error.message || 'An error occurred. Try again.';
        errorMessage.classList.remove('hidden');
    }
}

// Function to display weather data
function displayWeather(data) {
    // Show city and country (full country name when possible)
    const cityName = data.name || '';
    const countryCode = data.sys && data.sys.country ? data.sys.country : '';
    let countryName = countryCode;
    if (countryCode) {
        try {
            // Use Intl.DisplayNames to get full country name (modern browsers)
            const dn = new Intl.DisplayNames(['en'], { type: 'region' });
            const full = dn.of(countryCode);
            if (full) countryName = full;
        } catch (e) {
            // If Intl.DisplayNames not supported, keep countryCode as fallback
            countryName = countryCode;
        }
    }

    // Display as UPPERCASE like "MWANZA, TANZANIA"
    const combined = countryName ? `${cityName.toLowerCase()}, ${countryName.toUpperCase()}` : cityName.toLowerCase();
    document.getElementById('city-name').textContent = combined;
    document.getElementById('temperature').textContent = 
        `${Math.round(data.main.temp)}°C`;
    const conditionDesc = data.weather[0].description || '';
    document.getElementById('description').textContent = conditionDesc;
    document.getElementById('humidity').textContent = 
        `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = 
        `${data.wind.speed} m/s`;

    // Render condition animation
    const main = (data.weather && data.weather[0] && data.weather[0].main) || '';
    const tempC = Math.round(data.main.temp);
    renderConditionAnimation(main, tempC);

    weatherDisplay.classList.remove('hidden');
}

// Decide which animation to show based on condition
function renderConditionAnimation(main, tempC = 20) {
    const holder = document.getElementById('condition-anim');
    if (!holder) return;
    const type = (main || '').toLowerCase();

    if (['rain', 'drizzle', 'thunderstorm'].includes(type)) {
        holder.innerHTML = createRainHTML();
    } else if (['snow'].includes(type) || (tempC <= 0 && type === 'clouds')) {
        // Show snow if API says snow, OR if cold (≤0°C) and cloudy
        holder.innerHTML = createSnowHTML();
    } else if (['clear'].includes(type)) {
        holder.innerHTML = `
            <div class="anim-sun">
                <div class="rays"></div>
                <div class="core"></div>
            </div>`;
    } else { // clouds, mist, fog, smoke, etc.
        holder.innerHTML = `
            <div class="anim-clouds">
                <div class="cloud"></div>
            </div>`;
    }
}

// Generate rain drops with random properties
function createRainHTML() {
    // Generate multiple drops with different positions/delays
    const drops = Array.from({ length: 18 }).map((_, i) => {
        const left = Math.random() * 150; // width of container
        const delay = Math.random() * 1;  // 0..1s
        const dur = 0.8 + Math.random() * 0.5; // 0.8..1.3s
        return `<span class="drop" style="left:${left}px; animation-duration:${dur}s; animation-delay:${delay}s;"></span>`;
    }).join('');
    return `<div class="anim-rain">${drops}</div>`;
}

// Generate snowflakes with random properties
function createSnowHTML() {
    // Generate 50 snowflakes with varied sizes, speeds, and delays
    const flakes = Array.from({ length: 50 }).map(() => {
        const left = Math.random() * 220;
        const delay = -(Math.random() * 3); // Negative delay for immediate start
        const size = 2 + Math.random() * 7; // 2-9px sizes
        const fallDur = 2.5 + Math.random() * 3; // 2.5-5.5s fall duration
        const swayDur = 2 + Math.random() * 2.5; // 2-4.5s sway duration
        const opacity = 0.5 + Math.random() * 0.5; // 0.5-1.0 opacity
        
        return `<span class="flake" style="left:${left}px; width:${size}px; height:${size}px; animation: snowFall ${fallDur}s linear infinite, snowSway ${swayDur}s ease-in-out infinite; animation-delay:${delay}s; opacity:${opacity};"></span>`;
    }).join('');
    return `<div class="anim-snow">${flakes}</div>`;
}