async function getNearbyToilets() {

    const query = `
    [out:json];
    node["amenity"="toilets"](around:3000,23.1765,75.7885);
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

(
  node["amenity"="hospital"](around:5000,23.1765,75.7885);
  node["amenity"="clinic"](around:5000,23.1765,75.7885);
  node["amenity"="doctors"](around:5000,23.1765,75.7885);

  way["amenity"="hospital"](around:5000,23.1765,75.7885);
  way["amenity"="clinic"](around:5000,23.1765,75.7885);
  way["amenity"="doctors"](around:5000,23.1765,75.7885);
);

out center;
`;

    const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

    const response = await fetch(url);

    const data = await response.json();

    console.log("Hospitals:", data);

    return data.elements;
}

async function getNearbyTemples() {

    const query = `
    [out:json];
    (
      node["amenity"="place_of_worship"](around:15000,23.1765,75.7885);
      way["amenity"="place_of_worship"](around:15000,23.1765,75.7885);
    );
    out center;
    `;

    const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

    const response = await fetch(url);
    const data = await response.json();

    console.log("TEMPLES:", data);

    return data.elements;
}