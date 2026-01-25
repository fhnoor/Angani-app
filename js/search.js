// OpenWeather API Configuration
const API_KEY = '4a6d854f67df1355a78ef1a87510fcb2';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const errorMsg = document.getElementById('errorMsg');

// Search for a city
async function searchCity(cityName) {
    if (!cityName.trim()) {
        errorMsg.textContent = 'Please enter a city name';
        searchResults.innerHTML = '';
        return;
    }

    errorMsg.textContent = '';
    searchResults.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Searching...</p>';

    try {
        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayCity(data);
    } catch (error) {
        errorMsg.textContent = 'City not found. Please try another search.';
        searchResults.innerHTML = '';
    }
}

// Display the city weather result
function displayCity(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const countryCode = data.sys && data.sys.country ? data.sys.country : '';
    
    searchResults.innerHTML = `
        <div class="city-card" onclick="showCityWeather('${data.name}', ${data.coord.lat}, ${data.coord.lon})">
            <h3>${data.name}, ${countryCode}</h3>
            <p><strong>${temp}°C</strong> - ${description}</p>
            <p style="margin-top: 10px; color: rgba(255,255,255,0.5); font-size: 12px;">Click to view more details</p>
        </div>
    `;
}

// Show city weather details
function showCityWeather(cityName, lat, lon) {
    // Store the city data in localStorage
    localStorage.setItem('selectedCity', JSON.stringify({ name: cityName, lat, lon }));
    // Redirect to a weather details page or display it here
    window.location.href = `weather-detail.html?city=${encodeURIComponent(cityName)}`;
}

// Event listeners
searchBtn.addEventListener('click', () => {
    searchCity(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCity(searchInput.value);
    }
});

// Focus on input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
});
