let map, userLocation;

function initMap() {
    // Initialize the map centered at a default location
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 }, // Default to India
        zoom: 13,
    });

    // Check if geolocation is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: 28.603160753503026,
                    lng: 77.04186141285817,
                };
                map.setCenter(userLocation);
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                });
            },
            () => {
                handleLocationError(true, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, pos) {
    console.error(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
}

// Event listener for the "Show Certified restroom" button
document.getElementById("find-Restrooms").addEventListener("click", () => {
    if (userLocation) {
        const request = {
            location: userLocation,
            radius: 1500, // Search within 1.5km
            type: "restrooms",
        };

        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach((place) => {
                    // Example criteria for certification: 4+ rating and 100+ reviews
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
                console.error("Nearby search failed: " + status);
            }
        });
    } else {
        alert("Unable to fetch user location. Please allow location access.");
    }
});