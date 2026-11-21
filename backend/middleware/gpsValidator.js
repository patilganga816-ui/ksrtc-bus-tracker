// =====================================================================
// KSRTC Local Bus Tracking System — GPS Validator Middleware
// =====================================================================

// Hubballi–Dharwad Regional Boundaries
const MIN_LAT = parseFloat(process.env.MIN_LAT) || 15.1500;
const MAX_LAT = parseFloat(process.env.MAX_LAT) || 15.5500;
const MIN_LNG = parseFloat(process.env.MIN_LNG) || 74.9500;
const MAX_LNG = parseFloat(process.env.MAX_LNG) || 75.3000;
const MAX_SPEED_KMPH = parseFloat(process.env.MAX_SPEED_KMPH) || 90.0;

/**
 * Validates incoming GPS telemetry from driver smartphone
 */
function validateGPSCoordinates(req, res, next) {
    const { latitude, longitude, speed, accuracy, gps_timestamp, bus_id, trip_id } = req.body;

    // 1. Mandatory presence check
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Invalid GPS telemetry: latitude and longitude are required.'
        });
    }

    if (!bus_id || !trip_id) {
        return res.status(400).json({
            success: false,
            message: 'Invalid GPS telemetry: bus_id and trip_id are required.'
        });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 2. Numeric and finite check
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
        return res.status(400).json({
            success: false,
            message: 'GPS coordinates must be valid floating-point numbers.'
        });
    }

    // 3. Hubballi–Dharwad bounding box constraint
    if (lat < MIN_LAT || lat > MAX_LAT || lng < MIN_LNG || lng > MAX_LNG) {
        return res.status(422).json({
            success: false,
            message: `Coordinates (${lat}, ${lng}) fall outside the authorized Hubballi–Dharwad transit perimeter [${MIN_LAT} - ${MAX_LAT}, ${MIN_LNG} - ${MAX_LNG}].`
        });
    }

    // 4. Velocity check (prevent anomalous teleportation/spoofing)
    if (speed !== undefined && speed !== null) {
        const spd = parseFloat(speed);
        if (spd > MAX_SPEED_KMPH) {
            return res.status(422).json({
                success: false,
                message: `Recorded velocity of ${spd} km/h exceeds maximum permissible transit speed (${MAX_SPEED_KMPH} km/h).`
            });
        }
    }

    // Attach parsed coordinates to request
    req.gpsData = {
        bus_id,
        trip_id,
        latitude: lat,
        longitude: lng,
        speed: speed !== undefined && speed !== null ? Math.max(0, parseFloat(speed)) : 0.0,
        heading: req.body.heading ? parseFloat(req.body.heading) : 0.0,
        accuracy: accuracy ? parseFloat(accuracy) : null,
        gps_timestamp: gps_timestamp ? new Date(gps_timestamp).toISOString() : new Date().toISOString()
    };

    next();
}

module.exports = {
    validateGPSCoordinates,
    BOUNDS: { MIN_LAT, MAX_LAT, MIN_LNG, MAX_LNG }
};
