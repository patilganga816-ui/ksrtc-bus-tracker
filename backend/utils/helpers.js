/**
 * KSRTC Helper Utilities
 */

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Validate Indian phone number (10 digits)
function isValidPhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(String(phone).replace(/\s+/g, ''));
}

// Validate GPS Coordinates
function isValidCoordinates(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    return (
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

// Calculate Haversine Distance in Kilometers between two lat/lng points
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
}

/**
 * Server-Side Corridor Route Distance & ETA Estimation
 */
function calculateETAAndDistance(busLocation, boardingStop, routeStops = [], busType = 'City Ordinary') {
    if (!busLocation || !boardingStop || busLocation.latitude === undefined || boardingStop.latitude === undefined) {
        return {
            status: 'UNAVAILABLE',
            eta_minutes: null,
            distance_km: null,
            is_route_based: false,
            is_stale: false,
            passed_stop: false
        };
    }

    const busLat = parseFloat(busLocation.latitude);
    const busLng = parseFloat(busLocation.longitude);
    const stopLat = parseFloat(boardingStop.latitude);
    const stopLng = parseFloat(boardingStop.longitude);

    if (isNaN(busLat) || isNaN(busLng) || isNaN(stopLat) || isNaN(stopLng)) {
        return {
            status: 'UNAVAILABLE',
            eta_minutes: null,
            distance_km: null,
            is_route_based: false,
            is_stale: false,
            passed_stop: false
        };
    }

    // Stale GPS check (> 120 seconds)
    const timestamp = busLocation.gps_timestamp || busLocation.server_received_at;
    const fixTime = timestamp ? new Date(timestamp).getTime() : 0;
    const now = Date.now();
    const ageSeconds = fixTime > 0 ? Math.round((now - fixTime) / 1000) : 9999;
    const isStale = ageSeconds > 120;

    if (isStale) {
        const straightDist = calculateDistanceKm(busLat, busLng, stopLat, stopLng);
        return {
            status: 'STALE',
            eta_minutes: null,
            distance_km: straightDist,
            is_route_based: false,
            is_stale: true,
            age_seconds: ageSeconds,
            passed_stop: false
        };
    }

    const directDist = calculateDistanceKm(busLat, busLng, stopLat, stopLng);
    let remainingDistanceKm = directDist;
    let isRouteBased = false;
    let intermediateStops = 0;
    let hasPassed = false;

    if (Array.isArray(routeStops) && routeStops.length > 1) {
        const boardingIndex = routeStops.findIndex(item => {
            const s = item.stop || item.bus_stops || item;
            return s.id === boardingStop.id;
        });

        if (boardingIndex !== -1) {
            let closestIndex = 0;
            let minDist = Infinity;

            routeStops.forEach((item, idx) => {
                const s = item.stop || item.bus_stops || item;
                const d = calculateDistanceKm(busLat, busLng, parseFloat(s.latitude), parseFloat(s.longitude));
                if (d < minDist) {
                    minDist = d;
                    closestIndex = idx;
                }
            });

            if (closestIndex > boardingIndex) {
                hasPassed = true;
            } else if (closestIndex === boardingIndex) {
                if (boardingIndex < routeStops.length - 1) {
                    const nextS = routeStops[boardingIndex + 1].stop || routeStops[boardingIndex + 1].bus_stops || routeStops[boardingIndex + 1];
                    const distToNext = calculateDistanceKm(busLat, busLng, parseFloat(nextS.latitude), parseFloat(nextS.longitude));
                    const stopToNext = calculateDistanceKm(stopLat, stopLng, parseFloat(nextS.latitude), parseFloat(nextS.longitude));
                    if (distToNext < stopToNext && directDist > 0.15) {
                        hasPassed = true;
                    }
                }
            }

            if (hasPassed) {
                return {
                    status: 'PASSED',
                    eta_minutes: 0,
                    distance_km: 0,
                    is_route_based: true,
                    is_stale: false,
                    passed_stop: true
                };
            }

            isRouteBased = true;
            intermediateStops = Math.max(0, boardingIndex - closestIndex);
            let segmentDistance = 0;
            for (let i = closestIndex; i < boardingIndex; i++) {
                const s1 = routeStops[i].stop || routeStops[i].bus_stops || routeStops[i];
                const s2 = routeStops[i + 1].stop || routeStops[i + 1].bus_stops || routeStops[i + 1];
                segmentDistance += calculateDistanceKm(
                    parseFloat(s1.latitude), parseFloat(s1.longitude),
                    parseFloat(s2.latitude), parseFloat(s2.longitude)
                );
            }
            remainingDistanceKm = parseFloat((minDist + segmentDistance).toFixed(2));
        }
    }

    if (remainingDistanceKm <= 0.08) {
        return {
            status: 'ARRIVING_NOW',
            eta_minutes: 0,
            distance_km: remainingDistanceKm,
            is_route_based: isRouteBased,
            is_stale: false,
            passed_stop: false,
            stops_remaining: 0
        };
    }

    const baseSpeed = busType && busType.toLowerCase().includes('brts') ? 32.0 : 24.0;
    const currentSpeed = parseFloat(busLocation.speed) || 0;
    const effectiveSpeed = currentSpeed >= 6.0 ? (currentSpeed * 0.6) + (baseSpeed * 0.4) : baseSpeed;

    const travelMins = (remainingDistanceKm / effectiveSpeed) * 60;
    const dwellMins = intermediateStops * 0.75;
    const totalEstimatedMins = Math.max(1, Math.round(travelMins + dwellMins));

    return {
        status: 'OK',
        eta_minutes: totalEstimatedMins,
        distance_km: remainingDistanceKm,
        is_route_based: isRouteBased,
        is_stale: false,
        passed_stop: false,
        stops_remaining: intermediateStops,
        effective_speed: Math.round(effectiveSpeed)
    };
}

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidCoordinates,
    calculateDistanceKm,
    calculateETAAndDistance
};
