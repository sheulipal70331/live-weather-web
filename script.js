const API_KEY = "f17350e45aba3fb9e23fbf3f26ce5ce3";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("search-btn");
const message = document.getElementById("message");
const weatherContent = document.getElementById("weather-content");
const emptyState = document.getElementById("empty-state");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    getWeather();
});

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showMessage("Please enter a city name.", true);
        cityInput.focus();
        return;
    }

    setLoading(true);
    showMessage("Fetching live weather...");

    try {
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        const currentData = await currentResponse.json();

        if (!currentResponse.ok) {
            throw new Error(currentData.message || "City not found.");
        }

        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
            throw new Error(forecastData.message || "Forecast unavailable.");
        }

        displayWeather(currentData);
        displayHourlyForecast(forecastData.list);
        updateBackground(currentData.weather[0].main);

        showMessage("");
    } catch (error) {
        weatherContent.classList.add("hidden");
        emptyState.classList.remove("hidden");
        showMessage(
            error.message.toLowerCase().includes("not found")
                ? "City not found. Check the spelling and try again."
                : "Unable to load weather right now. Please try again.",
            true
        );
    } finally {
        setLoading(false);
    }
}

function displayWeather(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    document.getElementById("city-name").textContent =
        `${data.name}${data.sys?.country ? ", " + data.sys.country : ""}`;

    document.getElementById("weather-description").textContent =
        data.weather[0].description;

    document.getElementById("weather-condition").textContent =
        data.weather[0].description;

    document.getElementById("temperature").textContent =
        `${Math.round(data.main.temp)}°`;

    document.getElementById("feels-like").textContent =
        `Feels like ${Math.round(data.main.feels_like)}°C`;

    document.getElementById("humidity").textContent =
        `${data.main.humidity}%`;

    document.getElementById("wind").textContent =
        `${Math.round(data.wind.speed * 3.6)} km/h`;

    document.getElementById("pressure").textContent =
        `${data.main.pressure} hPa`;

    document.getElementById("visibility").textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;

    const weatherIcon = document.getElementById("weather-icon");
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;

    document.getElementById("current-time").textContent =
        formatTime(new Date(data.dt * 1000));

    weatherContent.classList.remove("hidden");
    emptyState.classList.add("hidden");
}

function displayHourlyForecast(hourlyData) {
    const forecastContainer = document.getElementById("hourly-forecast");
    forecastContainer.innerHTML = "";

    hourlyData.slice(0, 8).forEach((item) => {
        const date = new Date(item.dt * 1000);
        const iconUrl =
            `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

        const card = document.createElement("div");
        card.className = "hourly-item";

        card.innerHTML = `
            <div class="hour-time">${formatHour(date)}</div>
            <img src="${iconUrl}" alt="${item.weather[0].description}">
            <div class="hour-temp">${Math.round(item.main.temp)}°C</div>
            <div class="hour-condition">${item.weather[0].description}</div>
        `;

        forecastContainer.appendChild(card);
    });
}

function formatHour(date) {
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatTime(date) {
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function updateBackground(condition) {
    document.body.className = "";

    const type = condition.toLowerCase();

    if (type.includes("clear")) {
        document.body.classList.add("clear");
    } else if (type.includes("cloud")) {
        document.body.classList.add("clouds");
    } else if (type.includes("rain") || type.includes("drizzle")) {
        document.body.classList.add("rain");
    } else if (type.includes("thunder")) {
        document.body.classList.add("storm");
    } else if (type.includes("snow")) {
        document.body.classList.add("snow");
    }
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("error", isError);
}

function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.querySelector("span").textContent =
        isLoading ? "Loading..." : "Search";
}
