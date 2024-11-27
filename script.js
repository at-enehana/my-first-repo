// Initialize the map
var map = L.map('map').setView([20.5, -157.5], 7);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// Replace this URL with your published Google Sheet CSV link
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHToNa8zSIoMdIkW1Ky9m-wHPYfUTcThP5BDn1fVDsvBy2_cnqTrsjg3wkxxLxlXS3aBwx3TWfUW9L/pub?output=csv';

// Fetch and parse the Google Sheet data
async function fetchSchoolData() {
    const response = await fetch(sheetURL);
    const csvText = await response.text();

    // Parse CSV into JSON
    return csvText.split('\n').slice(1).map(row => {
        const cols = row.split(',');
        return {
            name: cols[0].trim(),
            lat: parseFloat(cols[1]),
            lon: parseFloat(cols[2]),
            website: cols[3].trim(),
            image: cols[4].trim(),
            description_en: cols[5].trim(),
            description_haw: cols[6].trim()
        };
    });
}

async function addSchoolMarkers() {
    const schools = await fetchSchoolData();

    schools.forEach(school => {
        const marker = L.marker([school.lat, school.lon]).addTo(map);

        // Function to get popup content
        function getPopupContent(language) {
            return `
                <b>${school.name}</b><br>
                <img src="${school.image}" alt="${school.name}" style="width:100px;height:auto;"><br>
                <a href="${school.website}" target="_blank">Visit Website</a><br>
                ${language === 'haw' ? school.description_haw : school.description_en}
            `;
        }

        // Set default popup content
        marker.bindPopup(getPopupContent(currentLanguage));

        // Update popup content on language switch
        languageSwitchListeners.push(() => {
            marker.setPopupContent(getPopupContent(currentLanguage));
        });
    });
}


// Add a listener to update markers when the language changes
const languageSwitchListeners = [];
function switchLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'haw' : 'en';
    languageSwitchListeners.forEach(listener => listener());
}

// Initialize the map and add markers
const map = L.map('map').setView([20.5, -157.5], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
addSchoolMarkers();


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
    
    // Update the flag image
    const languageFlag = document.getElementById('language-flag');
    if (currentLanguage === 'en') {
        languageFlag.src = 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Flag_of_Hawaii.svg';
        languageFlag.alt = 'Hawaiian Flag';
        languageFlag.nextSibling.textContent = ' Switch to ʻŌlelo Hawaiʻi'; // Update only the text
    } else {
        languageFlag.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg';
        languageFlag.alt = 'American Flag';
        languageFlag.nextSibling.textContent = ' Switch to English'; // Update only the text
    }
}
