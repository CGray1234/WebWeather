document.addEventListener('DOMContentLoaded', () => {
    function loadMap() {
        navigator.geolocation.getCurrentPosition(setMapToLocation, function() {return;}, { enableHighAccuracy: true});
    }

    function setMapToLocation(location) {
        const coords = [location.coords.latitude, location.coords.longitude];

        var map = L.map('map', {zoomControl: false}).setView(coords, 10);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" style="font-family: arial;">OpenStreetMap</a>'
        }).addTo(map);

        L.tileLayer.wms("https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?", {
            layers: 'conus_bref_qcd',
            format: 'image/png',
            transparent: true
        }).addTo(map);

        var iconSize = [15, 15]

        var locationIcon = L.icon({
            iconUrl: './assets/locationMarker.png',
            iconSize: iconSize,
            iconAnchor: iconSize / 2
        })

        L.marker(coords, { icon: locationIcon }).addTo(map);

        map.attributionControl.setPrefix(false);
    }

    loadMap();
    setInterval(loadMap, 60000);
})