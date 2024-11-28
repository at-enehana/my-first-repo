document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = L.map('map').setView([20.5, -157.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // URL for Google Sheets CSV
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHToNa8zSIoMdIkW1Ky9m-wHPYfUTcThP5BDn1fVDsvBy2_cnqTrsjg3wkxxLxlXS3aBwx3TWfUW9L/pub?output=csv';

    // Store markers globally for filtering
    let schoolMarkers = [];

    /**
     * Fetch school data from Google Sheets.
     * @returns {Promise<Array>} Parsed school data.
     */
    async function fetchSchoolData() {
        try {
            const response = await fetch(sheetURL);
            const csvText = await response.text();

            // Log the raw CSV data
            console.log('CSV Data:', csvText);

            // Parse CSV into JSON
            return csvText
                .split('\n')
                .slice(1) // Skip header row
                .map(row => row.split(','))
                .filter(cols => cols.length >= 8 && cols[0].trim()) // Ensure valid rows
                .map(([name, latitude, longitude, website, imageURL, descEn, descHaw, programs]) => ({
                    name: name.trim(),
                    lat: parseFloat(latitude),
                    lon: parseFloat(longitude),
                    website: website.trim(),
                    image: imageURL.trim(),
                    description_en: descEn.trim(),
                    description_haw: descHaw.trim(),
                    programs: programs.trim().split(',')
                }));
        } catch (error) {
            console.error('Error fetching school data:', error);
            return [];
        }
    }

    /**
     * Generate popup content for a school marker.
     */
    function getPopupContent(school, language) {
        return `
            <b>${school.name}</b><br>
            <img src="${school.image}" alt="${school.name}" style="width:100px;height:auto;"><br>
            <a href="${school.website}" target="_blank">Visit Website</a><br>
            ${language === 'haw' ? school.description_haw : school.description_en}<br>
            <b>Programs:</b> ${school.programs.join(', ')}
        `;
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

    /**
     * Add school markers to the map.
     * @param {string} filter - Program filter (default: 'all').
     */
    async function addSchoolMarkers(filter = 'all') {
        const schools = await fetchSchoolData();
        console.log('Fetched Schools:', schools);

        // Remove existing markers
        schoolMarkers.forEach(marker => map.removeLayer(marker));
        schoolMarkers = [];

        // Filter and add markers
        schools
            .filter(school => filter === 'all' || school.programs.includes(filter))
            .forEach(school => {
                const marker = L.marker([school.lat, school.lon]).addTo(map);
                marker.bindPopup(getPopupContent(school, currentLanguage));
                schoolMarkers.push(marker);

                // Update popup content on language switch
                languageSwitchListeners.push(() => {
                    marker.setPopupContent(getPopupContent(school, currentLanguage));
                });
            });

        if (schoolMarkers.length === 0) {
            console.warn('No markers to display. Check filter or data.');
        }
    }

    // Reload data
    document.getElementById('reload-data').addEventListener('click', async () => {
        console.log('Reloading data...');
        await addSchoolMarkers(programFilter.value);
    });

    // Program filter
    const programFilter = document.getElementById('program-filter');
    programFilter.addEventListener('change', async () => {
        const selectedProgram = programFilter.value;
        console.log('Selected Program:', selectedProgram);
        await addSchoolMarkers(selectedProgram);
    });

    // Initialize map
    addSchoolMarkers();
});
