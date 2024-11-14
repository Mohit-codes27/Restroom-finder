let map, marker, directionsService, directionsRenderer;
let searchedLocation; // Holds the user's searched location

function initMap() {
    // Initialize the map at a default location
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
    });

    // Initialize directions services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Initialize search box
    const input = document.getElementById("searchBox");
    const searchBox = new google.maps.places.SearchBox(input);

    // Bias search results towards map's viewport
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    // Handle search box selection
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length === 0) return;

        // Clear any previous marker and directions
        if (marker) marker.setMap(null);
        directionsRenderer.set('directions', null);

        const place = places[0];
        searchedLocation = place.geometry.location;

        // Place a marker at the searched location
        marker = new google.maps.Marker({
            map: map,
            position: searchedLocation,
            title: place.name,
        });

        // Center map at the searched location
        map.setCenter(searchedLocation);
        map.setZoom(15);
    });
}

// "Show Certified Restrooms" button event listener
document.getElementById("find-Restrooms").addEventListener("click", () => {
    if (!searchedLocation) {
        alert("Please enter and select a location.");
        return;
    }

    const request = {
        location: searchedLocation,
        radius: 1500,
        type: "restroom",
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach((place) => {
                if (place.rating >= 4.0 && place.user_ratings_total >= 100) {
                    const restroomMarker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        label: {
                            text: "P",
                            color: "green",
                            fontWeight: "bold",
                        },
                        title: place.name,
                    });

                    // Add click event to restroom marker
                    restroomMarker.addListener("click", () => {
                        showDistanceAndDirections(place.geometry.location, place.name);
                    });
                }
            });
        } else {
            console.error("Nearby search failed:", status);
        }
    });
});

// Show distance and directions in an info window
function showDistanceAndDirections(destination, destinationName) {
    // Calculate distance using Distance Matrix API
    const distanceService = new google.maps.DistanceMatrixService();
    distanceService.getDistanceMatrix(
        {
            origins: [searchedLocation],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === "OK") {
                const distance = response.rows[0].elements[0].distance.text;
                const duration = response.rows[0].elements[0].duration.text;

                // Create info window content
                const contentString = `
                    <div class="show-direction">
                        <h3>${destinationName}</h3>
                        <p>Distance: ${distance}</p>
                        <p>Duration: ${duration}</p>
                        <button onclick="displayRoute('${destination.lat()}', '${destination.lng()}')">Show Directions</button>
                    </div>
                `;

                const infoWindow = new google.maps.InfoWindow({
                    content: contentString,
                    position: destination,
                });

                infoWindow.open(map);
            } else {
                console.error("Distance Matrix request failed:", status);
            }
        }
    );
}

// Display route on map using Directions API
function displayRoute(destLat, destLng) {
    directionsRenderer.set('directions', null); // Clear previous route

    const request = {
        origin: searchedLocation,
        destination: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(result);
        } else {
            console.error("Directions request failed:", status);
        }
    });
}
