document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = L.map('map').setView([20.5, -157.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const programFilter = document.getElementById('program-filter');
    if (!programFilter) {
        console.error('Dropdown element (#program-filter) not found.');
        return; // Exit early if the element doesn't exist
    }

    // Log dropdown initialization
    console.log('Program Filter:', programFilter);

    // Language switch listeners
    const languageSwitchListeners = [];
    let currentLanguage = 'en';

    // Replace this URL with your published Google Sheet CSV link
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHToNa8zSIoMdIkW1Ky9m-wHPYfUTcThP5BDn1fVDsvBy2_cnqTrsjg3wkxxLxlXS3aBwx3TWfUW9L/pub?output=csv';

    // Fetch and parse the Google Sheet data
    async function fetchSchoolData() {
        const response = await fetch(sheetURL);
        const csvText = await response.text();

        // Parse CSV into JSON
        return csvText.split('\n').slice(1) // Skip header row
            .map(row => row.split(',')) // Split each row into columns
            .filter(cols => cols.length >= 7 && cols[0].trim() !== '') // Ensure valid rows
            .map(cols => ({
                name: cols[0].trim(),
                lat: parseFloat(cols[1]),
                lon: parseFloat(cols[2]),
                website: cols[3].trim(),
                image: cols[4].trim(),
                description_en: cols[5].trim(),
                description_haw: cols[6].trim(),
                programs: cols[7].trim().split(',') // Split programs into an array
            }));
    }

    // Add school markers to the map
    async function addSchoolMarkers() {
        const schools = await fetchSchoolData();

        // Clear existing markers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Get selected program from the dropdown
        const selectedProgram = programFilter.value;
        console.log(`Selected Program: ${selectedProgram}`); // Debug

        // Iterate through the schools and add markers
        schools.forEach(school => {
            console.log(`Checking School: ${school.name}, Programs: ${school.programs}`); // Debug

            // Check if the school matches the selected program
            if (selectedProgram !== 'all' && !school.programs.map(p => p.trim().toLowerCase()).includes(selectedProgram.toLowerCase())) {
                return; // Skip this school
            }

            // Create a marker for the school
            const marker = L.marker([school.lat, school.lon]).addTo(map);

            // Function to get popup content
            function getPopupContent(language) {
                return `
                    <b>${school.name}</b><br>
                    <img src="${school.image}" alt="${school.name}" style="width:100px;height:auto;"><br>
                    <a href="${school.website}" target="_blank">Visit Website</a><br>
                    ${language === 'haw' ? school.description_haw : school.description_en}<br>
                    <b>Programs:</b> ${school.programs.join(', ')}
                `;
            }

            // Bind popup content to the marker
            marker.bindPopup(getPopupContent(currentLanguage));

            // Add to language switch listeners
            languageSwitchListeners.push(() => {
                marker.setPopupContent(getPopupContent(currentLanguage));
            });
        });

        console.log(`Markers added for program: ${selectedProgram}`);
    }

    // Attach event listener for dropdown
    programFilter.addEventListener('change', () => {
        console.log('Dropdown value changed!');
        addSchoolMarkers(); // Reload markers when filter changes
    });

    // Attach event listener for reload button
    const reloadButton = document.getElementById('reload-data');
    if (reloadButton) {
        reloadButton.addEventListener('click', async () => {
            console.log('Reloading data and resetting filters...');
            
            // Reset the dropdown to its default value
            programFilter.value = 'all';
            
            // Reload markers with fresh data
            await addSchoolMarkers();
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

    // Attach event listener for language button
    const languageButton = document.querySelector('.language-button');
    if (languageButton) {
        languageButton.addEventListener('click', switchLanguage);
    }

    // Initialize the map and add markers
    addSchoolMarkers();
});
