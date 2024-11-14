let map, userLocation;

function initMap() {
    // Initialize the map centered at a default location
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 }, // Default to India
        zoom: 13,
    });

    // Check if geolocation is available and get accurate user location
    if (navigator.geolocation) {
        const geolocationOptions = {
            enableHighAccuracy: true, // Request a more accurate location
            timeout: 10000,           // Timeout after 10 seconds if no location is found
            maximumAge: 0             // Don't use cached location data
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                });
            },
            (error) => {
                handleLocationError(true, map.getCenter(), error);
            },
            geolocationOptions
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, pos, error) {
    if (error && error.code === error.PERMISSION_DENIED) {
        alert("Location permission denied. Please allow access to location services.");
    } else if (error && error.code === error.TIMEOUT) {
        alert("Request for location timed out. Please try again.");
    } else {
        alert(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
    }
    map.setCenter(pos);
}

// Event listener for the "Show Certified Restrooms" button
document.getElementById("find-Restrooms").addEventListener("click", () => {
    if (userLocation) {
        const request = {
            location: userLocation,
            radius: 1500, // Search within 1.5km
            type: "restroom",
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
