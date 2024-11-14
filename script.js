let map, userLocation;

function initMap() {
    // Initialize the map with a default location (India's coordinates)
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 13,
    });

    getAccurateLocation();
}

// Function to get an accurate location with retries if necessary
function getAccurateLocation(retryCount = 0) {
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (position.coords.accuracy <= 50 || retryCount >= 3) {
                    // If accuracy is good or retry limit reached, set the location
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

                    // Store in localStorage for potential fallback
                    localStorage.setItem("lastKnownLocation", JSON.stringify(userLocation));
                } else {
                    // Retry if accuracy isn't good enough
                    getAccurateLocation(retryCount + 1);
                }
            },
            (error) => {
                handleLocationError(error, retryCount);
            },
            options
        );
    } else {
        alert("Geolocation is not supported by this browser.");
        useFallbackLocation();
    }
}

// Error handler to deal with geolocation issues
function handleLocationError(error, retryCount) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("Permission denied. Please allow location access.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable. Retrying...");
            retryCount < 3 ? getAccurateLocation(retryCount + 1) : useFallbackLocation();
            break;
        case error.TIMEOUT:
            alert("Location request timed out. Retrying...");
            retryCount < 3 ? getAccurateLocation(retryCount + 1) : useFallbackLocation();
            break;
        default:
            alert("An unknown error occurred.");
            useFallbackLocation();
            break;
    }
}

// Fallback to last known location or default if geolocation fails
function useFallbackLocation() {
    const savedLocation = localStorage.getItem("lastKnownLocation");
    if (savedLocation) {
        userLocation = JSON.parse(savedLocation);
    } else {
        userLocation = { lat: 20.5937, lng: 78.9629 }; // Default location if none saved
    }
    map.setCenter(userLocation);
    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Fallback Location",
    });
}

// Event listener for the "Show Certified Restrooms" button
document.getElementById("find-Restrooms").addEventListener("click", () => {
    if (userLocation) {
        const request = {
            location: userLocation,
            radius: 1500,
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
