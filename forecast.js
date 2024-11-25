document.addEventListener('DOMContentLoaded', () => {
    const ForecastHeader = document.getElementById('ForecastHeader')

    const locationButton = document.getElementById('hideLocation');
    var showLocation = true;

    const day1highText = document.getElementById('hiDay1');
    const day1lowText = document.getElementById('loDay1');
    const day2highText = document.getElementById('hiDay2');
    const day2lowText = document.getElementById('loDay2');
    const day3highText = document.getElementById('hiDay3');
    const day3lowText = document.getElementById('loDay3');
    const day4highText = document.getElementById('hiDay4');
    const day4lowText = document.getElementById('loDay4');
    const day5highText = document.getElementById('hiDay5');
    const day5lowText = document.getElementById('loDay5');

    const day1label = document.getElementById('day1label');
    const day2label = document.getElementById('day2label');
    const day3label = document.getElementById('day3label');
    const day4label = document.getElementById('day4label');
    const day5label = document.getElementById('day5label');

    const day1 = document.getElementById('day1');
    const day2 = document.getElementById('day2');
    const day3 = document.getElementById('day3');
    const day4 = document.getElementById('day4');
    const day5 = document.getElementById('day5');

    const day1windLabel = document.getElementById('day1wind');
    const day2windLabel = document.getElementById('day2wind');
    const day3windLabel = document.getElementById('day3wind');
    const day4windLabel = document.getElementById('day4wind');
    const day5windLabel = document.getElementById('day5wind');

    const day1forecast = document.getElementById('day1forecast');
    const day2forecast = document.getElementById('day2forecast');
    const day3forecast = document.getElementById('day3forecast');
    const day4forecast = document.getElementById('day4forecast');
    const day5forecast = document.getElementById('day5forecast');

    const day1icon = document.getElementById('day1icon');
    const day2icon = document.getElementById('day2icon');
    const day3icon = document.getElementById('day3icon');
    const day4icon = document.getElementById('day4icon');
    const day5icon = document.getElementById('day5icon');

    function getForecast() {
        navigator.geolocation.getCurrentPosition(getForecastForLocation, function() {return;}, { enableHighAccuracy: true});
    }

    const api = 'https://api.weather.gov/points/'
    function getForecastForLocation(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        fetch(api + `${latitude},${longitude}`)
        .then(response => response.json())
        .then(data => {
            const locationInfo = data.properties;
            const forecastUrl = locationInfo.forecast;
            const city = locationInfo.relativeLocation.properties.city;
            const state = locationInfo.relativeLocation.properties.state;

            console.log(forecastUrl);

            if (showLocation) {
                ForecastHeader.innerHTML = `5-Day Forecast for ${city}, ${state}`;
            } else {
                ForecastHeader.innerHTML = `5-Day Forecast`;
            }

            function toggleLocation() {
                if (showLocation) {
                    showLocation = false;
                    ForecastHeader.innerHTML = '5-Day Forecast';
                    locationButton.innerHTML = 'show location';
                } else {
                    showLocation = true;
                    ForecastHeader.innerHTML = `5-Day Forecast for ${city}, ${state}`;
                    locationButton.innerHTML = 'hide location';
                }
            }
            locationButton.onclick = toggleLocation;

            fetch(forecastUrl)
            .then(response => {return response.json()})
            .then(data => {
                const periods = data.properties.periods;
                
                const startIndex = periods[0].isDaytime ? 0 : 1;

                if (startIndex == 1) {
                    day1label.innerHTML = 'Tonight';
                    day1highText.style.display = "none";
                } else {
                    const day1high = periods[0 - startIndex].temperature;
                    day1highText.innerHTML = `Hi: ${day1high}°F`;
                    day1highText.style.display = 'initial';
                    day1label.innerHTML = 'Today';
                }
                const day1low = periods[1 - startIndex].temperature;
                day1lowText.innerHTML = `Lo: ${day1low}°F`;
                day1windLabel.innerHTML = `${periods[0].windSpeed}`;
                const day1shortForecast = periods[0].shortForecast;
                day1forecast.innerHTML = day1shortForecast;
                checkForHurricane(day1shortForecast, day1icon, true);
                day1icon.src = getIconForForecast(day1shortForecast, periods[0].isDaytime);

                const day2high = periods[2 - startIndex].temperature;
                const day2low = periods[3 - startIndex].temperature;
                day2highText.innerHTML = `Hi: ${day2high}°F`;
                day2lowText.innerHTML = `Lo: ${day2low}°F`;
                day2windLabel.innerHTML = `${periods[2 - startIndex].windSpeed}`;
                day2label.innerHTML = periods[2 - startIndex].name//.slice(0, 3);
                const day2shortForecast = periods[2 - startIndex].shortForecast;
                day2forecast.innerHTML = day2shortForecast;
                checkForHurricane(day2shortForecast, day2icon, true);
                day2icon.src = getIconForForecast(day2shortForecast, true);

                const day3high = periods[4 - startIndex].temperature;
                const day3low = periods[5 - startIndex].temperature;
                day3highText.innerHTML = `Hi: ${day3high}°F`;
                day3lowText.innerHTML = `Lo: ${day3low}°F`;
                day3windLabel.innerHTML = `${periods[4 - startIndex].windSpeed}`;
                day3label.innerHTML = periods[4 - startIndex].name//.slice(0, 3);
                const day3shortForecast = periods[4 - startIndex].shortForecast;
                day3forecast.innerHTML = day3shortForecast;
                checkForHurricane(day3shortForecast, day3icon, true);
                day3icon.src = getIconForForecast(day3shortForecast, true);

                const day4high = periods[6 - startIndex].temperature;
                const day4low = periods[7 - startIndex].temperature;
                day4highText.innerHTML = `Hi: ${day4high}°F`;
                day4lowText.innerHTML = `Lo: ${day4low}°F`
                day4windLabel.innerHTML = `${periods[6 - startIndex].windSpeed}`;
                day4label.innerHTML = periods[6 - startIndex].name//.slice(0, 3);
                day4forecast.innerHTML = periods[6 - startIndex].shortForecast;
                const day4shortForecast = periods[6 - startIndex].shortForecast;
                day4forecast.innerHTML = day4shortForecast;
                checkForHurricane(day4shortForecast, day4icon, true);
                day4icon.src = getIconForForecast(day4shortForecast, true);

                const day5high = periods[8 - startIndex].temperature;
                const day5low = periods[9 - startIndex].temperature;
                day5highText.innerHTML = `Hi: ${day5high}°F`;
                day5lowText.innerHTML = `Lo: ${day5low}°F`;
                day5windLabel.innerHTML = `${periods[8 - startIndex].windSpeed}`;
                day5label.innerHTML = periods[8 - startIndex].name//.slice(0, 3);
                const day5shortForecast = periods[8 - startIndex].shortForecast;
                day5forecast.innerHTML = day5shortForecast;
                checkForHurricane(day5shortForecast, day5icon, true);
                day5icon.src = getIconForForecast(day5shortForecast, true);
            });
        });
    }

    function checkForHurricane(forecast, icon) {
        if (forecast.toLowerCase().includes('hurricane') || forecast.toLowerCase().includes('tropical storm')) {
            return icon.className = 'hurricane';    
        }
    }

    function getIconForForecast(forecast, isDaytime) {
        if (isDaytime) {
            if (forecast.toLowerCase().includes('hurricane')) {
                return './assets/hurricane.png';
            } else if (forecast.toLowerCase().includes('tropical storm')) {
                return './assets/tropical-storm.png';
            } else if (forecast.toLowerCase().includes("snow")) {
                return './assets/snowflake.svg';
            } else if (forecast.toLowerCase().includes("storm") && forecast.toLowerCase().includes("chance")) {
                return './assets/cloud-sun-bolt-solid.png';
            } else if (forecast.toLowerCase().includes('chance') && (forecast.toLowerCase().includes('showers') || forecast.toLowerCase().includes('rain'))) {
                return './assets/cloud-sun-rain-solid.png';
            } else if (forecast.toLowerCase().includes('rain') || forecast.toLowerCase().includes('shower')) {
                return './assets/cloud-sun-rain.png';
            }  else if (forecast.toLowerCase().includes('mostly sunny') || forecast.toLowerCase().includes('partly sunny') || forecast.toLowerCase().includes('mostly cloudy')) {
                return './assets/cloud-sun-solid.png';
            } else if (forecast.toLowerCase().includes('sunny')) {
                return './assets/sun-solid.png';
            }
        } else {
            if (forecast.toLowerCase().includes('hurricane')) {
                return './assets/hurricane.png';
            } else if (forecast.toLowerCase().includes('tropical storm')) {
                return './assets/tropical-storm.png';
            } else if (forecast.toLowerCase().includes("snow")) {
                return './assets/snowflake.svg';
            } else if (forecast.toLowerCase().includes("storm") && forecast.toLowerCase().includes("chance")) {
                return './assets/cloud-sun-bolt-solid.png';
            } else if (forecast.toLowerCase().includes("storm")) {
                return './assets/cloud-bolt-solid.png';
            } else if (forecast.toLowerCase().includes('rain') || forecast.toLowerCase().includes('shower')) {
                return './assets/cloud-moon-rain.png';
            } else if (forecast.toLowerCase().includes('mostly clear') || forecast.toLowerCase().includes('partly sunny') || forecast.toLowerCase().includes('mostly cloudy')) {
                return './assets/cloud-moon-solid.svg';
            } else if (forecast.toLowerCase().includes('clear')) {
                return './assets/moon-solid.svg';
            } else {
                return './assets/moon-solid.svg';
            }
        }
    }

    getForecast();

    setInterval(getForecast, 600000);
})