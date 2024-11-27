// Initialize the map
var map = L.map('map').setView([20.5, -157.5], 7);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// School data
var schoolData = {
    name_en: "Hawaii School",
    name_haw: "Kula o Hawaiʻi",
    lat: 20.8,
    lon: -156.3,
    website: "https://www.google.com",
    image: "https://flymeflag.com/cdn/shop/files/Hawaii-Flags-Flag.jpg?v=1709131338",
    description_en: "This is a Hawaiʻi school.",
    description_haw: "He kula o Hawaiʻi kēia."
};

// Create a marker
var marker = L.marker([schoolData.lat, schoolData.lon]).addTo(map);

// Function to get popup content in the selected language
function getPopupContent(language) {
    return `
        <b>${language === 'haw' ? schoolData.name_haw : schoolData.name_en}</b><br>
        <img src="${schoolData.image}" alt="${schoolData.name_en}" style="width:100px;height:auto;"><br>
        <a href="${schoolData.website}" target="_blank">Visit Website</a><br>
        ${language === 'haw' ? schoolData.description_haw : schoolData.description_en}
    `;
}

// Set default popup content in English
marker.bindPopup(getPopupContent('en'));

// Language switch function
var currentLanguage = 'en';
function switchLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'haw' : 'en';
    marker.setPopupContent(getPopupContent(currentLanguage));
    
    // Update the button text and flag
    const languageButton = document.querySelector('.language-button');
    const languageFlag = document.getElementById('language-flag');
    if (currentLanguage === 'en') {
        languageButton.textContent = ' Switch to ʻŌlelo Hawaiʻi';
        languageFlag.src = 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Flag_of_Hawaii.svg';
        languageFlag.alt = 'Hawaiian Flag';
    } else {
        languageButton.textContent = ' Switch to English';
        languageFlag.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg';
        languageFlag.alt = 'American Flag';

    }
}
