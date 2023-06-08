import { mapCenter, baseLayerAttribution, baseLayerUrl, subdivisions, countyCoordinates, countyCommuteData, allCountiesGeoJSONUrl } from './mapData.js';


        let data = null;

        function getYearFromDate(dateString) {
            return new Date(dateString).getFullYear();
        }

       subdivisions.forEach(subdivision => {
          subdivision.date = new Date(subdivision.date);
      });

        // Create a new layer group for subdivisions
        const subdivisionLayerGroup = L.layerGroup();
        
        // Create the map
        let map = L.map('map').setView(mapCenter, 9);
        
        const baseLayer = L.tileLayer(baseLayerUrl, {
            attribution: baseLayerAttribution
        }).addTo(map);
        

        let myIcon = L.icon({
              iconUrl: 'static/images/marker-icon-blue.png',
              iconSize: [30, 44],
              iconAnchor: [22, 94],
              popupAnchor: [-3, -76]
        });
      

        let noAddressIcon = new L.Icon({
            iconUrl: 'static/images/marker-icon-red.png',
            iconSize: [30, 44],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        });        
 
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
                countyOverlay = L.geoJSON(filteredGeoJSONData, { 
                    style: customStyle,
                    onEachFeature: function(feature, layer) {
                        // Here we are creating a label and adding it to the layer
                        let label = L.marker(layer.getBounds().getCenter(), {
                            icon: L.divIcon({
                                className: 'county-label', 
                                html: feature.properties.name,
                                iconSize: [100, 25]
                            }),
                            interactive: false
                        }).addTo(map);
                    }
                });
            } else {
                countyOverlay = L.geoJSON(filteredGeoJSONData);
            }
        
            countyOverlay.addTo(countyOverlayLayerGroup);
        }
        
        function createCommuteCircles(coordinates, commuteData, county) {
            const colors = ['rgba(0, 255, 0, 1)', 'rgba(0, 0, 139, 1)', 'rgba(255, 255, 0, 0.5)', 'rgba(255, 165, 0, 0.5)', 'rgba(255, 0, 0, 0.5)']; 
            // These are your original colors for the circles.
                      
            const popupColors = ['#ad7635', '#c6754d', '#faa762','#f8a583','#f5b3af' ]; 
            // These are your new colors for the popups.
        
            const borderColor = 'black';
            let circleLayerGroup = L.layerGroup();  // Create a layer group   
        
            // Sort the commuteData array in descending order by commute time
            commuteData.sort((a, b) => b.time - a.time);
            
            // We pass popupColors instead of colors for the legend creation.
            const legendHTML = createLegend(commuteData, popupColors);
            
            for (let i = 0; i < commuteData.length; i++) {
                const circle = L.circle(coordinates, {
                    color: borderColor,
                    fillColor: colors[i % colors.length], 
                    fillOpacity: 0.5,
                    radius: (commuteData[i].time / 60) * commuteData[i].speed * 1000,
                    weight: 1,
                    opacity: 0.6,
                    interactive: true 
                });
        
                // Add a popup for each piece of the radii
                circle.bindPopup(`
                    <div>
                        <b>County:</b> ${county}<br>
                        <div style="margin-top: 10px;">
                            <b>Color Key:</b>
                            ${legendHTML}
                        </div>
                    </div>
                `);
                
                // Add the circle to the feature group
                circleLayerGroup.addLayer(circle);
            }
        
            return circleLayerGroup;  
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
                
                    // Add a check here to see if countyData is found
                    if (countyData) {
                        // If the county is Blanco, then create the population circle
                        if (county === "Blanco") {
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
                        }
                
                        // Add commute circles only for Blanco if the corresponding toggle is checked
                        if (county === "Blanco") {
                            const commuteCircleLayerGroup = createCommuteCircles(coordinates, countyCommuteData[county], county);
                            circleLayerGroup.addLayer(commuteCircleLayerGroup);
                            commuteCircleLayerGroup.addTo(map);
                        }
                    } else {
                        console.error(`No data found for county: ${county} in year: ${year}`);
                    }
                
                    // Clear the subdivisionLayerGroup
                    subdivisionLayerGroup.clearLayers();
                
                    for (const subdivision of subdivisions) {
                        // Check if the year of the subdivision is equal to the selected year
                        const subdivisionYear = getYearFromDate(subdivision.date);
                        if (
                            (subdivisionYear <= year && year <= 2020) ||
                            (subdivisionYear === year && year > 2020)
                        ) {
                            // Check if the propertyType is "Single Family", if so, use the noAddressIcon
                            const icon = subdivision.propertyType === "Single Family" ? noAddressIcon : myIcon;
                            const marker = L.marker(subdivision.coordinates, { icon: icon });
                            marker.bindPopup(`<b>Address:</b> ${subdivision.address}<br><b>Date:</b> ${subdivision.date}`);
                            subdivisionLayerGroup.addLayer(marker);
                        }
                    }                                      
                  }  // This closes the for-loop correctly
                            
                // Add the layer group to the map
                subdivisionLayerGroup.addTo(map);
            
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
                const permitsCell = countyRow.querySelector(`#${countyData.county.toLowerCase()}-permits`);  // Add this line
        
                populationCell.textContent = countyData.population.toFixed(0);
                growthCell.textContent = `${countyData.growth.toFixed(2)}%`;
                permitsCell.textContent = countyData.permits;  // Add this line
            }
        }
                    
        // Update the map and table when the slider value changes
        document.getElementById("slider").addEventListener("input", (event) => {
            if (!data) {
                return;
            }
        
            const year = 2020 + parseInt(event.target.value, 10); // adjusted year calculation
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
        const controlsContainer = document.getElementById('controls-container');
        
        toggleButton.addEventListener('click', () => {
            // Check the current display style of the controls
            if (controlsContainer.style.display !== 'none') {
                // If the controls are not currently hidden, hide them
                controlsContainer.style.display = 'none';
        
                // Update the button text
                toggleButton.textContent = 'Show Controls';
        
                // Add a class to the body
                document.body.classList.add('controls-hidden');
            } else {
                // If the controls are currently hidden, show them
                controlsContainer.style.display = 'block';
        
                // Update the button text
                toggleButton.textContent = 'Hide Controls';
        
                // Remove the class from the body
                document.body.classList.remove('controls-hidden');
            }
        });   
        
        // Add subdivision markers into the layer group
        for (const subdivision of subdivisions) {
            // Check if the propertyType is "Single Family", if so, use the noAddressIcon
            const icon = subdivision.propertyType === "Single Family" ? noAddressIcon : myIcon;
            const marker = L.marker(subdivision.coordinates, { icon: icon });
            marker.bindPopup(`<b>Address:</b> ${subdivision.address ? subdivision.address : 'No address provided'}<br><b>County:</b> ${subdivision.workerCount}`);
            subdivisionLayerGroup.addLayer(marker);
        }     

        // Add the layer group to the map
        subdivisionLayerGroup.addTo(map);
        
        // Load the data from the Flask API
        async function fetchData() {
            // Show the loading screen
            document.getElementById("loading-screen").style.display = "flex";
            const response = await fetch('/api/data');
            data = await response.json();
        }
        
        fetchData().then(() => {
            // Now data is loaded. Call updateMap() and updateTable() here if needed.
            const year = 2020 + parseInt(document.getElementById("slider").value, 10);  // get initial year
        
            updateMap(data, year);
            updateTable(data, year);
        
            loadGeoJSON(allCountiesGeoJSONUrl, "Travis", countyOverlayStyle());
            loadGeoJSON(allCountiesGeoJSONUrl, "Blanco", countyOverlayStyle());
            loadGeoJSON(allCountiesGeoJSONUrl, "Hays", countyOverlayStyle());
            loadGeoJSON(allCountiesGeoJSONUrl, "Comal", countyOverlayStyle());
        
            // Add the countyOverlayLayerGroup to the map
            countyOverlayLayerGroup.addTo(map);
        
            // Hide the loading screen
            document.getElementById("loading-screen").style.display = "none";
        });
        