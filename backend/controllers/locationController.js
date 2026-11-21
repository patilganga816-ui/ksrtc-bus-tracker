// =====================================================================
// KSRTC Local Bus Tracking System — Location & Telemetry Controller
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');
const { HUBBALLI_DHARWAD_CORRIDOR_WAYPOINTS } = require('../utils/simulationData');

/**
 * 1. Record Real-Time GPS Telemetry
 * Endpoint: POST /api/locations/update
 * Protected by authenticateToken, requireDriver/admin, and validateGPSCoordinates
 */
async function recordLocation(req, res) {
    try {
        const { bus_id, trip_id, latitude, longitude, speed, heading, accuracy, gps_timestamp } = req.gpsData;

        // Verify that the trip is currently active
        const { data: trip, error: tError } = await supabaseAdmin
            .from('trips')
            .select('id, trip_status, driver_id, driver:drivers(profile_id)')
            .eq('id', trip_id)
            .single();

        if (tError || !trip) {
            return res.status(404).json({
                success: false,
                message: 'Referenced trip not found in system.'
            });
        }

        if (trip.trip_status !== 'in_progress') {
            return res.status(409).json({
                success: false,
                message: `Cannot record location: trip is ${trip.trip_status}. GPS telemetry rejected.`
            });
        }

        // Authorization verify: Operating driver or admin
        const isAuthorized = (req.user.role === 'admin') || (trip.driver && trip.driver.profile_id === req.user.id);
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Driver profile does not match this active trip.'
            });
        }

        // Insert coordinate fix into Supabase PostgreSQL
        // Supabase Realtime automatically broadcasts this row insertion via CDC
        const { data: locationRecord, error: insertError } = await supabaseAdmin
            .from('bus_locations')
            .insert([{
                bus_id,
                trip_id,
                latitude,
                longitude,
                speed,
                heading,
                accuracy,
                gps_timestamp,
                server_received_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        return res.status(201).json({
            success: true,
            message: 'GPS location recorded and broadcasted via Supabase Realtime.',
            location: locationRecord
        });
    } catch (err) {
        console.error('Record location error:', err);
        return res.status(500).json({ success: false, message: 'Failed to record GPS telemetry.' });
    }
}

/**
 * 2. Get Latest Bus Location
 * Endpoint: GET /api/locations/latest/:busId
 * Used for cold-start initial map hydration before receiving Realtime updates
 */
async function getLatestBusLocation(req, res) {
    try {
        const { busId } = req.params;

        const { data: locs, error } = await supabaseAdmin
            .from('bus_locations')
            .select(`
                id, bus_id, trip_id, latitude, longitude, speed, heading, accuracy,
                gps_timestamp, server_received_at,
                trip:trips(
                    id, trip_status, gps_mode, start_time,
                    route:routes(id, route_number, route_name, source, destination)
                )
            `)
            .eq('bus_id', busId)
            .order('server_received_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (!locs || locs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No location telemetry recorded for this bus yet.'
            });
        }

        const latest = locs[0];
        const serverTime = new Date().getTime();
        const recordedTime = new Date(latest.server_received_at).getTime();
        const ageSeconds = Math.round((serverTime - recordedTime) / 1000);

        return res.json({
            success: true,
            location: latest,
            age_seconds: ageSeconds,
            is_stale: ageSeconds > 120 // Marked stale if older than 2 minutes
        });
    } catch (err) {
        console.error('Get latest location error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve latest location.' });
    }
}

/**
 * 3. Get Trip Breadcrumb Locations Trail
 * Endpoint: GET /api/locations/trip/:tripId
 */
async function getTripLocations(req, res) {
    try {
        const { tripId } = req.params;

        const { data: points, error } = await supabaseAdmin
            .from('bus_locations')
            .select('latitude, longitude, speed, gps_timestamp')
            .eq('trip_id', tripId)
            .order('gps_timestamp', { ascending: true });

        if (error) throw error;

        return res.json({ success: true, count: points.length, points });
    } catch (err) {
        console.error('Get trip locations error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve trajectory.' });
    }
}

/**
 * 4. Step Simulated GPS Along Hubballi–Dharwad Route
 * Endpoint: POST /api/locations/simulate
 * Dedicated backup for academic classroom demonstration
 */
async function simulateGPSStep(req, res) {
    try {
        const { trip_id, bus_id, step_index = 0 } = req.body;

        if (!trip_id || !bus_id) {
            return res.status(400).json({
                success: false,
                message: 'trip_id and bus_id are required for GPS simulation.'
            });
        }

        const waypoints = HUBBALLI_DHARWAD_CORRIDOR_WAYPOINTS;
        const index = Math.abs(parseInt(step_index, 10)) % waypoints.length;
        const currentWaypoint = waypoints[index];

        const { data: loc, error } = await supabaseAdmin
            .from('bus_locations')
            .insert([{
                bus_id,
                trip_id,
                latitude: currentWaypoint.latitude,
                longitude: currentWaypoint.longitude,
                speed: 38.5,
                heading: 320.0,
                accuracy: 5.0,
                gps_timestamp: new Date().toISOString(),
                server_received_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            simulated: true,
            mode: 'SIMULATED GPS',
            current_stop: currentWaypoint.stopName,
            step_index: index,
            next_step_index: (index + 1) % waypoints.length,
            total_waypoints: waypoints.length,
            location: loc
        });
    } catch (err) {
        console.error('Simulate GPS error:', err);
        return res.status(500).json({ success: false, message: 'Simulation step failed.' });
    }
}

module.exports = {
    recordLocation,
    getLatestBusLocation,
    getTripLocations,
    simulateGPSStep
};
