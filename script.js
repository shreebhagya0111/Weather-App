const searchBox = document.querySelector(".search-box input");
const searchBtn = document.querySelector("#search");
const weatherIcon = document.querySelector(".weather-icon");
const appContainer = document.querySelector(".app-container");

const weatherApiKey = 'b2fa3271ab55c9c76e1b2a2d1afd0478';
const weatherURL = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=`;

const imageApiKey = "2BsfBnNAfcAGF3oX4F_fRIlYnOXYBGYyJpeHfo8AWp4";
const imageURL = "https://api.unsplash.com/search/photos?page=1&query=";

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

// Weather API call
async function checkWeather(city) {
    const response = await fetch(weatherURL + city + `&appid=${weatherApiKey}`);
    const data = await response.json();

    if (response.status === 404) {
        document.querySelector(".error").style.display = 'block';
        document.querySelector(".weather").style.visibility = "hidden";
        appContainer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("images/weather.jpg")`;
    } else {
        setTimeout(() => {
            updateData(data);
            saveRecentCity(city);
        }, 500);
    }
}

async function updateData(data) {
    document.querySelector("#city").textContent = data.name;
    document.querySelector("#temp").textContent = Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").textContent = data.main.humidity + '%';
    document.querySelector(".wind").textContent = data.wind.speed + "Km/h";

    const weatherCondition = data.weather[0].main;
    const conditionMap = {
        Clear: "clear.png",
        Clouds: "clouds.png",
        Haze: "drizzle.png",
        Mist: "mist.png",
        Rain: "rain.png",
        Snow: "snow.png"
    };

    weatherIcon.src = `images/${conditionMap[weatherCondition] || "clear.png"}`;
    document.querySelector("#condition").textContent = data.weather[0].main;

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = 'none';
}

async function generateImage(city) {
    const response = await fetch(imageURL + city + `&client_id=${imageApiKey}`);
    const data = await response.json();
    const img = data.results[0]?.urls?.full;

    appContainer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${img})`;
}

searchBtn.addEventListener('click', () => {
    const city = searchBox.value.trim();
    if (city) {
        generateImage(city);
        checkWeather(city);
    }
});

function saveRecentCity(city) {
    city = city.toLowerCase();
    if (!recentCities.includes(city)) {
        recentCities.unshift(city);
        if (recentCities.length > 6) recentCities.pop();
        localStorage.setItem("recentCities", JSON.stringify(recentCities));
    }
    renderRecentCities();
}

function renderRecentCities() {
    const recentBox = document.querySelector("#recent");
    recentBox.innerHTML = '';

    recentCities.forEach((city, index) => {
        const container = document.createElement("div");
        container.className = "recent-item";

        const btn = document.createElement("button");
        btn.className = "recent-btn";
        btn.textContent = city.charAt(0).toUpperCase() + city.slice(1);
        btn.addEventListener("click", () => {
            searchBox.value = city;
            generateImage(city);
            checkWeather(city);
        });

        const delBtn = document.createElement("span");
        delBtn.className = "delete-btn";
        delBtn.innerHTML = "🗑️";
        delBtn.title = "Remove";

        delBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering the main button click
            recentCities.splice(index, 1);
            localStorage.setItem("recentCities", JSON.stringify(recentCities));
            renderRecentCities();
        });

        container.appendChild(btn);
        container.appendChild(delBtn);
        recentBox.appendChild(container);
    });

    if (recentCities.length > 0) {
        const clearBtn = document.createElement("button");
        clearBtn.textContent = "Clear All";
        clearBtn.className = "clear-btn";
        clearBtn.addEventListener("click", () => {
            localStorage.removeItem("recentCities");
            recentCities = [];
            renderRecentCities();
        });
        recentBox.appendChild(clearBtn);
    }
}

// Default load
checkWeather("kolkata");
generateImage("kolkata");
renderRecentCities();

window.onload = () => {
    document.querySelector("#city-input").focus();
};