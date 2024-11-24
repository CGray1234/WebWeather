document.addEventListener('DOMContentLoaded', () => {
    const mapDiv = document.getElementById("map");
    const radarButton = document.getElementById("mapLabel");
    const hideLocationButton = document.getElementById("hideLocation");
    const mapReturn = document.getElementById("mapReturn");

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

        var watermark;

        function mapSize() {
            if (hideLocationButton.style.display != 'none') { // use hideLocation button just so i dont have to make another boolean value & using mapReturn wouldnt work
                mapDiv.style.width = '100%';
                mapDiv.style.height = '100%';

                mapReturn.style.display = 'block';
                hideLocationButton.style.display = 'none'; // hide hideLocation button because it shows through the map for some reason

                map.invalidateSize(); // refresh map size
                watermark = L.control.watermark({ position: 'bottomleft' }).addTo(map);
            } else {
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
    }

    loadMap();
    setInterval(loadMap, 60000);
})