mapboxgl.accessToken = 'pk.eyJ1Ijoic2FyaW0yNDAiLCJhIjoiY2xxbnZhbGNtMWNtZzJrcDl2amk5bndjbiJ9.K-VQe8qVvIij9URoQR0WaA';
//_______________________________________________________________________________________________ā
// Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [0, 0], // Centered on the Netherlands
    zoom: 1.4,
    projection: 'mercator'
});



//__________________________________________________________________________
// _______________________________
// Slider & Year Setup
// _______________________________
const yearDisplay = document.getElementById("yearDisplay");
const slider = document.getElementById("slider");
const playPauseButton = document.getElementById("playPauseButton");

const startYear = 1991;
const endYear = 2023;
const sliderLayers = Array.from({ length: endYear - startYear + 1 }, (_, i) => `le_${startYear + i}`);

slider.min = 0;
slider.max = sliderLayers.length - 1;
slider.value = 0;

// _______________________________
// Map Load & Layer Setup
// _______________________________
let firstSymbolId;
let isPlaying = false;
let interval;

map.on("load", () => {
    // Find first symbol layer for proper layer ordering
    const layers = map.getStyle().layers;
    firstSymbolId = layers.find(layer => layer.type === "symbol")?.id;

    // Add GeoJSON source
    map.addSource("lifeExp", { type: "geojson", data: le_un });

    // Add fill layers for each year
    sliderLayers.forEach(yearField => {
        map.addLayer({
            id: yearField,
            type: "fill",
            source: "lifeExp",
            paint: {
                "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", yearField],
                    40, "#d73027",
                    45, "#fc8d59",
                    50, "#fee08b",
                    55, "#d9ef8b",
                    60, "#91cf60",
                    65, "#1a9850",
                    70, "#66c2a5",
                    75, "#3288bd",
                    80, "#5e4fa2",
                    85, "#9e0142"
                ],
                "fill-opacity": 0.9,
                "fill-opacity-transition": { duration: 800 }  // 👈 SLOW FADE

            },
            layout: { visibility: "visible" }
        }, firstSymbolId);
    });

    // Add white outline layer
    map.addLayer({
        id: "lifeExp-outline",
        type: "line",
        source: "lifeExp",
        paint: {
            "line-color": "#ffffff",
            "line-width": 1.5
        }
    }, firstSymbolId); // ensures outline is below labels but above fills

    // Show initial year
    updateYearDisplay(slider.value);
});

// _______________________________
// Play/Pause Animation
// _______________________________
playPauseButton.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playPauseButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';

    if (isPlaying) {
        interval = setInterval(() => {
            advanceSlider();
        }, 1000);
    } else {
        clearInterval(interval);
    }
});

// _______________________________
// Slider Input Event
// _______________________________
slider.addEventListener("input", () => {
    showLayer(slider.value);
    updateYearDisplay(slider.value);
});

// _______________________________
// Helper Functions
// _______________________________

function advanceSlider() {
    let currentVal = parseInt(slider.value);
    slider.value = (currentVal + 1) % sliderLayers.length; // wrap around
    showLayer(slider.value);
    updateYearDisplay(slider.value);
}

function showLayer(index) {
    sliderLayers.forEach((layer, i) => {
        map.setPaintProperty(layer, "fill-opacity", i === parseInt(index) ? 0.9 : 0);
    });
}

function updateYearDisplay(index) {
    const year = startYear + parseInt(index);
    // fade out
    yearDisplay.style.opacity = 0;
    setTimeout(() => {
        // update text when invisible
        yearDisplay.textContent = year;
        // fade in
        yearDisplay.style.opacity = 1;
    }, 200); // half of your CSS transition time
}
