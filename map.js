const map = L.map('map').setView([23.1765, 75.7885], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);
let currentDestinationMarker = null;
let currentRouteLine = null;
async function drawRoute(startLat, startLng, endLat, endLng) {

    const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLng},${startLat};${endLng},${endLat}` +
        `?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    const coordinates = data.routes[0].geometry.coordinates;

    const routePoints = coordinates.map(coord => [
        coord[1],
        coord[0]
    ]);

    if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
    }

    currentRouteLine = L.polyline(routePoints, {
        color: "blue",
        weight: 5
    }).addTo(map);
}

function findNearestPlace(places) {

    let nearest = null;
    let minDistance = Infinity;

    places.forEach(place => {

        let lat = place.lat;
        let lon = place.lon || place.lng;
        if (!lat && place.center) {
            lat = place.center.lat;
            lon = place.center.lon;
        }

        if (lat == null || lon == null) return;

        const distance = getDistance(
            userLat,
            userLng,
            lat,
            lon
        );

        if (distance < minDistance) {

            minDistance = distance;

            nearest = {
                ...place,
                lat,
                lon
            };
        }
    });

    return {
        nearest,
        minDistance
    };
}

function navigateToNearest(places, placeType) {

    const result = findNearestPlace(places);

    if (!result.nearest) {
        alert("No " + placeType + " found");
        return;
    }

    const nearest = result.nearest;

    const redIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    if (currentDestinationMarker) {
        map.removeLayer(currentDestinationMarker);
    }
    currentDestinationMarker = L.marker(
            [nearest.lat, nearest.lon], { icon: redIcon }
        )
        .addTo(map)
        .bindPopup(
            placeType + "<br>" +
            result.minDistance.toFixed(2) +
            " km away"
        )
        .openPopup();

    map.setView(
        [nearest.lat, nearest.lon],
        16
    );

    drawRoute(
        userLat,
        userLng,
        nearest.lat,
        nearest.lon
    );

    alert(
        "Nearest " + placeType +
        "\nDistance: " +
        result.minDistance.toFixed(2) +
        " km"
    );
}

let temples = [];

getNearbyTemples().then(data => {

    temples = data;

    console.log("TEMPLES:", data);

    data.forEach(temple => {

        let lat = temple.lat;

        let lng = temple.lon;

        if (!lat && temple.center) {
            lat = temple.center.lat;
            lng = temple.center.lon;
        }

        if (lat && lng) {

            L.circleMarker(
                    [lat, lng], {
                        radius: 6,
                        color: "orange",
                        fillColor: "orange",
                        fillOpacity: 1
                    }
                )
                .addTo(map)
                .bindPopup(
                    temple.tags && temple.tags.name ?
                    temple.tags.name :
                    "Temple"
                );
        }

    });

});


let marker;
let userLat = null;
let userLng = null;

// Live GPS Tracking

if (navigator.geolocation) {

    navigator.geolocation.watchPosition(

        function(position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log("GPS LAT:", lat);
            console.log("GPS LNG:", lng);

            userLat = lat;
            userLng = lng;

            if (!marker) {

                marker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("📍 You are here");

                map.setView([lat, lng], 17);

            } else {

                marker.setLatLng([lat, lng]);

            }

        },

        function(error) {

            console.log(error);

        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }

    );

}

// ----------------------------
// TOILETS
// ----------------------------

const toilets = toiletsData;
let hospitals = [];
const policeStations = policeData;

getNearbyHospitals().then(data => {

    hospitals = data;

    console.log("Total hospitals =", hospitals.length);

    hospitals.forEach(hospital => {

        console.log(hospital);

        let lat = hospital.lat;
        let lon = hospital.lon;

        if (!lat && hospital.center) {
            lat = hospital.center.lat;
            lon = hospital.center.lon;
        }

        if (lat && lon) {

            L.marker([lat, lon], {
                    icon: L.divIcon({
                        html: "➕",
                        className: "hospital-icon",
                        iconSize: [20, 20]
                    })
                })
                .addTo(map)
                .bindPopup(
                    "<b>Hospital</b><br>" +
                    (
                        hospital.tags &&
                        hospital.tags.name ?
                        hospital.tags.name :
                        "Unnamed Hospital"
                    )
                );
        }
    });
});

