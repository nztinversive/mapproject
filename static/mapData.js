// mapData.js

export const mapCenter = [30.2000, -98.1000];
export const baseLayerAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const baseLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const subdivisions = [
    { coordinates: [30.085725, -97.828350], address: "123 Main St, Buda", workerCount: 250 },
    { coordinates: [29.987318, -97.871718], address: "456 Maple Ave, Kyle", workerCount: 180 },
    { coordinates: [29.881643, -97.929693], address: "789 Oak St, San Marcos", workerCount: 120 },
    { coordinates: [30.186867, -98.086105], address: "321 Elm St, Dripping Springs", workerCount: 70 },
    { coordinates: [29.998354, -98.106666], address: "555 Cherry Ln, Wimberley", workerCount: 100 },
    { coordinates: [30.099068, -98.001557], address: "777 Pine St, Driftwood", workerCount: 30 },
    { coordinates: [29.991294, -97.551919], address: "999 Cedar Ave, Kyle", workerCount: 90 },
    { coordinates: [29.875378, -97.938527], address: "111 Magnolia Blvd, San Marcos", workerCount: 150 },
    { coordinates: [30.085130, -97.853381], address: "222 Rosewood Dr, Buda", workerCount: 50 },
    { coordinates: [29.986999, -98.133462], address: "333 Cedar Creek Rd, Wimberley", workerCount: 200 },
    { coordinates: [30.190007, -98.060989], address: "444 Oak Grove Ln, Dripping Springs", workerCount: 60 },
    { coordinates: [29.876239, -97.938893], address: "666 Walnut St, San Marcos", workerCount: 80 },
    { coordinates: [29.992160, -97.874283], address: "888 Maple Grove Blvd, Kyle", workerCount: 70 },
    { coordinates: [30.067763, -98.014255], address: "2222 Cypress Creek Rd, Driftwood", workerCount: 100 },
    { coordinates: [30.073711, -97.831584], address: "3333 Cedar Valley Rd, Buda", workerCount: 50 },
    { coordinates: [29.892332, -97.969766], address: "4444 Magnolia Dr, San Marcos", workerCount: 120 },
    { coordinates: [30.211545, -98.130013], address: "5555 Oak Hill Rd, Dripping Springs", workerCount: 60 },
    { coordinates: [29.998174, -97.535481], address: "6666 Piney Woods Dr, Kyle", workerCount: 300 },
    { coordinates: [30.004038, -98.120680], address: "7777 Rolling Hills Dr, Wimberley", workerCount: 80 },
    { coordinates: [30.094244, -98.042188], address: "8888 Cedar Ridge Rd, Driftwood", workerCount: 150 },
  ];

export const countyCoordinates = {
    "Travis": [30.2672, -97.7431],
    "Blanco": [30.061551, -98.334385],
    "Hays": [30.0617, -97.8722],
    "Comal": [29.7971, -98.2691],
};    

export const countyCommuteData = {
                "Blanco": [
                  // Blanco County
                    { time: 15, percentage: 0.33, speed: 60 },
                    { time: 30, percentage: 0.221, speed: 60 },
                    { time: 45, percentage: 0.176, speed: 60 },
                    { time: 60, percentage: 0.132, speed: 60 },
                    { time: 75, percentage: 0.141, speed: 60 }
                ],
                "Travis": [
                    // Add data for Travis County
                    { time: 15, percentage: 0.25, speed: 60 },
                    { time: 30, percentage: 0.3, speed: 60 },
                    { time: 45, percentage: 0.2, speed: 60 },
                    { time: 60, percentage: 0.15, speed: 60 },
                    { time: 75, percentage: 0.1, speed: 60 }
                ],
                "Hays": [
                    // Add data for Hays County
                    { time: 15, percentage: 0.3, speed: 60 },
                    { time: 30, percentage: 0.25, speed: 60 },
                    { time: 45, percentage: 0.2, speed: 60 },
                    { time: 60, percentage: 0.15, speed: 60 },
                    { time: 75, percentage: 0.1, speed: 60 }
                ],
                "Comal": [
                    // Add data for Comal County
                    { time: 15, percentage: 0.4, speed: 60 },
                    { time: 30, percentage: 0.3, speed: 60 },
                    { time: 45, percentage: 0.2, speed: 60 },
                    { time: 60, percentage: 0.1, speed: 60 },
                    { time: 75, percentage: 0.0, speed: 60 }
                ],
            };
 

export const allCountiesGeoJSONUrl = "https://raw.githubusercontent.com/nztinversive/mapproject/main/Texas%20Counties%20Map.geojson";
