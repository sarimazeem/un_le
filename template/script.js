mapboxgl.accessToken = 'pk.eyJ1Ijoic2FyaW0yNDAiLCJhIjoiY2xxbnZhbGNtMWNtZzJrcDl2amk5bndjbiJ9.K-VQe8qVvIij9URoQR0WaA';

// Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [0, 0],
    zoom: 1.4,
    projection: 'mercator'
});

// Selected years for the analysis
const selectedYears = [1991, 2001, 2011, 2021, 2023];
const startYear = 1991;
const sliderLayers = Array.from({ length: 2023 - startYear + 1 }, (_, i) => `le_${startYear + i}`);

const slider = document.getElementById("slider");
const playPauseButton = document.getElementById("playPauseButton");
const yearDisplay = document.getElementById("yearDisplay");

slider.min = 0;
slider.max = selectedYears.length - 1; // 0..4
slider.value = 0;

let firstSymbolId;
let isPlaying = false;
let interval;
let currentSelectedIndex = 0;

map.on("load", () => {
    // Find first symbol layer for proper ordering
    firstSymbolId = map.getStyle().layers.find(layer => layer.type === "symbol")?.id;

    // Add GeoJSON source
    map.addSource("lifeExp", { type: "geojson", data: le_un });

    // Add fill layers for all years
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
                    40, "#f7fbff",
                    45, "#deebf7",
                    50, "#c6dbef",
                    55, "#9ecae1",
                    60, "#6baed6",
                    65, "#4292c6",
                    70, "#2171b5",
                    75, "#08519c",
                    80, "#08306b",
                    85, "#041C3C"
                ],
                "fill-opacity": 0.9,
                "fill-opacity-transition": { duration: 800 }
            },
            layout: { visibility: "visible" }
        }, firstSymbolId);
    });

    // Add white outline
    map.addLayer({
        id: "lifeExp-outline",
        type: "line",
        source: "lifeExp",
        paint: {
            "line-color": "#ffffff",
            "line-width": 1.5
        }
    }, firstSymbolId);

    // Show initial selected year
    showLayer(selectedYears[0] - startYear);
    updateYearDisplay(selectedYears[0] - startYear);
});

// Play/Pause Button
playPauseButton.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playPauseButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';

    if (isPlaying) {
        interval = setInterval(() => {
            currentSelectedIndex = (currentSelectedIndex + 1) % selectedYears.length;
            const layerIndex = selectedYears[currentSelectedIndex] - startYear;
            slider.value = currentSelectedIndex;
            showLayer(layerIndex);
            updateYearDisplay(layerIndex);
        }, 3000);
    } else {
        clearInterval(interval);
    }
});

// Slider Input Event
slider.addEventListener("input", () => {
    currentSelectedIndex = parseInt(slider.value);
    const layerIndex = selectedYears[currentSelectedIndex] - startYear;
    showLayer(layerIndex);
    updateYearDisplay(layerIndex);
});

// Show only the selected layer
function showLayer(index) {
    sliderLayers.forEach((layer, i) => {
        map.setPaintProperty(layer, "fill-opacity", i === index ? 0.9 : 0);
    });
}

// Update year display with fade effect
function updateYearDisplay(index) {
    const year = startYear + index;
    yearDisplay.style.opacity = 0;
    setTimeout(() => {
        yearDisplay.textContent = year;
        yearDisplay.style.opacity = 1;
    }, 200);
}

// Compass rotation
map.on("rotate", () => {
    const angle = -map.getBearing();
    document.getElementById("compassSVG").style.transform = `rotate(${angle}deg)`;
});

// Add scale control
map.addControl(
    new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'metric' }),
    'top-right'
);
