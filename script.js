// Initialize the map
const map = L.map('map').setView([20.5, -157.5], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHToNa8zSIoMdIkW1Ky9m-wHPYfUTcThP5BDn1fVDsvBy2_cnqTrsjg3wkxxLxlXS3aBwx3TWfUW9L/pub?output=csv';

// Fetch school data
async function fetchSchoolData() {
    const response = await fetch(sheetURL);
    const csvText = await response.text();
    return csvText.split('\n').slice(1).map(row => row.split(',')).filter(cols => cols.length >= 7 && cols[0].trim()).map(([name, lat, lon, website, image, desc_en, desc_haw, programs]) => ({
        name: name.trim(),
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        website: website.trim(),
        image: image.trim(),
        description_en: desc_en.trim(),
        description_haw: desc_haw.trim(),
        programs: programs.trim().split(',')
    }));
}

// Language switch
const languageSwitchListeners = [];
let currentLanguage = 'en';
function switchLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'haw' : 'en';
    languageSwitchListeners.forEach(listener => listener());
    const languageFlag = document.getElementById('language-flag');
    languageFlag.src = currentLanguage === 'en'
        ? 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Flag_of_Hawaii.svg'
        : 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg';
    languageFlag.alt = currentLanguage === 'en' ? 'Hawaiian Flag' : 'American Flag';
    languageFlag.nextSibling.textContent = currentLanguage === 'en'
        ? ' Switch to ʻŌlelo Hawaiʻi'
        : ' Switch to English';
}

// Generate popup content
function getPopupContent(school, language) {
    return `
        <b>${school.name}</b><br>
        <img src="${school.image}" alt="${school.name}" style="width:100px;height:auto;"><br>
        <a href="${school.website}" target="_blank">Visit Website</a><br>
        ${language === 'haw' ? school.description_haw : school.description_en}<br>
        <b>Programs:</b> ${school.programs.join(', ')}
    `;
}

// Add school markers
let schoolMarkers = [];
async function addSchoolMarkers(filter = 'all') {
    const schools = await fetchSchoolData();
    schoolMarkers.forEach(marker => map.removeLayer(marker));
    schoolMarkers = [];
    schools.filter(school => filter === 'all' || school.programs.includes(filter)).forEach(school => {
        const marker = L.marker([school.lat, school.lon]).addTo(map);
        marker.bindPopup(getPopupContent(school, currentLanguage));
        schoolMarkers.push(marker);
        languageSwitchListeners.push(() => {
            marker.setPopupContent(getPopupContent(school, currentLanguage));
        });
    });
}

// Reload data
document.getElementById('reload-data').addEventListener('click', async () => {
    console.log('Reloading data...');
    await addSchoolMarkers(programFilter.value);
});

// Program filter
const programFilter = document.getElementById('program-filter');
programFilter.addEventListener('change', async () => {
    await addSchoolMarkers(programFilter.value);
});

// Initialize map
addSchoolMarkers();
