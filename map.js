const map = L.map('map').setView([23.1765, 75.7885], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

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

    hospitals.forEach(hospital => {

        L.circleMarker(
                [hospital.lat, hospital.lon], {
                    radius: 7,
                    color: "red",
                    fillColor: "red",
                    fillOpacity: 1
                }
            )
            .addTo(map)
            .bindPopup(
                "<b>Hospital</b><br>" +
                (hospital.tags && hospital.tags.name ?
                    hospital.tags.name :
                    "Unnamed Hospital")
            );

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

    const input =
        document
        .getElementById("userInput")
        .value
        .toLowerCase();

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

    let nearest = null;
    let minDistance = Infinity;

    toiletsData.forEach(toilet => {

        const distance = getDistance(
            userLat,
            userLng,
            toilet.lat,
            toilet.lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = toilet;
        }

    });

    if (nearest) {

        L.marker([nearest.lat, nearest.lng])
            .addTo(map)
            .bindPopup(
                `🚻 ${nearest.name}<br>${minDistance.toFixed(2)} km away`
            )
            .openPopup();

        map.setView([nearest.lat, nearest.lng], 16);

        alert(
            `Nearest Toilet:\n${nearest.name}\nDistance: ${minDistance.toFixed(2)} km`
        );
    }
}

function findNearestHospital() {

    let nearest = null;
    let minDistance = Infinity;

    hospitals.forEach(hospital => {

        const distance = getDistance(
            userLat,
            userLng,
            hospital.lat,
            hospital.lon
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = hospital;
        }

    });

    if (nearest) {

        L.marker([nearest.lat, nearest.lon])
            .addTo(map)
            .bindPopup(
                "🏥 " +
                (nearest.tags && nearest.tags.name ?
                    nearest.tags.name :
                    "Hospital") +
                "<br>" +
                minDistance.toFixed(2) +
                " km away"
            )
            .openPopup();

        map.setView(
            [nearest.lat, nearest.lon],
            16
        );

        alert(
            "Nearest Hospital:\n" +
            (nearest.tags && nearest.tags.name ?
                nearest.tags.name :
                "Hospital") +
            "\nDistance: " +
            minDistance.toFixed(2) +
            " km"
        );

    }

}

function findNearestPolice() {

    let nearest = null;
    let minDistance = Infinity;

    policeData.forEach(police => {

        const distance = getDistance(
            userLat,
            userLng,
            police.lat,
            police.lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = police;
        }

    });

    if (nearest) {

        L.marker([nearest.lat, nearest.lng])
            .addTo(map)
            .bindPopup(
                `👮 ${nearest.name}<br>${minDistance.toFixed(2)} km away`
            )
            .openPopup();

        map.setView([nearest.lat, nearest.lng], 16);

        alert(
            `Nearest Police Station:\n${nearest.name}\nDistance: ${minDistance.toFixed(2)} km`
        );
    }

}