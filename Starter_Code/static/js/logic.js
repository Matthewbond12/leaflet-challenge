
// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})


let satellite = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create our map, giving it the streetmap and satellite layers to display on load.
let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 3,
    layers: [street, satellite]
});


// Create a baseMaps object.
let baseMaps = {
    "Street Map": street,
    "Satellite Map": satellite
};

let tectonicplates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

// Create an overlay object to hold our overlay.
let overlayMaps = {
    Techtonicplates: tectonicplates,
    Earthquakes: earthquakes
};

L
    .control
    .layers(baseMaps, overlayMaps, { collapsed: false })
    .addTo(myMap);

// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function getColor(depth) {
        if (depth > 90) {
            return "#ea2c2c";
        }
        if (depth > 70) {
            return "#ea822c";
        }
        if (depth > 50) {
            return "#ee9c00";
        }
        if (depth > 30) {
            return "#eecc00";
        }
        if (depth > 10) {
            return "#d4ee00";
        }
        return "#98ee00";
    }


    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: styleInfo,

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Location: "
                + feature.properties.place
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "<br>Magnitude: "
                + feature.properties.mag
            );
        }
    }).addTo(earthquakes);

    earthquakes.addTo(myMap);

    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        let grades = [-10, 10, 30, 50, 70, 90];

        let colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"];

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: "
                + colors[i]
                + "'></i> "
                + grades[i]
                + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }

        return div;
    };

    legend.addTo(myMap);

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {

        L.geoJson(platedata, {
            color: "blue",
            weight: 3
        }).addTo(tectonicplates);

        tectonicplates.addTo(myMap);
    });

});

























