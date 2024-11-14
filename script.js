let map;
let marker;

function initMap() {
    // Initialize the map at a default location (India)
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
    });

    // Initialize the search box for user input
    const input = document.getElementById("searchBox");
    const searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    // Listen for user selection in the search box
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        // Clear any previous markers
        if (marker) {
            marker.setMap(null);
        }

        // Get the first place from the list of places
        const place = places[0];

        // Create a marker at the selected location
        marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name,
        });

        // Center the map on the selected location
        map.setCenter(place.geometry.location);
        map.setZoom(15);
    });
}

// Event listener for "Show Certified Restrooms" button
document.getElementById("find-Restrooms").addEventListener("click", () => {
    if (marker && marker.getPosition()) {
        const request = {
            location: marker.getPosition(),
            radius: 1500, // Search within 1.5km
            type: "restroom",
        };

        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach((place) => {
                    // Show only certified restrooms based on rating and reviews
                    if (place.rating >= 4.0 && place.user_ratings_total >= 100) {
                        new google.maps.Marker({
                            position: place.geometry.location,
                            map: map,
                            label: {
                                text: "P",
                                color: "green",
                                fontWeight: "bold",
                            },
                            title: place.name,
                        });
                    }
                });
            } else {
                console.error("Nearby search failed:", status);
            }
        });
    } else {
        alert("Please enter and select a location.");
    }
});
