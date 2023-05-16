      import { mapCenter, baseLayerAttribution, baseLayerUrl, subdivisions, countyCoordinates, countyCommuteData, allCountiesGeoJSONUrl } from './mapData.js';


        let data = null;
        
        // Create a new layer group for subdivisions
        const subdivisionLayerGroup = L.layerGroup();
        
        // Create the map
        let map = L.map('map').setView(mapCenter, 9);
        
        const baseLayer = L.tileLayer(baseLayerUrl, {
            attribution: baseLayerAttribution
        }).addTo(map);
        
        // Create a GeoSearchControl
        let searchControl = new GeoSearch.GeoSearchControl({
            provider: new GeoSearch.OpenStreetMapProvider(),
            style: 'bar', 
            showMarker: true, // optional: true|false  - default true
            showPopup: false, // optional: true|false  - default false
            marker: {
                // optional: L.Marker    - default L.Icon.Default
                icon: new L.Icon.Default(),
                draggable: false,
            },
            popupFormat: ({ query, result }) => result.label, // optional: function    - default returns result label
            maxMarkers: 1, // optional: number      - default 1
            retainZoomLevel: false, // optional: true|false  - default false
            animateZoom: true, // optional: true|false  - default true
            autoClose: false, // optional: true|false  - default false
            searchLabel: 'Enter address', // optional: string      - default 'Enter address'
            keepResult: true // optional: true|false  - default false
        });
        
        // Add the search control to the map
        map.addControl(searchControl);
        
        // Create a variable to store the last marker
        let lastMarker;
        
        // Add an event listener to the search control
        searchControl.getContainer().addEventListener('click', () => {
            // If a last marker exists, remove it from the map
            if (lastMarker) {
                map.removeLayer(lastMarker);
            }
        });
        
        // Listen to the search event
        map.on('geosearch/showlocation', function (e) {
            // Store the current marker as the last marker
            lastMarker = e.marker;
        });
                        
        // Load the data from the Flask API
        async function fetchData() {
            const response = await fetch('/api/data');
            data = await response.json();
        }
        
        // Create a new layer group for county border overlays
        const countyOverlayLayerGroup = L.layerGroup();
        
        // Create a new layer group for circles
        const circleLayerGroup = L.layerGroup();

        function createLegend(commuteData, colors) {
            let legendHTML = '';
        
            // Sort the commuteData array in ascending order by commute time
            commuteData.sort((a, b) => a.time - b.time);
        
            for (let i = 0; i < commuteData.length; i++) {
                legendHTML += `
                    <div style="display: flex; align-items: center; margin-top: 5px;">
                        <div style="width: 10px; height: 10px; background-color: ${colors[i % colors.length]}; margin-right: 5px;"></div>
                        <span>${commuteData[i].time} minutes (${(commuteData[i].percentage * 100).toFixed(2)}%)</span>
                    </div>
                `;
            }
        
            return legendHTML;
        }
        
        
        function countyOverlayStyle() {
            return {
                fillColor: 'none', // Remove the blue fill
                color: 'blue',
                weight: 2,
                opacity: 0.6
            };
        }

        // Load GeoJSON data and display it on the map
        async function loadGeoJSON(geoJSONUrl, countyName, customStyle = null) {
            const response = await fetch(geoJSONUrl);
            const geoJSONData = await response.json();

            // Filter the county
            const filteredGeoJSONData = {
                ...geoJSONData,
                features: geoJSONData.features.filter(feature => feature.properties.name === countyName)
            };

            let countyOverlay;
            if (customStyle) {
                countyOverlay = L.geoJSON(filteredGeoJSONData, { style: customStyle });
            } else {
                countyOverlay = L.geoJSON(filteredGeoJSONData);
            }

            countyOverlay.addTo(countyOverlayLayerGroup);
        }

        function createCommuteCircles(coordinates, commuteData, county) {
            const colors = ['rgba(0, 255, 0, 1)', 'rgba(135, 206, 235, 1)', 'rgba(255, 255, 0, 0.5)', 'rgba(255, 165, 0, 0.5)', 'rgba(255, 0, 0, 0.5)']; // Green, Blue, Yellow, Orange, Red
            const borderColor = 'black';
            let circleLayerGroup = L.layerGroup();  // Create a layer group   
              
            // Sort the commuteData array in ascending order by commute time
            commuteData.sort((a, b) => a.time - b.time);
          
            const legendHTML = createLegend(commuteData, colors);
        
            for (let i = 0; i < commuteData.length; i++) {
                const circle = L.circle(coordinates, {
                    color: borderColor,
                    fillColor: colors[i % colors.length], // using modulo to cycle through colors
                    fillOpacity: 0.5,
                    radius: (commuteData[i].time / 60) * commuteData[i].speed * 1000,
                    weight: 1,
                    opacity: 0.6,
                    interactive: true // Set interactive to true for all circles
                });
        
                // Add a popup for each piece of the radii
                circle.bindPopup(`
                    <div>
                        <b>County:</b> ${county}<br>
                        <b>Commute Time:</b> ${commuteData[i].time} minutes<br>
                        <b>Percentage:</b> ${(commuteData[i].percentage * 100).toFixed(2)}%
                        <div style="margin-top: 10px;">
                            <b>Color Key:</b>
                            ${legendHTML}
                        </div>
                    </div>
                `);
                      
                circle.on('mouseover', function (e) {
                    if (i < commuteData.length - 1) { // if not the last (largest) circle
                        // hide the larger circle
                        circleLayerGroup.getLayers()[i + 1].setStyle({
                            fillOpacity: 0 // hide the larger circle
                        });
                    }
                    this.openPopup();
                });
        
                circle.on('mouseout', function (e) {
                    if (i < commuteData.length - 1) { // if not the last (largest) circle
                        // show the larger circle
                        circleLayerGroup.getLayers()[i + 1].setStyle({
                            fillOpacity: 0.5 // show the larger circle
                        });
                    }
                    this.closePopup();
                });
        
                // Add the circle to the feature group
                circleLayerGroup.addLayer(circle);
            }
        
            return circleLayerGroup;  // Return the layer group
        }
                                                                                                            
        function updateMap(data, year) {
            // Remove the existing circle layer groups from the map
            circleLayerGroup.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
        
            // Clear the circle layer group
            circleLayerGroup.clearLayers();
        
            // Add data to the map based on the selected year
            const filteredData = data.filter(d => d.year === year);
        
            for (const [county, coordinates] of Object.entries(countyCoordinates)) {
                const countyData = filteredData.find(d => d.county === county);
        
                // Create a circle with a radius proportional to the population
                const circle = L.circle(coordinates, {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: Math.sqrt(countyData.population / Math.PI) * 10
                });
                  
                // Bind the popup containing the data to the circle
                circle.bindPopup(`<b>County:</b> ${county}<br><b>Year:</b> ${year}<br><b>Total Population:</b> ${countyData.population.toFixed(0)}`);
        
                // Add the circle to the layer group
                circleLayerGroup.addLayer(circle);
        
                // Add commute circles if the corresponding toggle is checked
                if (document.getElementById(`${county.toLowerCase()}-radii-toggle`).checked) {
                    const commuteCircleLayerGroup = createCommuteCircles(coordinates, countyCommuteData[county], county);
                    circleLayerGroup.addLayer(commuteCircleLayerGroup);
                    commuteCircleLayerGroup.addTo(map);
                }
                
            }
        
            // Add the layer group to the map before county overlays
            circleLayerGroup.addTo(map);
        
            // Add the countyOverlayLayerGroup to the map
            countyOverlayLayerGroup.addTo(map);
        }
        
        // Update the table with the data for the selected year
        function updateTable(data, year) {
            const filteredData = data.filter(d => d.year === year);
        
            for (const countyData of filteredData) {
                const countyRow = document.getElementById(`${countyData.county.toLowerCase()}-row`);
                const populationCell = countyRow.querySelector(`#${countyData.county.toLowerCase()}-population`);
                const growthCell = countyRow.querySelector(`#${countyData.county.toLowerCase()}-growth`);
        
                populationCell.textContent = countyData.population.toFixed(0);
                growthCell.textContent = `${countyData.growth.toFixed(2)}%`;
            }
        }
            
        // Update the map and table when the slider value changes
        document.getElementById("slider").addEventListener("input", (event) => {
            if (!data) {
                return;
            }
        
            const year = parseInt(event.target.value, 10);
            document.getElementById("slider-label").textContent = `Year: ${year}`;
        
            updateMap(data, year);
            updateTable(data, year);
        });
        
        // Add an event listener for the toggle
        document.querySelectorAll("#county-toggles input[type=checkbox]").forEach(toggle => {
            toggle.addEventListener("change", () => {
                if (!data) {
                    return;
                }

                const year = parseInt(document.getElementById("slider").value, 10);

                // Remove the circleLayerGroup from the map
                map.removeLayer(circleLayerGroup);

                updateMap(data, year);
                updateTable(data, year);
            });
        }); 

        // Get the button and the control elements
        const toggleButton = document.getElementById('toggle-controls');
        const sliderContainer = document.getElementById('slider-container');
        const countyToggles = document.getElementById('county-toggles');
        const populationTable = document.getElementById('population-table');
        
        toggleButton.addEventListener('click', () => {
            // Check the current display style of the controls
            if (sliderContainer.style.display !== 'none') {
                // If the controls are not currently hidden, hide them
                sliderContainer.style.display = 'none';
                countyToggles.style.display = 'none';
                populationTable.style.display = 'none';
        
                // Update the button text
                toggleButton.textContent = 'Show Controls';
        
                // Add a class to the body
                document.body.classList.add('controls-hidden');
            } else {
                // If the controls are currently hidden, show them
                sliderContainer.style.display = 'block';
                countyToggles.style.display = 'block';
                populationTable.style.display = 'block';
        
                // Update the button text
                toggleButton.textContent = 'Hide Controls';
        
                // Remove the class from the body
                document.body.classList.remove('controls-hidden');
            }
        });

        // Fetch data and set up map and slider
        async function initialize() {
            await fetchData();
            updateMap(data, 2020);
            updateTable(data, 2020);
        
        // Add subdivision markers into the layer group
        for (const subdivision of subdivisions) {
            const marker = L.marker(subdivision.coordinates, { color: 'skyblue' });
            marker.bindPopup(`<b>Address:</b> ${subdivision.address}<br><b>Worker Count:</b> ${subdivision.workerCount}`);
            subdivisionLayerGroup.addLayer(marker);
        }
        
        // Add the layer group to the map
        subdivisionLayerGroup.addTo(map);
        }
    
        initialize();

        loadGeoJSON(allCountiesGeoJSONUrl, "Travis", countyOverlayStyle());
        loadGeoJSON(allCountiesGeoJSONUrl, "Blanco", countyOverlayStyle());
        loadGeoJSON(allCountiesGeoJSONUrl, "Hays", countyOverlayStyle());
        loadGeoJSON(allCountiesGeoJSONUrl, "Comal", countyOverlayStyle());
    
        // Add the countyOverlayLayerGroup to the map
        countyOverlayLayerGroup.addTo(map);
