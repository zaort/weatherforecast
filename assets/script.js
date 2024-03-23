$(document).ready(function () {
    // Search Elements
    const searchBtn = $("#button-search");
    const searchTerm = $("#search-term");
    const searchHistory = $("#search-history");
    let searchCity = "";
    const clearBtn = $("#clear-search");

    // Current Weather Elements
    const cityHeader = $("#city-date");
    const cityIcon = $("#weather-icon-current");
    const cityTemp = $("#city-temp");
    const cityHumidity = $("#city-humidity");
    const cityWindSpeed = $("#city-wind-speed");
    const cityUVIndex = $("#city-uv-index");

    // Moment Date
    const todaysDate = moment();

    // OpenWeatherMap API key
    const apiKey = "b07abeb530d2aceffda3a30d1c88e617";

    // Function to build current weather query URL
    function buildCurrentQueryURL(city) {
        return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    }

    // Function to build UV Index query URL
    function buildUVQueryURL(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
    }

    // Function to build 5-day forecast query URL
    function buildForecastQueryURL(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${apiKey}`;
    }

    // Function to display search history
    function displaySearchTerms() {
        searchHistory.empty();
        for (let i = 0; i < localStorage.length; i++) {
            const storedSearchList = localStorage.getItem("city" + i);
            const searchHistoryBtn = $("<button>").text(storedSearchList).addClass("btn btn-secondary button-srch m-2").attr("type", "submit");
            searchHistory.append(searchHistoryBtn);
        }
    }

    // Function to store search terms in local storage
    function storeSearchTerms(searchedCity) {
        localStorage.setItem("city" + localStorage.length, searchedCity);
    }

    // Function to update current weather based on API response
    function updateCurrentWeather(response) {
        const weatherIcon = response.weather[0].icon;
        const weatherIconURL = `https://openweathermap.org/img/wn/${weatherIcon}.png`;
        const weatherIconDescription = response.weather[0].description;
        const tempF = (response.main.temp - 273.15) * 1.80 + 32;
        searchCity = response.name;
        cityHeader.text(`${searchCity} (${todaysDate.format("DD/MM/YYYY")}) `);
        cityHeader.append(cityIcon.attr("src", weatherIconURL).attr("alt", `${weatherIconDescription}`).attr("title", `${weatherIconDescription}`));
        cityTemp.text(`Temperature: ${tempF.toFixed(2)} ℉`);
        cityHumidity.text(`Humidity: ${response.main.humidity}%`);
        cityWindSpeed.text(`Wind Speed: ${response.wind.speed} MPH`);

        const currentLat = response.coord.lat;
        const currentLong = response.coord.lon;

        $.ajax({
            url: buildUVQueryURL(currentLat, currentLong),
            method: "GET"
        }).then(function (response) {
            const uvValue = response.value;
            cityUVIndex.text(`UV Index: `);
            const uvSpan = $("<span>").text(uvValue).addClass("p-2");

            if (uvValue >= 0 && uvValue < 3) {
                uvSpan.addClass("green-uv");
            } else if (uvValue >= 3 && uvValue < 6) {
                uvSpan.addClass("yellow-uv");
            } else if (uvValue >= 6 && uvValue < 8) {
                uvSpan.addClass("orange-uv");
            } else if (uvValue >= 8 && uvValue < 11) {
                uvSpan.addClass("red-uv");
            } else if (uvValue >= 11) {
                uvSpan.addClass("purple-uv");
            }

            cityUVIndex.append(uvSpan);
        });

        $.ajax({
            url: buildForecastQueryURL(currentLat, currentLong),
            method: "GET"
        }).then(function (response) {
            $(".card-deck").empty(); // Clear existing forecast cards

            for (let i = 0; i < 5; i++) {
                const forecast = response.daily[i];
                const cardDateMoment = moment.unix(forecast.dt).format("DD/MM/YYYY");
                const weatherCardIcon = forecast.weather[0].icon;
                const weatherCardIconURL = `https://openweathermap.org/img/wn/${weatherCardIcon}.png`;
                const weatherCardIconDesc = forecast.weather[0].description;
                const cardTempF = (forecast.temp.day - 273.15) * 1.80 + 32;
                const cardHumidity = forecast.humidity;
                const cardWind = forecast.wind_speed;

                const cardHTML = `
                    <div class="card card-day">
                        <div class="card-body p-2">
                            <h5 class="card-title card-date">${cardDateMoment}</h5>
                            <p class="card-text card-icon"><img class="weather-icon-card" src="${weatherCardIconURL}" alt="${weatherCardIconDesc}"></p>
                            <p class="card-text card-temp">Temp: ${cardTempF.toFixed(2)} ℉</p>
                            <p class="card-text card-humid">Humidity: ${cardHumidity}%</p>
                            <p class="card-text card-wind">Wind: ${cardWind} MPH</p>
                        </div>
                    </div>
                `;
                $(".card-deck").append(cardHTML);
            }
        });
    }

    // Event Listeners
    searchBtn.on("click", function (event) {
        event.preventDefault();
        storeSearchTerms(searchTerm.val().trim());
        displaySearchTerms();
        $.ajax({
            url: buildCurrentQueryURL(searchTerm.val().trim()),
            method: "GET"
        }).then(updateCurrentWeather);
    });

    $(document).on("click", ".button-srch", function () {
        const pastCity = $(this).text();
        storeSearchTerms(pastCity);
        $.ajax({
            url: buildCurrentQueryURL(pastCity),
            method: "GET"
        }).then(updateCurrentWeather);
    });

    clearBtn.on("click", function () {
        localStorage.clear();
        searchHistory.empty();
        location.reload();
    });

    $(window).on("load", function () {
        displaySearchTerms();
        const pastCity = localStorage.getItem("city" + (localStorage.length - 1));
        const qurl = localStorage.length === 0 ? `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&q=Adelaide` : buildCurrentQueryURL(pastCity);
        $.ajax({
            url: qurl,
            method: "GET"
        }).then(updateCurrentWeather);
    });
});


