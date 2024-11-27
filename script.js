// Initialize the map
const map = L.map('map').setView([20.5, -157.5], 7);
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
            name_en: cols[0].trim(),
            name_haw: cols[1].trim(),
            lat: parseFloat(cols[2]),
            lon: parseFloat(cols[3]),
            website: cols[4].trim(),
            image: cols[5].trim(),
            description_en: cols[6].trim(),
            description_haw: cols[7].trim()
        };
    });
}

// Language switch listeners
const languageSwitchListeners = [];
let currentLanguage = 'en';

// Add markers to the map
async function addSchoolMarkers() {
    const schools = await fetchSchoolData();

    schools.forEach(school => {
        const marker = L.marker([school.lat, school.lon]).addTo(map);

        // Function to get popup content
        function getPopupContent(language) {
            return `
                <b>${school.name_en}</b><br>
                <img src="${school.image}" alt="${school.name_en}" style="width:100px;height:auto;"><br>
                <a href="${school.website}" target="_blank">Visit Website</a><br>
                ${language === 'haw' ? school.description_haw : school.description_en}
            `;
        }

        // Set default popup content
        marker.bindPopup(getPopupContent(currentLanguage));

        // Add a listener to update the popup content on language switch
        languageSwitchListeners.push(() => {
            marker.setPopupContent(getPopupContent(currentLanguage));
        });
    });
}

// Language switch function
function switchLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'haw' : 'en';

    // Update all markers' popups
    languageSwitchListeners.forEach(listener => listener());

    // Update the flag image and button text
    const languageFlag = document.getElementById('language-flag');
    if (currentLanguage === 'en') {
        languageFlag.src = 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Flag_of_Hawaii.svg';
        languageFlag.alt = 'Hawaiian Flag';
        languageFlag.nextSibling.textContent = ' Switch to ʻŌlelo Hawaiʻi';
    } else {
        languageFlag.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg';
        languageFlag.alt = 'American Flag';
        languageFlag.nextSibling.textContent = ' Switch to English';
    }
}

// Initialize the map and add markers
addSchoolMarkers();
