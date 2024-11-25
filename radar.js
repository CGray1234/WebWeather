document.addEventListener('DOMContentLoaded', () => {
    const mapDiv = document.getElementById("map");
    const radarButton = document.getElementById("mapLabel");
    const hideLocationButton = document.getElementById("hideLocation");
    const mapReturn = document.getElementById("mapReturn");

    const alertEventBG = document.getElementById('alertContainer');
    const alertEvent = document.getElementById('eventText');
    const alertDetails = document.getElementById('detailsForPolygon');
    const alertDropdown = document.getElementById('alertDropdown');
    const dropdownIcon = document.getElementById('dropdownIcon');
    const descriptionDisplay = document.getElementById('description');
    const closeWarningButton = document.getElementById('closeAlert');

    const locationButton = document.getElementById('hideLocation');
    var showLocation = true;

    function loadMap() {
        navigator.geolocation.getCurrentPosition(setMapToLocation, function() {return;}, { enableHighAccuracy: true});
    }

    function setMapToLocation(location) {
        const coords = [location.coords.latitude, location.coords.longitude];
        // const coords = [44, -103] // use for testing

        var map = L.map('map', {zoomControl: false}).setView(coords, 10);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        L.tileLayer.wms("https://opengeo.ncep.noaa.gov/geoserver/conus/conus_cref_qcd/ows?", {
            layers: 'conus_cref_qcd',
            format: 'image/png',
            transparent: true
        }).addTo(map);

        var iconSize = [15, 15]

        var locationIcon = L.icon({
            iconUrl: './assets/locationMarker.png',
            iconSize: iconSize,
            iconAnchor: iconSize / 2
        });

        const markerLayerGroup = L.layerGroup().addTo(map);
        var marker = L.marker(coords, { icon: locationIcon });

        function makeLocationMarker() {
            if (showLocation == true) {
                markerLayerGroup.addLayer(marker);
                map.invalidateSize();
            } else {
                markerLayerGroup.clearLayers();
                map.invalidateSize();
            }
        }
        makeLocationMarker();

        function toggleLocationMarker() {
            showLocation = !showLocation;
            makeLocationMarker();
        }
        locationButton.addEventListener('click', function() { // use addEventListener because onclick is used by another script
            toggleLocationMarker();
        })

        map.attributionControl.setPrefix(false);

        var watermark;

        function mapSize() {
            if (hideLocationButton.style.display != 'none') { // use hideLocation button just so i dont have to make another boolean value & using mapReturn wouldnt work
                closeAlert();
                mapDiv.style.width = '100%';
                mapDiv.style.height = '100%';

                mapReturn.style.display = 'block';
                hideLocationButton.style.display = 'none'; // hide hideLocation button because it shows through the map for some reason

                map.invalidateSize(); // refresh map size
                watermark = L.control.watermark({ position: 'bottomleft' }).addTo(map);
            } else {
                closeAlert();
                mapDiv.style.width = '250px';
                mapDiv.style.height = '150px';

                mapReturn.style.display = 'none';
                hideLocationButton.style.display = 'block';

                map.invalidateSize(); // refresh map size
                map.removeControl(watermark);
            }
        }

        mapReturn.onclick = mapSize;
        radarButton.onclick = mapSize;

        L.Control.Watermark = L.Control.extend({
            onAdd: function() {
                var img = L.DomUtil.create('img');
        
                img.src = './assets/logo.png';
                img.style.width = '400px';
                img.style.paddingBottom = '10px';
                img.style.paddingLeft = '10px';
                img.style.filter = 'drop-shadow(0 0 3px black)';
        
                return img;
            },
        });
        
        L.control.watermark = function(opts) {
            return new L.Control.Watermark(opts);
        }

        // alert handling
        const alertsLayerGroup = L.layerGroup().addTo(map);
        const api = 'https://api.weather.gov/alerts/active';
        
        function fetchAlerts() {
            fetch(api).then(res => res.json()).then(data => {
                const filteredData = data.features.filter(alert => 
                    alert.properties.event.includes("Winter")
                    || alert.properties.event == "Special Weather Statement"
                    || alert.properties.event.includes("Tornado")
                    || alert.properties.event.includes("Severe Thunderstorm")
                    || alert.properties.event.includes("Flood")
                );

                loadPolygons(filteredData);
            })
        }
        fetchAlerts();
        setInterval(fetchAlerts, 30000);

        var alertDescActive = false;
        function showAlertDescription() {
            if (alertDescActive) {
                alertDescActive = false;
                descriptionDisplay.style.display = 'none';
                dropdownIcon.innerHTML = 'keyboard_arrow_down';
            } else {
                alertDescActive = true;
                descriptionDisplay.style.display = 'block';
                dropdownIcon.innerHTML = 'keyboard_arrow_up';
            }
        }
        alertDropdown.onclick = showAlertDescription;
        
        function closeAlert() {
            alertEventBG.style.display = 'none';
            closeWarningButton.style.display = 'none';
        }
        closeWarningButton.onclick = closeAlert;

        function loadPolygons(data) {
            alertsLayerGroup.clearLayers();
            data.forEach(alert => {
                
                if (alert.geometry == null) {
                    var zones = alert.properties.affectedZones;

                    for (var i = 0; i < zones.length; i++) {
                        fetch(zones[i]).then(res => res.json()).then(data => {
                            mapAlert(alert, data.geometry)
                        })
                    }
                } else {
                    mapAlert(alert, alert.geometry)
                }
            });

            // tornado warnings = red solid
                // tor confirmed = red dash
                // pds tor = pink solid
                // tor e = pink dash

                function mapAlert(alert, geometry) {
                    var dashes = 0;
                    var color = 'blue';
                    var fillOpacity = 0;
                    var fillColor = 'transparent';

                    if (alert.properties.event == 'Tornado Warning') {
                        if (alert.properties.parameters.tornadoDamageThreat && alert.properties.parameters.tornadoDamageThreat == 'CATASTROPHIC') {
                            color = 'magenta';
                            dashes = 10;
                        } else if (alert.properties.parameters.tornadoDamageThreat && alert.properties.parameters.tornadoDamageThreat == 'CONSIDERABLE') {
                            color = 'magenta';
                        } else if (alert.properties.parameters.tornadoDetection == 'OBSERVED') {
                            color = 'red';
                            dashes = 10;
                        } else {
                            color = 'red';
                        }
                    } else if (alert.properties.event == 'Severe Thunderstorm Warning') {
                        color = 'rgb(255, 196, 0)';
                        if (alert.properties.parameters.thunderstormDamageThreat && alert.properties.parameters.thunderstormDamageThreat == 'DESTRUCTIVE') {
                            dashes = 10;
                            fillOpacity = 0.5;
                            fillColor = 'magenta';
                        } else if (alert.properties.parameters.thunderstormDamageThreat && alert.properties.parameters.thunderstormDamageThreat == 'CONSIDERABLE') {
                            dashes = 10;
                        }
                    } else if (alert.properties.event == 'Flash Flood Warning') {
                        color = 'rgb(0, 255, 0)'
                        if (alert.properties.parameters.flashFloodDamageThreat && alert.properties.parameters.flashFloodDamageThreat == 'CATASTROPHIC') {
                            dashes = 10;
                        }
                    } else if (alert.properties.event == 'Flood Warning') {
                        color = 'green';
                    } else if (alert.properties.event == 'Winter Weather Advisory') {
                        color = 'rgb(32,77,158)';
                    } else if (alert.properties.event == 'Winter Storm Warning') {
                        color = 'rgb(254,106,179)';
                    } else if (alert.properties.event == 'Winter Storm Watch') {
                        color = 'rgb(32,77,158)';
                    } else if (alert.properties.event == 'Severe Thunderstorm Watch') {
                        color = 'rgb(255,255,0)';
                    } else if (alert.properties.event == 'Tornado Watch') {
                        color = 'salmon';
                    } else if (alert.properties.event == 'Special Weather Statement') {
                        color = 'rgb(135,206,235)';
                    }

                    const alertOutline = L.geoJSON(geometry, {
                        style: {
                            color: 'black',
                            weight: 5,
                            opacity: 1,
                            fillColor: fillColor,
                            fillOpacity: fillOpacity
                        }
                    });

                    const alertLayer = L.geoJSON(geometry, {
                        style: {
                            color: color,
                            weight: 2,
                            opacity: 1,
                            dashArray: dashes,
                            fillColor: 'transparent',
                            fillOpacity: 0
                        }
                    });

                    const options = {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }; 

                    alertLayer.on('click', function() {
                        alertEvent.innerHTML = alert.properties.event;
                        alertEvent.style.backgroundColor = color;
                        alertDetails.innerText = `${alert.properties.areaDesc}\nExpires: ${Intl.DateTimeFormat('en-US', options).format(new Date(alert.properties.expires))}\n`;
            
                        alertDetails.style.display = 'block';
                        alertDropdown.style.display = 'block';
                        closeWarningButton.style.display = 'block';
                        alertEventBG.style.display = 'block';
            
                        descriptionDisplay.innerHTML = alert.properties.description.replace(/\n/g, '<br/>');
            
                        if (alert.properties.event == "Severe Thunderstorm Warning") {
                            if (alert.properties.parameters.thunderstormDamageThreat == "DESTRUCTIVE") {
                                alertDetails.innerHTML += "<i style='background-color: purple; padding-left: 5px; padding-right: 10px; border-radius: 5px;'>THIS IS A DESTRUCTIVE STORM</i><br/>";
                            } else if (alert.properties.parameters.thunderstormDamageThreat == "CONSIDERABLE") {
                                alertDetails.innerHTML += "<i style='background-color: white; color: black; padding-left: 5px; padding-right: 10px; border-radius: 5px;'>THIS IS A CONSIDERABLE STORM</i><br/>";
                            }
            
                            var hail;
                            
                            if (alert.properties.parameters.maxHailSize) {
                                hail = alert.properties.parameters.maxHailSize;
                            } else {
                                hail = '0.00';
                            }
            
                            alertDetails.innerHTML += `Hail: ${hail} in<br/>`;
                            alertDetails.innerHTML += `Wind: ${alert.properties.parameters.maxWindGust}<br/>`;
            
                            if (alert.properties.parameters.tornadoDetection) {
                                alertDetails.innerHTML += `Tornado: <span style="color: red;">${alert.properties.parameters.tornadoDetection}</span>`;
                            }
                        } else if (alert.properties.event == "Tornado Warning") {
            
                            if (alert.properties.parameters.tornadoDetection == "OBSERVED") {
                                alertDetails.innerHTML += `Tornado: <span style="background-color: white; color: red; padding-left: 5px; padding-right: 5px; border-radius: 5px;">${alert.properties.parameters.tornadoDetection}</span><br/>`;
                            } else {
                                alertDetails.innerHTML += `Tornado: ${alert.properties.parameters.tornadoDetection}<br/>`;
                            }
            
                            alertDetails.innerHTML += `Hail: ${alert.properties.parameters.maxHailSize} in`;
                        } else if (alert.properties.event == "Flash Flood Warning") {
                            if (alert.properties.parameters.flashFloodDamageThreat == "CATASTROPHIC") {
                                alertEvent.innerHTML = 'FLASH FLOOD EMERGENCY';
                                alertDetails.innerHTML += "Flash Flood Damage Threat: <span style='background-color: magenta; text-shadow: 2px 2px 4px black; padding-left: 5px; padding-right: 5px; border-radius: 5px;'>CATASTROPHIC</span><br/>";
                            } else if (alert.properties.parameters.flashFloodDamageThreat == "CONSIDERABLE") {
                                alertDetails.innerHTML += "Flash Flood Damage Threat: <span style='background-color: white; color: black; padding-left: 5px; padding-right: 5px; border-radius: 5px;'>CONSIDERABLE</span><br/>";
                            }
            
                            alertDetails.innerHTML += `SOURCE: ${alert.properties.parameters.flashFloodDetection}`;
                        }
                    });

                    alertsLayerGroup.addLayer(alertOutline);
                    alertsLayerGroup.addLayer(alertLayer);
                }
        }

    }

    loadMap();
    setInterval(loadMap, 60000);
})