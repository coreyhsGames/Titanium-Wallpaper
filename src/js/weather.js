let latitude = 0;
let longitude = 0;

// Static weather svg icons
const iconsStatic = {
    'clear': './weatherIcons/static/clear-day.svg',
    'cloudy': './weatherIcons/static/cloudy.svg',
    'fog': './weatherIcons/static/fog.svg',
    'drizzle': './weatherIcons/static/rainy-1.svg',
    'freezing-drizzle': './weatherIcons/static/snowy-1.svg',
    'rain': './weatherIcons/static/rainy-3.svg',
    'freezing-rain': './weatherIcons/static/snow-and-sleet-mix.svg',
    'snow': './weatherIcons/static/snowy-3.svg',
    'thunderstorm': './weatherIcons/static/severe-thunderstorm.svg',
};

// Animated weather svg icons
const iconsAnimated = {
    'clear': './weatherIcons/animated/clear-day.svg',
    'cloudy': './weatherIcons/animated/cloudy.svg',
    'fog': './weatherIcons/animated/fog.svg',
    'drizzle': './weatherIcons/animated/rainy-1.svg',
    'freezing-drizzle': './weatherIcons/animated/snowy-1.svg',
    'rain': './weatherIcons/animated/rainy-3.svg',
    'freezing-rain': './weatherIcons/animated/snow-and-sleet-mix.svg',
    'snow': './weatherIcons/animated/snowy-3.svg',
    'thunderstorm': './weatherIcons/animated/severe-thunderstorm.svg',
};

function waitForCityConfig() {
    return new Promise((resolve) => {
        const checkCityInterval = setInterval(() => {
            if (window.config && window.config.city) {
                clearInterval(checkCityInterval);
                resolve();
            }
        }, 100); // Check every 100 milliseconds
    });
}

async function fetchDailyWeather() {
    const cityReposnse = await fetch(`https://nominatim.openstreetmap.org/search?city=${window.config.city}&format=json`);
    const cityData = await cityReposnse.json();

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityData[0].lat}&longitude=${cityData[0].lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    const data = await response.json();

    if (data.daily) {
        const container = document.getElementById('daily-weather-container');
        container.innerHTML = ''; // Clear existing content

        // Get the days of the week
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        document.querySelector('.right #high-and-low').textContent = `L: ${data.daily.temperature_2m_min[0]}° H: ${data.daily.temperature_2m_max[0]}°`

        // Display forecast for next 5 days (or available days)
        for (let i = 0; i < Math.min(data.daily.time.length, 5); i++) {
            const date = new Date(data.daily.time[i]);
            const dayName = daysOfWeek[date.getDay()];

            const weatherCode = data.daily.weather_code[i];
            const tempMax = data.daily.temperature_2m_max[i];
            const tempMin = data.daily.temperature_2m_min[i];

            // Create weather icon based on weather code
            const { description, icon } = getWeatherDescriptionAndIcon(weatherCode, window.config.animatedWeatherIcons);

            const dayElement = document.createElement('div');
            dayElement.className = 'weather-day';
            dayElement.innerHTML = `
            <h3>${dayName}</h3>
            <div class="weather-icon"><img src="${icon}" alt="${description}"></div>
            <h3>L: ${tempMin}° H: ${tempMax}°</h3>
        `;

            container.appendChild(dayElement);
        }

        document.querySelector('.widget-container').classList.remove('hide');
    }
}

async function fetchHourlyWeather() {
    const cityResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${window.config.city}&format=json`);
    const cityData = await cityResponse.json();

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityData[0].lat}&longitude=${cityData[0].lon}&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=2`);
    const data = await response.json();

    if (data.hourly) {
        const container = document.getElementById('hourly-weather-container');
        container.innerHTML = ''; // Clear existing content

        // Get current hour and the next 6 hours
        const now = new Date();
        const currentHour = now.getHours();

        // Display forecast for next 6 hours
        for (let i = 0; i < 6; i++) {
            const hourIndex = currentHour + i;
            const timeString = data.hourly.time[hourIndex];
            const hour24 = parseInt(timeString.split('T')[1].substring(0, 2));

            // Format hour based on config
            let hourDisplay;
            if (window.config.use24HTime) {
                hourDisplay = `${hour24}:00`;
            } else {
                const period = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = hour24 % 12 || 12; // Convert 0 to 12 for 12-hour format
                hourDisplay = `${hour12} ${period}`;
            }

            const weatherCode = data.hourly.weather_code[hourIndex];
            const temperature = data.hourly.temperature_2m[hourIndex];

            // Create weather icon based on weather code
            const { description, icon } = getWeatherDescriptionAndIcon(weatherCode, window.config.animatedWeatherIcons);

            const hourElement = document.createElement('div');
            hourElement.className = 'weather-hour';
            hourElement.innerHTML = `
                <h3>${hourDisplay}</h3>
                <div class="weather-icon"><img src="${icon}" alt="${description}"></div>
                <h3>${temperature}°</h3>
            `;

            container.appendChild(hourElement);
        }

        document.querySelector('.widget-container').classList.remove('hide');
    }
}

async function fetchCurrentWeather() {
    const cityReposnse = await fetch(`https://nominatim.openstreetmap.org/search?city=${window.config.city}&format=json`);
    const cityData = await cityReposnse.json();

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityData[0].lat}&longitude=${cityData[0].lon}&current=temperature_2m,precipitation,weather_code&timezone=auto`);
    const data = await response.json();

    if (data.current) {
        document.getElementById('city-name').textContent = window.config.city;

        document.getElementById('temperature').textContent = `${data.current.temperature_2m}°C`;

        const weatherCode = data.current.weather_code;
        const weatherIcon = document.getElementById('current-weather-icon');

        // Get description and icon based on weather code
        const { description, icon } = getWeatherDescriptionAndIcon(weatherCode, window.config.animatedWeatherIcons);

        weatherIcon.innerHTML = `<img src="${icon}" alt="${description}">`;

        document.getElementById('weather-code').textContent = description;
    } else {
        document.querySelector('.weather-widget').innerHTML = `<p>Error fetching weather data. Please try again later.</p>`;
    }
};
window.fetchCurrentWeather = fetchCurrentWeather;

// Use the function to wait for the city configuration and then fetch the weather
async function initWeatherWidget() {
    await waitForCityConfig();
    fetchCurrentWeather();
    fetchHourlyWeather();
    fetchDailyWeather();

    setInterval(fetchCurrentWeather, 60000);
    setInterval(fetchHourlyWeather, 60000);
    setInterval(fetchDailyWeather, 60000);
}

// Call initWeatherWidget to start the process
initWeatherWidget();

function getWeatherDescriptionAndIcon(weatherCode, animated) {
    const icons = animated ? iconsAnimated : iconsStatic;

    switch (weatherCode) {
        case 0:
            return { description: 'Clear', icon: icons.clear };
        case 1:
        case 2:
        case 3:
            return { description: 'Cloudy', icon: icons.cloudy };
        case 45:
        case 48:
            return { description: 'Fog', icon: icons.fog };
        case 51:
        case 53:
        case 55:
            return { description: 'Light Rain', icon: icons.drizzle };
        case 56:
        case 57:
            return { description: 'Freezing Drizzle', icon: icons.freezing - drizzle };
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            return { description: 'Rain', icon: icons.rain };
        case 66:
        case 67:
            return { description: 'Freezing Rain', icon: icons.freezing - rain };
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            return { description: 'Snowy', icon: icons.snow };
        case 95:
        case 96:
        case 99:
            return { description: 'Thunderstorm', icon: icons.thunderstorm };
    }
}