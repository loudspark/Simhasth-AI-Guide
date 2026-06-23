async function getNearbyToilets() {

    const query = `
    [out:json];
    node["amenity"="toilets"](around:5000,23.1765,75.7885);
    out;
    `;

    const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

    const response = await fetch(url);

    const data = await response.json();

    console.log(data);

    return data.elements;
}

async function getNearbyHospitals() {

    const query = `
    [out:json];
    node["amenity"="hospital"](around:5000,23.1765,75.7885);
    out;
    `;

    const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

    const response = await fetch(url);

    const data = await response.json();

    console.log("Hospitals:", data);

    return data.elements;
}