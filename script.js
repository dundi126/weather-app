const apikey = "beb3807894c73633eb243afdd242727f";
const currentWeatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?";

const searchbox = document.querySelector(".search input");
const searchbtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon ");
const forecastItemsContainer = document.querySelector(
	".forecast-items-container"
);

function buildurltype(input) {
	input = input.trim();

	if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(input)) {
		const [long, lat] = input.split(",");
		return `lat=${lat}&lon=${long}`;
	}

	if (/^\d{4,6}(,[a-zA-Z]{2})?$/.test(input)) {
		return `zip=${input}`;
	}

	if (/^\d{6,}$/.test(input)) {
		return `id=${input}`;
	}

	return `q=${input}`;
}

async function checkWeather(city) {
	const urlType = buildurltype(city); // ✅ FIXED: Define urlType correctly
	const currentWeather = await fetch(
		currentWeatherApiUrl + urlType + `&appid=${apikey}&units=metric`
	);

	const currentData = await currentWeather.json();

	if (currentData.cod !== 200) {
		alert(currentData.message || "City not found!");
		return;
	}

	document.querySelector(".city").innerHTML = currentData.name;
	document.querySelector(".temp").innerHTML =
		Math.round(currentData.main.temp) + "°C";
	document.querySelector(".humidity").innerHTML =
		currentData.main.humidity + "%";
	document.querySelector(".wind").textContent = currentData.wind.speed + "km/h";

	// ✅ FIXED: Removed duplicate "Clear" condition
	const weatherCondition = currentData.weather[0].main;
	const weatherIcons = {
		Clouds: "assets/clouds.svg",
		Clear: "assets/clear.svg",
		Rain: "assets/rain.svg",
		Drizzles: "assets/drizzle.svg",
		Snow: "assets/snow.svg",
		Thunderstorm: "assets/thunderstorm.svg",
		Atmosphere: "assets/atmosphere.svg",
	};
	weatherIcon.src = weatherIcons[weatherCondition] || "assets/default.svg"; // Default icon if not found

	await updateForecastsInfo(city);
}

async function updateForecastsInfo(city) {
	const urlType = buildurltype(city); // ✅ FIXED: Define urlType correctly

	const forecast = await fetch(
		forecastUrl + urlType + `&appid=${apikey}&units=metric`
	);
	const forecastData = await forecast.json();

	if (forecastData.cod !== "200") {
		alert(forecastData.message || "Forecast data not available!");
		return;
	}

	const timeTaken = "12:00:00";
	const todayDate = new Date().toISOString().split("T")[0];

	forecastItemsContainer.innerHTML = "";
	forecastData.list.forEach((forecastWeather) => {
		if (
			forecastWeather.dt_txt.includes(timeTaken) &&
			!forecastWeather.dt_txt.includes(todayDate)
		) {
			updateForecastItems(forecastWeather);
		}
	});
}

function updateForecastItems(weatherData) {
	const {
		dt_txt: date,
		weather: [{ id }],
		main: { temp },
	} = weatherData;

	const dateTaken = new Date(date);
	const dateOption = { day: "2-digit", month: "short" };
	const dateResult = dateTaken.toLocaleDateString("en-US", dateOption);

	// ✅ FIXED: Correct function name (removed typo in `getWeaatherIcon`)
	const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

	forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);
}

function getWeatherIcon(id) {
	// Map OpenWeatherMap condition codes to custom icons
	if (id >= 200 && id < 300) return "assets/thunderstorm.svg";
	if (id >= 300 && id < 400) return "assets/drizzle.svg";
	if (id >= 500 && id < 600) return "assets/rain.svg";
	if (id >= 600 && id < 700) return "assets/snow.svg";
	if (id >= 700 && id < 800) return "assets/atmosphere.svg";
	if (id === 800) return "assets/clear.svg";
	if (id > 800) return "assets/clouds.svg";
	return "assets/default.svg";
}

searchbtn.addEventListener("click", () => {
	checkWeather(searchbox.value);
});
