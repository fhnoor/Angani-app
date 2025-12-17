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

        // Check if request was successful
        if (!response.ok) {
            throw new Error('City not found');
        }

        // Get the data
        const data = await response.json();

        // Display the weather
        displayWeather(data);

    } catch (error) {
        // Show error message
        errorMessage.textContent = 'City not found! Try again.';
        errorMessage.classList.remove('hidden');
    }
}

// Function to display weather data
function displayWeather(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = 
        `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = 
        data.weather[0].description;
    document.getElementById('humidity').textContent = 
        `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = 
        `${data.wind.speed} m/s`;

    weatherDisplay.classList.remove('hidden');
}