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

async function fetchCurrentWeather() {
    const cityReposnse = await fetch(`https://nominatim.openstreetmap.org/search?city=${window.config.city}&format=json`);
    const cityData = await cityReposnse.json();

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityData[0].lat}&longitude=${cityData[0].lon}&current=temperature_2m,precipitation,weathercode&timezone=Pacific%2FAuckland`);
    const data = await response.json();

    if (data.current) {
        document.querySelector('#temperature').textContent = `${data.current.temperature_2m}°C`;
        if (data.current.temperature_2m > 15) {
            document.querySelector('#temperature').classList.add('tempHigh');
            document.querySelector('#temperature').classList.remove('tempLow');
        } else {
            document.querySelector('#temperature').classList.add('tempLow');
            document.querySelector('#temperature').classList.remove('tempHigh');
        }

        const weatherCode = data.current.weathercode;
        const weatherIcon = document.getElementById('icon');

        // Get description and icon based on weather code
        const { description, icon } = getWeatherDescriptionAndIcon(weatherCode, window.config.animatedWeatherIcons);

        weatherIcon.innerHTML = `<img src="${icon}" alt="${description}">`;
        weatherIcon.title = description;
    } else {
        document.getElementById('current-weather-widget').innerHTML = `<p>Error fetching weather data. Please try again later.</p>`;
    }
};
fetchCurrentWeather();
setInterval(fetchCurrentWeather, 1000);

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