toilets.forEach(toilet => {

    L.circleMarker(
            [toilet.lat, toilet.lng], {
                radius: 6,
                color: "#00BCD4",
                fillColor: "#00BCD4",
                fillOpacity: 1
            }
        )
        .addTo(map)
        .bindPopup(
            "<b>Public Toilet</b><br>" +
            toilet.name
        );
});

policeStations.forEach(police => {

    L.circleMarker(
            [police.lat, police.lng], {
                radius: 6,
                color: "blue",
                fillColor: "blue",
                fillOpacity: 1
            }
        )
        .addTo(map)
        .bindPopup(
            "<b>Police Station</b><br>" +
            police.name
        );

});

// ----------------------------
// DISTANCE CALCULATOR
// ----------------------------

function getDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;
}

// ----------------------------
// COMMAND HANDLER
// ----------------------------

function handleCommand() {

    const input = document
        .getElementById("userInput")
        .value
        .toLowerCase();

    console.log("INPUT:", input);

    if (input.includes("nearest toilet")) {
        findNearestToilet();
        return;
    }

    // NEAREST TOILET

    if (

        input.includes("toilet") ||
        input.includes("toilets") ||
        input.includes("washroom") ||
        input.includes("washrooms") ||
        input.includes("restroom") ||
        input.includes("restrooms") ||
        input.includes("public toilet") ||
        input.includes("public toilets") ||
        input.includes("bathroom") ||
        input.includes("bathrooms") ||
        input.includes("latrine") ||
        input.includes("wc")

    ) {

        let nearestToilet = null;
        let minDistance = Infinity;

        toilets.forEach(toilet => {

            const distance = getDistance(
                userLat,
                userLng,
                toilet.lat,
                toilet.lng
            );

            if (distance < minDistance) {

                minDistance = distance;
                nearestToilet = toilet;

            }

        });

        if (nearestToilet) {

            map.setView(
                [nearestToilet.lat, nearestToilet.lng],
                18
            );

            L.marker([
                    nearestToilet.lat,
                    nearestToilet.lng
                ])
                .addTo(map)
                .bindPopup(
                    "🚻 Nearest Toilet<br>" +
                    nearestToilet.name +
                    "<br><br>" +
                    (minDistance * 1000).toFixed(0) +
                    " meters away"
                )
                .openPopup();

        }

    }

    // MAHAKAL
    else if (

        input.includes("mahakal") ||
        input.includes("mahakaleshwar") ||
        input.includes("mahakal temple") ||
        input.includes("jyotirling") ||
        input.includes("jyotirlinga")

    ) {
        map.setView(
            [23.1828, 75.7681],
            18
        );

        alert("Navigating to Mahakal");

    }

    // ISKCON
    else if (
        input.includes("iskcon") ||
        input.includes("iskon")
    ) {
        map.setView([23.1546, 75.7916], 17);

        L.marker([23.1546, 75.7916])
            .addTo(map)
            .bindPopup("ISKCON Temple Ujjain")
            .openPopup();

        alert("Navigating to ISKCON Temple");
    } else if (
        input.includes("temple") ||
        input.includes("nearest temple") ||
        input.includes("mandir")
    ) {
        findNearestTemple();
    }

    // POLICE
    else if (
        input.includes("police")
    ) {
        findNearestPolice();
    }

    // HOSPITAL
    else if (
        input.includes("hospital") ||
        input.includes("nearest hospital")
    ) {
        findNearestHospital();
    }
}

// =====================================
// CROWD INTELLIGENCE LAYER
// =====================================

