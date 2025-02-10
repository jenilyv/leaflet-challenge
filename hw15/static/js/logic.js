// Initialize the map
let map = L.map("map", {
    center: [20, -10],  // Centered at a global view
    zoom: 2
});

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// USGS Earthquake Data API (Significant Earthquakes, Past 7 Days)
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";

// Fetch GeoJSON data
d3.json(url).then(function (data) {

    // Function to determine marker color based on depth
    function getColor(depth) {
        return depth > 90 ? "#FF5733" :
               depth > 70 ? "#EB984E" :
               depth > 50 ? "#F8C471" :
               depth > 30 ? "#F4D03F" :
               depth > 10 ? "#CDFF33" :
                            "#9BFF33";
    }

    // Function to determine marker size based on magnitude
    function getSize(magnitude) {
        return magnitude === 0 ? 1 : magnitude * 4; // Adjusted scaling
    }

    // Function to style each marker
    function styleFeature(feature) {
        return {
            fillColor: getColor(feature.geometry.coordinates[2]),  // Depth-based color
            radius: getSize(feature.properties.mag),  // Magnitude-based size
            color: "#000",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        };
    }

    // Create a GeoJSON layer
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleFeature,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                `<strong>Magnitude:</strong> ${feature.properties.mag}
                <br><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km
                <br><strong>Location:</strong> ${feature.properties.place}`
            );
        }
    }).addTo(map);

    // Add Legend
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [-10, 10, 30, 50, 70, 90];
        let labels = [];

        // Generate legend content
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${getColor(depths[i])}"></i> ${depths[i]}${depths[i + 1] ? `–${depths[i + 1]}` : "+"}<br>`;
        }
        return div;
    };

    legend.addTo(map);
});
