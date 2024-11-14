let map, userLocation;
const retryLimit = 3; // Maximum retry limit for location accuracy

function initMap() {
    // Initialize the map with a default location
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 }, // Default location (India)
        zoom: 13,
    });

    // Attempt to fetch the user's accurate location
    fetchLocationWithRetry();
}

// Function to attempt fetching location with retries if necessary
function fetchLocationWithRetry(retryCount = 0) {
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 20000,  // Extended timeout for better accuracy
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleSuccessfulLocation(position, retryCount);
            },
            (error) => {
                handleLocationError(error, retryCount);
            },
            options
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        useFallbackLocation();
    }
}

// Handle successful location retrieval
function handleSuccessfulLocation(position, retryCount) {
    const { latitude, longitude, accuracy } = position.coords;

    // Display marker for any initial location
    userLocation = { lat: latitude, lng: longitude };
    if (retryCount === 0 || accuracy <= 50) {
        // Set center and add marker if location is accurate enough or on the first try
        map.setCenter(userLocation);
        new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
        });

        // Save the location for future fallback
        localStorage.setItem("lastKnownLocation", JSON.stringify(userLocation));
    } else if (retryCount < retryLimit) {
        // Retry if accuracy is still high
        fetchLocationWithRetry(retryCount + 1);
    }
}

// Handle errors and retry if possible
function handleLocationError(error, retryCount) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("Location permission denied. Please enable location access.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location unavailable. Retrying...");
            if (retryCount < retryLimit) fetchLocationWithRetry(retryCount + 1);
            break;
        case error.TIMEOUT:
            alert("Location request timed out. Retrying...");
            if (retryCount < retryLimit) fetchLocationWithRetry(retryCount + 1);
            break;
        default:
            alert("An unknown error occurred.");
            useFallbackLocation();
    }
}

// Fallback location if geolocation is not available or accurate
function useFallbackLocation() {
    const savedLocation = localStorage.getItem("lastKnownLocation");
    if (savedLocation) {
        userLocation = JSON.parse(savedLocation);
    } else {
        userLocation = { lat: 20.5937, lng: 78.9629 }; // Default fallback location
    }

    map.setCenter(userLocation);
    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Fallback Location",
    });
}

// Add event listener to retry fetching location manually if needed
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