// HEAVY CROWD (BROWN)

L.polygon([
    [23.1850, 75.7655],
    [23.1850, 75.7705],
    [23.1800, 75.7705],
    [23.1800, 75.7655]
], {
    color: "brown",
    fillColor: "brown",
    fillOpacity: 0.08,
    weight: 1
}).addTo(map).bindPopup("Mahakal Area - Heavy Crowd");


L.polygon([
    [23.1835, 75.7680],
    [23.1835, 75.7725],
    [23.1795, 75.7725],
    [23.1795, 75.7680]
], {
    color: "brown",
    fillColor: "brown",
    fillOpacity: 0.08,
    weight: 1
}).addTo(map).bindPopup("Harsiddhi Area - Heavy Crowd");


L.polygon([
    [23.1810, 75.7830],
    [23.1810, 75.7890],
    [23.1760, 75.7890],
    [23.1760, 75.7830]
], {
    color: "brown",
    fillColor: "brown",
    fillOpacity: 0.08,
    weight: 1
}).addTo(map).bindPopup("Ram Ghat Area - Heavy Crowd");


// MEDIUM CROWD (YELLOW)

L.polygon([
    [23.1830, 75.7880],
    [23.1830, 75.7960],
    [23.1770, 75.7960],
    [23.1770, 75.7880]
], {
    color: "#d4b000",
    fillColor: "yellow",
    fillOpacity: 0.06,
    weight: 1
}).addTo(map).bindPopup("Freeganj Area - Medium Crowd");


L.polygon([
    [23.2145, 75.7610],
    [23.2145, 75.7665],
    [23.2100, 75.7665],
    [23.2100, 75.7610]
], {
    color: "#d4b000",
    fillColor: "yellow",
    fillOpacity: 0.06,
    weight: 1
}).addTo(map).bindPopup("Mangalnath Area - Medium Crowd");


// LOW CROWD (GREEN)

L.polygon([
    [23.2050, 75.8050],
    [23.2050, 75.8150],
    [23.1950, 75.8150],
    [23.1950, 75.8050]
], {
    color: "green",
    fillColor: "green",
    fillOpacity: 0.05,
    weight: 1
}).addTo(map).bindPopup("Rishi Nagar Area - Low Crowd");


L.polygon([
    [23.2250, 75.8000],
    [23.2250, 75.8120],
    [23.2170, 75.8120],
    [23.2170, 75.8000]
], {
    color: "green",
    fillColor: "green",
    fillOpacity: 0.05,
    weight: 1
}).addTo(map).bindPopup("RD Gardi Area - Low Crowd");


// INNER RING ROAD

L.polyline([
    [23.2200, 75.8200],
    [23.2100, 75.8280],
    [23.1950, 75.8350],
    [23.1800, 75.8400]
], {
    color: "green",
    weight: 8,
    opacity: 0.20
}).addTo(map);


// LEGEND BOX

const legend = L.control({ position: 'topright' });

legend.onAdd = function() {

    const div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = `
<div style="
background:white;
padding:10px;
border-radius:8px;
box-shadow:0 0 8px rgba(0,0,0,0.3);
font-size:12px;
line-height:22px;
">

<b>Crowd Status</b><br><br>

🚻 Public Toilet<br>

🟤 Heavy Crowd<br>

🟡 Medium Crowd<br>

🟢 Low Crowd

</div>
`;

    return div;

};

legend.addTo(map);

function findNearestToilet() {
    navigateToNearest(toilets, "Public Toilet");
}

function findNearestHospital() {
    navigateToNearest(hospitals, "Hospital");
}

function findNearestPolice() {

    console.log("POLICE ARRAY =", policeStations);

    navigateToNearest(
        policeStations,
        "Police Station"
    );
}

function findNearestTemple() {

    console.log("TEMPLE ARRAY =", temples);

    navigateToNearest(
        temples,
        "Temple"
    );
}