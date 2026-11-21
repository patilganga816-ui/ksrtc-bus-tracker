// =====================================================================
// KSRTC Local Bus Tracking System — Distance & Estimated Time of Arrival (ETA) Engine
// Hubballi–Dharwad Transit Corridor Specialist
// =====================================================================

const ETACalculator = {
    // Standard Corridor Operational Parameters
    CORRIDOR_CONFIG: {
        BRTS_AVG_SPEED_KMPH: 32.0,      // Chigari BRTS dedicated transit lane average
        CITY_AVG_SPEED_KMPH: 24.0,      // City Ordinary / Suvarna mixed traffic average
        STOP_DWELL_TIME_MINS: 0.75,     // ~45 seconds dwell time per scheduled stop
        MIN_MOVING_SPEED_KMPH: 6.0,     // Threshold to consider bus moving vs stopped at signal/depot
        STALE_GPS_THRESHOLD_SECS: 120   // GPS considered stale if older than 2 minutes
    },

    /**
     * Calculates the great-circle Haversine distance between two coordinates in Kilometers
     */
    haversineDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(3));
    },

    /**
     * Comprehensive Distance & ETA Computation
     * 
     * @param {Object} busLocation - Latest telemetry { latitude, longitude, speed, gps_timestamp, server_received_at }
     * @param {Object} boardingStop - Passenger's chosen stop { id, stop_name, latitude, longitude }
     * @param {Array} routeStops - Ordered route stop items [{ stop_sequence, stop: { id, stop_name, latitude, longitude } }]
     * @param {string} busType - Type of bus vehicle ('Chigari BRTS', 'City Ordinary', etc.)
     * @returns {Object} Computation result
     */
    calculate(busLocation, boardingStop, routeStops = [], busType = 'City Ordinary') {
        // 1. Missing telemetry or missing boarding stop
        if (!busLocation || !boardingStop || busLocation.latitude === undefined || boardingStop.latitude === undefined) {
            return {
                status: 'UNAVAILABLE',
                etaMinutes: null,
                distanceKm: null,
                isRouteBased: false,
                isStale: false,
                passedStop: false,
                messageKey: 'etaUnavailable',
                distanceMessageKey: 'distUnavailable'
            };
        }

        const busLat = parseFloat(busLocation.latitude);
        const busLng = parseFloat(busLocation.longitude);
        const stopLat = parseFloat(boardingStop.latitude);
        const stopLng = parseFloat(boardingStop.longitude);

        if (isNaN(busLat) || isNaN(busLng) || isNaN(stopLat) || isNaN(stopLng)) {
            return {
                status: 'UNAVAILABLE',
                etaMinutes: null,
                distanceKm: null,
                isRouteBased: false,
                isStale: false,
                passedStop: false,
                messageKey: 'etaUnavailable',
                distanceMessageKey: 'distUnavailable'
            };
        }

        // 2. Check GPS Freshness (Age in seconds)
        const timestamp = busLocation.gps_timestamp || busLocation.server_received_at;
        const fixTime = timestamp ? new Date(timestamp).getTime() : 0;
        const now = Date.now();
        const ageSeconds = fixTime > 0 ? Math.round((now - fixTime) / 1000) : 9999;
        const isStale = ageSeconds > this.CORRIDOR_CONFIG.STALE_GPS_THRESHOLD_SECS;

        // If GPS is completely outdated (> 2 minutes), do NOT calculate ETA as though current
        if (isStale) {
            const directDist = this.haversineDistanceKm(busLat, busLng, stopLat, stopLng);
            return {
                status: 'STALE',
                etaMinutes: null,
                distanceKm: directDist,
                isRouteBased: false,
                isStale: true,
                ageSeconds: ageSeconds,
                passedStop: false,
                messageKey: 'etaDelayed',
                distanceMessageKey: 'distUnavailable'
            };
        }

        // Direct straight-line distance to boarding stop
        const directDistToBoarding = this.haversineDistanceKm(busLat, busLng, stopLat, stopLng);

        // 3. Evaluate position along Ordered Route Stops
        let isRouteBased = false;
        let remainingDistanceKm = directDistToBoarding;
        let intermediateStopsCount = 0;
        let hasPassed = false;

        if (Array.isArray(routeStops) && routeStops.length > 1) {
            // Locate the index of the passenger's selected boarding stop
            const boardingIndex = routeStops.findIndex(item => {
                const s = item.stop || item;
                return s.id === boardingStop.id || (s.stop_name && boardingStop.stop_name && s.stop_name.toLowerCase() === boardingStop.stop_name.toLowerCase());
            });

            if (boardingIndex !== -1) {
                // Find closest route stop to the current bus coordinates
                let closestIndex = 0;
                let minStopDistance = Infinity;

                routeStops.forEach((item, idx) => {
                    const s = item.stop || item;
                    const d = this.haversineDistanceKm(busLat, busLng, parseFloat(s.latitude), parseFloat(s.longitude));
                    if (d < minStopDistance) {
                        minStopDistance = d;
                        closestIndex = idx;
                    }
                });

                // Detect if the bus has already progressed past the boarding stop
                // Bus is past boarding stop if its closest stop index is greater than boarding index,
                // and it is moving further down the corridor.
                if (closestIndex > boardingIndex) {
                    hasPassed = true;
                } else if (closestIndex === boardingIndex) {
                    // Bus is in the immediate vicinity of the boarding stop
                    // If within 80 meters, it's at the stop. If distance is growing towards next stop, check next
                    if (boardingIndex < routeStops.length - 1) {
                        const nextStop = routeStops[boardingIndex + 1].stop || routeStops[boardingIndex + 1];
                        const distToNext = this.haversineDistanceKm(busLat, busLng, parseFloat(nextStop.latitude), parseFloat(nextStop.longitude));
                        const stopToNext = this.haversineDistanceKm(stopLat, stopLng, parseFloat(nextStop.latitude), parseFloat(nextStop.longitude));
                        if (distToNext < stopToNext && directDistToBoarding > 0.15) {
                            // Bus has moved past the stop towards next stop
                            hasPassed = true;
                        }
                    }
                }

                if (hasPassed) {
                    return {
                        status: 'PASSED',
                        etaMinutes: 0,
                        distanceKm: 0,
                        isRouteBased: true,
                        isStale: false,
                        passedStop: true,
                        messageKey: 'stopPassed',
                        distanceMessageKey: 'stopPassed'
                    };
                }

                // If not passed: Calculate Route-Based Distance along sequenced transit stops
                isRouteBased = true;
                intermediateStopsCount = Math.max(0, boardingIndex - closestIndex);

                // Distance from bus to closest stop + distance along stops from closest to boarding
                let segmentDistance = 0;
                for (let i = closestIndex; i < boardingIndex; i++) {
                    const s1 = routeStops[i].stop || routeStops[i];
                    const s2 = routeStops[i + 1].stop || routeStops[i + 1];
                    segmentDistance += this.haversineDistanceKm(
                        parseFloat(s1.latitude), parseFloat(s1.longitude),
                        parseFloat(s2.latitude), parseFloat(s2.longitude)
                    );
                }

                // Total route distance: distance to nearest stop + cumulative route legs
                remainingDistanceKm = parseFloat((minStopDistance + segmentDistance).toFixed(2));
            }
        }

        // 4. Calculate Sensible, Explainable ETA
        // If bus is within 80 meters of the stop (< 0.08 km), arriving now!
        if (remainingDistanceKm <= 0.08) {
            return {
                status: 'ARRIVING_NOW',
                etaMinutes: 0,
                distanceKm: remainingDistanceKm,
                isRouteBased: isRouteBased,
                isStale: false,
                passedStop: false,
                messageKey: 'etaArrivingNow',
                stopsRemaining: 0
            };
        }

        // Determine effective transit operating velocity
        const baseSpeed = busType && busType.toLowerCase().includes('brts') 
            ? this.CORRIDOR_CONFIG.BRTS_AVG_SPEED_KMPH 
            : this.CORRIDOR_CONFIG.CITY_AVG_SPEED_KMPH;

        const currentSpeed = parseFloat(busLocation.speed) || 0;
        let effectiveSpeed = baseSpeed;

        if (currentSpeed >= this.CORRIDOR_CONFIG.MIN_MOVING_SPEED_KMPH) {
            // Blend actual GPS telemetry speed with historical corridor baseline
            effectiveSpeed = (currentSpeed * 0.6) + (baseSpeed * 0.4);
        } else {
            // Bus is temporarily stopped at traffic light, depot, or bus stop.
            // Using 0 km/h would cause infinite minutes; standard corridor speed is used.
            effectiveSpeed = baseSpeed;
        }

        // Travel time in minutes: (Distance / Speed) * 60 + (Dwell time per intermediate stop)
        const travelMins = (remainingDistanceKm / effectiveSpeed) * 60;
        const dwellMins = intermediateStopsCount * this.CORRIDOR_CONFIG.STOP_DWELL_TIME_MINS;
        const totalEstimatedMins = Math.max(1, Math.round(travelMins + dwellMins));

        return {
            status: 'OK',
            etaMinutes: totalEstimatedMins,
            distanceKm: remainingDistanceKm,
            isRouteBased: isRouteBased,
            isStale: false,
            passedStop: false,
            messageKey: 'etaMinutesApprox',
            stopsRemaining: intermediateStopsCount,
            effectiveSpeed: Math.round(effectiveSpeed)
        };
    },

    /**
     * Formats distance with localized units (e.g. 2.4 km or 650 m)
     */
    formatDistance(calcResult) {
        const tr = typeof i18n !== 'undefined' ? i18n : (typeof window !== 'undefined' && window.i18n ? window.i18n : (typeof global !== 'undefined' && global.i18n ? global.i18n : null));
        const t = (k, p) => tr ? tr.t(k, p) : (k === 'distM' ? `${p.dist} m` : (k === 'distKm' ? `${p.dist} km` : k));

        if (!calcResult) return t('distUnavailable');
        if (calcResult.passedStop) return t('stopPassed');
        if (calcResult.status === 'UNAVAILABLE' || calcResult.distanceKm === null) {
            return t('distUnavailable');
        }

        const distKm = calcResult.distanceKm;
        if (distKm < 1.0) {
            const meters = Math.max(10, Math.round(distKm * 1000));
            return t('distM', { dist: meters });
        } else {
            return t('distKm', { dist: distKm.toFixed(1) });
        }
    },

    /**
     * Formats ETA with localized text
     */
    formatETA(calcResult) {
        const tr = typeof i18n !== 'undefined' ? i18n : (typeof window !== 'undefined' && window.i18n ? window.i18n : (typeof global !== 'undefined' && global.i18n ? global.i18n : null));
        const t = (k, p) => tr ? tr.t(k, p) : (k === 'etaMinutesApprox' ? `Approx. ${p.min} mins` : (k === 'etaArrivingNow' ? 'Arriving now (< 1 min)' : (k === 'etaDelayed' ? 'GPS update delayed' : (k === 'stopPassed' ? 'Boarding stop already passed' : k))));

        if (!calcResult) return t('etaUnavailable');
        if (calcResult.passedStop) return t('stopPassed');
        if (calcResult.isStale) return t('etaDelayed');
        if (calcResult.status === 'UNAVAILABLE' || calcResult.etaMinutes === null) {
            return t('etaUnavailable');
        }
        if (calcResult.status === 'ARRIVING_NOW' || calcResult.etaMinutes <= 1) {
            return t('etaArrivingNow');
        }

        return t('etaMinutesApprox', { min: calcResult.etaMinutes });
    }
};

if (typeof window !== 'undefined') {
    window.ETACalculator = ETACalculator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ETACalculator };
}
