document.addEventListener('DOMContentLoaded', () => {
    const warningViewToggle = document.getElementById('openWarnings');
    var warningView = false;
    warningViewToggle.onclick = toggleAlerts;
    const warningsContainer = document.getElementById('alertsContainer');

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            getLocation();
            setInterval(getLocation, 5000); // Set the interval to fetch alerts
        }
    });
    
    let numOfAlerts = 0;

    let hideAlerts = true;

    const detailsBG = document.getElementById('detailsBG');
    const detailsContainer = document.getElementById('details');
    const detailsEvent = document.getElementById('detailsEvent');
    const detailsArea = document.getElementById('detailsArea');
    const extraDetails = document.getElementById('extraDetails');
    const detailsDesc = document.getElementById('detailsDesc');

    const singleWarningContainer = document.getElementById('singleWarningContainer');

    const locationApi = 'https://api.weather.gov/points/'
    const alertApi = 'https://api.weather.gov/alerts/active/zone/'

    function getLocation() {
        navigator.geolocation.getCurrentPosition(fetchAlerts);
    }

    function fetchAlerts(position) {
        let latlong = `${position.coords.latitude},${position.coords.longitude}`;
        // let latlong = '-89.50, 33.86'
        let zone;

        fetch(`${locationApi}${latlong}`)
        .then(response => response.json())
        .then(data => {
            zone = data.properties.forecastZone.split('forecast/').pop();
            
            fetch(alertApi + zone)
            .then(response => response.json())
            .then(data => {
                if (data.features[0] && data.features[0].properties) {

                    const filteredData = data.features
                    /*.filter(alert => 
                        alert.properties.event.toLowerCase().includes("tornado")
                        || alert.properties.event.toLowerCase().includes("severe thunderstorm warning")
                        || alert.properties.event.toLowerCase().includes("flood")
                        || alert.properties.event.toLowerCase().includes("tropical storm")
                        || alert.properties.event.toLowerCase().includes("hurricane")
                        || alert.properties.event.toLowerCase().includes("tropical cyclone")
                    )*/.filter(filteredAlerts => 
                        !filteredAlerts.properties.description.toLowerCase().includes("allowed to expire")
                    );

                    warningsContainer.innerHTML = '';

                    const newWarnings = filteredData.length - numOfAlerts;
                    if (newWarnings > 0 && hideAlerts) {
                        numOfAlerts = filteredData.length;
                        const properGrammar = newWarnings === 1 ? 'alert!' : 'alerts!';
                        const notif = new Notification('WebWeather', {
                            body: 'You have ' + newWarnings + ' new weather ' + properGrammar,
                            icon: './assets/favicon.ico'
                        });
                        notif.onclick(window.open('/'));
                    }

                    filteredData.forEach(alert => {
                        const newAlertContainer = singleWarningContainer.cloneNode(true);
                        warningsContainer.appendChild(newAlertContainer);
                        newAlertContainer.style.display = 'initial';
                        const newWarningBG = newAlertContainer.children[0].children[0];
                        const newWarningLabel = newWarningBG.children[1];
                        const newWarningInfo = newAlertContainer.children[0].children[1];
                        const newExpiration = newAlertContainer.children[0].children[2];
                        const newDetailsButton = newAlertContainer.children[1];
                        alertData = alert.properties;
                        colorCodeWarnings(alertData.event, newWarningBG, newWarningInfo);
                        if (alertData.event.toLowerCase().includes("tornado warning")) {
                            if (alertData.parameters.tornadoDamageThreat) {
                                if (alertData.parameters.tornadoDamageThreat == "CATASTROPHIC") {
                                    newWarningLabel.innerHTML = "TORNADO EMERGENCY"
                                } else if (alertData.parameters.tornadoDamageThreat == "CONSIDERABLE") {
                                    newWarningLabel.innerHTML = "PDS TORNADO WARNING"
                                }
                            } else if (alertData.parameters.tornadoDetection == "OBSERVED") {
                                newWarningLabel.innerHTML = alertData.event + " - CONFIRMED";
                            } else {
                                newWarningLabel.innerHTML = alertData.event;
                            }
                        } else if (alertData.event.toLowerCase().includes('thunderstorm warning')) {
                            newWarningLabel.innerHTML = "Severe T-Storm Warning";
                        } else if (alertData.event.toLowerCase().includes('thunderstorm watch')) {
                            newWarningLabel.innerHTML = "Severe T-Storm Watch";
                        } else {
                            newWarningLabel.innerHTML = alertData.event;
                        }
                        newWarningInfo.innerHTML = alertData.areaDesc;
                        newExpiration.innerHTML = "Expires: " + formatExpiration(alertData.expires);
                        
                        newDetailsButton.onclick = () => enableDetails(newWarningLabel.innerHTML, alertData.areaDesc, alertData.description.replace(/\n/g, '<br/>'), alertData.parameters, newWarningBG.style.backgroundColor, newWarningInfo.style.backgroundColor);
                        detailsBG.onclick = disableDetails;
                    });
                } else {
                    warningViewToggle.style.display = 'none';
                    warningsContainer.style.display = 'none';
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    function formatExpiration(time) {
        const options = {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            year: 'numeric',
            minute: '2-digit',
            hour12: true
        };

        // Format the date and time without the comma between date and hour and without space between minutes and AM/PM
        return new Date(time).toLocaleDateString('en-US', options);
    }

    function colorCodeWarnings(event, bg, info) {
        if (event.toLowerCase().includes('severe thunderstorm')) {
            bg.style.backgroundColor = 'rgb(255, 203, 33)'
            info.style.backgroundColor = 'rgb(255, 174, 0)'
        } else if (event.toLowerCase().includes('tornado')) {
            bg.style.backgroundColor = 'rgb(207, 0, 0)'
            info.style.backgroundColor = 'rgb(151, 0, 0)'
        } else if (event.toLowerCase().includes('test')) {
            bg.style.backgroundColor = 'rgb(0, 140, 255)'
            info.style.backgroundColor = 'rgb(0, 95, 173)'
        } else if (event.toLowerCase().includes('flood')) {
            bg.style.backgroundColor = 'rgb(0, 212, 0)'
            info.style.backgroundColor = 'rgb(0, 122, 0)'
        } else if (event.toLowerCase().includes('tropical storm warning')) {
            bg.style.backgroundColor = 'rgb(224, 224, 0)'
            info.style.backgroundColor = 'rgb(154, 154, 0)'
        } else if (event.toLowerCase().includes('tropical storm warning')) {
            bg.style.backgroundColor = 'rgb(0, 0, 254)'
            info.style.backgroundColor = 'rgb(0, 0, 154)'
        } else if (event.toLowerCase().includes('hurricane watch')) {
            bg.style.backgroundColor = 'rgb(0, 212, 0)'
            info.style.backgroundColor = 'rgb(0, 122, 0)'
        } else if (event.toLowerCase().includes('hurricane warning')) {
            bg.style.backgroundColor = 'rgb(0, 212, 0)'
            info.style.backgroundColor = 'rgb(0, 122, 0)'
        } else if (event.toLowerCase().includes('winter storm warning')) {
            bg.style.backgroundColor = 'rgb(254,106,179)'
            info.style.backgroundColor = 'rgb(254,106,179)'
        } else if (event.toLowerCase().includes('winter storm watch')) {
            bg.style.backgroundColor = 'rgb(32,77,158)'
            info.style.backgroundColor = 'rgb(32,77,158)'
        } else if (event.toLowerCase().includes('winter weather advisory')) {
            bg.style.backgroundColor = '#337baa'
            info.style.backgroundColor = '#337baa'
        } else {
            bg.style.backgroundColor = 'rgb(0, 119, 255)'
            info.style.backgroundColor = 'rgb(86, 165, 255)'
        }
    }

    function disableDetails() {
        detailsContainer.style.display = "none";
        detailsBG.style.display = "none";
        hideAlerts = true;
    }

    function enableDetails(event, areaDesc, desc, parameters, eventColor, areaColor) {
        hideAlerts = false;
        if (event.toLowerCase().includes('severe t-storm')) {
            extraDetails.style.display = 'block';
            if (parameters.maxWindGust) {
                detailsDesc.innerHTML += `<br/>MAX WIND GUST:  ${parameters.maxWindGust}`;
                extraDetails.innerHTML = `Wind: ${parameters.maxWindGust} | `;
            } else {
                extraDetails.innerHTML = `Wind: <58 MPH | `;
            }

            if (parameters.maxHailSize) {
                detailsDesc.innerHTML += `<br/>MAX HAIL SIZE: ${parameters.maxHailSize} IN`;
                extraDetails.innerHTML += `Hail: ${parameters.maxHailSize} IN`
            } else {
                extraDetails.innerHTML += `Hail: 0.00 IN`
            }

            if (alertData.event.toLowerCase().includes("severe thunderstorm warning")) {
                if (parameters.tornadoDetection) {
                    detailsDesc.innerHTML += `<br/>TORNADO: ${parameters.tornadoDetection}`;
                    extraDetails.innerHTML += `TORNADO: ${parameters.tornadoDetection}`;
                }
                if (parameters.thunderstormDamageThreat) {
                    detailsDesc.innerHTML += `<br/>THUNDERSTORM DAMAGE THREAT: ${parameters.thunderstormDamageThreat}`;
                }
            }
        } else {
            extraDetails.style.display = 'none';
        }

        detailsEvent.innerHTML = event;
        detailsEvent.style.backgroundColor = eventColor;
        detailsDesc.innerHTML = desc;
        detailsArea.innerHTML = areaDesc;
        detailsArea.style.backgroundColor = areaColor;

        detailsContainer.style.display = "block";
        detailsBG.style.display = "block";
    }

    function toggleAlerts() {
        if (!warningView) {
            warningsContainer.style.display = 'initial';
        } else {
            warningsContainer.style.display = 'none';
        }
        warningView = !warningView;
    }

    getLocation();

    setInterval(getLocation, 5000);
})