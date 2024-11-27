// Initialize the map
const map = L.map('map').setView([20.7967, -156.3319], 8); // Maui, Hawaiʻi

// Add a tile layer (map design)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add a marker
const marker = L.marker([20.7967, -156.3319]).addTo(map);
marker.bindPopup('Aloha! Testing out a map.').openPopup();
