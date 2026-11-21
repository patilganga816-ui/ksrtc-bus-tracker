// =====================================================================
// KSRTC Local Bus Tracking System — Bus Controller (Supabase)
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');
const { calculateETAAndDistance } = require('../utils/helpers');

/**
 * 1. Get all buses with their route and latest GPS location
 */
async function getAllBuses(req, res) {
    try {
        const { data: buses, error } = await supabaseAdmin
            .from('buses')
            .select(`
                id, bus_number, bus_type, status, created_at,
                route:routes(id, route_number, route_name, source, destination)
            `)
            .order('bus_number', { ascending: true });

        if (error) {
            console.error('Error fetching buses:', error);
            return res.status(500).json({ success: false, message: 'Failed to retrieve buses.' });
        }

        // Fetch latest location for each bus
        const enrichedBuses = await Promise.all(buses.map(async (bus) => {
            const { data: locs } = await supabaseAdmin
                .from('bus_locations')
                .select('latitude, longitude, speed, heading, accuracy, gps_timestamp, server_received_at')
                .eq('bus_id', bus.id)
                .order('server_received_at', { ascending: false })
                .limit(1);

            const latestLoc = locs && locs.length > 0 ? locs[0] : null;

            // Check if there is an active trip for this bus
            const { data: activeTrips } = await supabaseAdmin
                .from('trips')
                .select('id, trip_status, gps_mode, start_time')
                .eq('bus_id', bus.id)
                .eq('trip_status', 'in_progress')
                .limit(1);

            return {
                ...bus,
                active_trip: activeTrips && activeTrips.length > 0 ? activeTrips[0] : null,
                latest_location: latestLoc
            };
        }));

        return res.json({
            success: true,
            count: enrichedBuses.length,
            buses: enrichedBuses
        });
    } catch (err) {
        console.error('Bus fetch error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/**
 * 2. Get bus details by ID
 */
async function getBusById(req, res) {
    try {
        const { id } = req.params;

        const { data: bus, error } = await supabaseAdmin
            .from('buses')
            .select(`
                id, bus_number, bus_type, status, created_at,
                route:routes(id, route_number, route_name, source, destination, city_coverage)
            `)
            .eq('id', id)
            .single();

        if (error || !bus) {
            return res.status(404).json({ success: false, message: 'Bus not found.' });
        }

        // Fetch latest location
        const { data: locs } = await supabaseAdmin
            .from('bus_locations')
            .select('*')
            .eq('bus_id', bus.id)
            .order('server_received_at', { ascending: false })
            .limit(1);

        // Fetch active trip
        const { data: trips } = await supabaseAdmin
            .from('trips')
            .select(`
                id, trip_status, gps_mode, start_time,
                driver:drivers(id, license_number, employee_id, profile:profiles(full_name, mobile_number)),
                starting_stop:bus_stops!trips_starting_stop_id_fkey(id, stop_name, city),
                destination_stop:bus_stops!trips_destination_stop_id_fkey(id, stop_name, city)
            `)
            .eq('bus_id', bus.id)
            .eq('trip_status', 'in_progress')
            .limit(1);

        return res.json({
            success: true,
            bus: {
                ...bus,
                latest_location: locs && locs.length > 0 ? locs[0] : null,
                active_trip: trips && trips.length > 0 ? trips[0] : null
            }
        });
    } catch (err) {
        console.error('Get bus error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve bus details.' });
    }
}

/**
 * 3. Search buses by keyword (bus number, route number, or terminal stop)
 */
async function searchBuses(req, res) {
    try {
        const { query } = req.query;
        const q = (query || '').trim().toLowerCase();

        let dbQuery = supabaseAdmin
            .from('buses')
            .select(`
                id, bus_number, bus_type, status,
                route:routes(id, route_number, route_name, source, destination)
            `);

        if (q) {
            dbQuery = dbQuery.or(`bus_number.ilike.%${q}%`);
        }

        const { data: buses, error } = await dbQuery;

        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ success: false, message: 'Failed to execute search.' });
        }

        // Filter also by route fields if query matches
        const filtered = buses.filter(b => {
            if (!q) return true;
            const bNum = (b.bus_number || '').toLowerCase();
            const rNum = (b.route && b.route.route_number || '').toLowerCase();
            const rName = (b.route && b.route.route_name || '').toLowerCase();
            const src = (b.route && b.route.source || '').toLowerCase();
            const dst = (b.route && b.route.destination || '').toLowerCase();
            return bNum.includes(q) || rNum.includes(q) || rName.includes(q) || src.includes(q) || dst.includes(q);
        });

        return res.json({ success: true, count: filtered.length, buses: filtered });
    } catch (err) {
        console.error('Bus search error:', err);
        return res.status(500).json({ success: false, message: 'Search query failed.' });
    }
}

/**
 * 4. Find buses serving a selected Boarding Stop and Destination Stop
 * Crucial core passenger search functionality
 */
async function findBusesBetweenStops(req, res) {
    try {
        const { boarding_stop_id, destination_stop_id } = req.query;

        if (!boarding_stop_id || !destination_stop_id) {
            return res.status(400).json({
                success: false,
                message: 'Both boarding_stop_id and destination_stop_id are required parameters.'
            });
        }

        if (boarding_stop_id === destination_stop_id) {
            return res.status(400).json({
                success: false,
                message: 'Boarding stop and destination stop cannot be identical.'
            });
        }

        // Find routes that contain the boarding stop
        const { data: boardingStops, error: err1 } = await supabaseAdmin
            .from('route_stops')
            .select('route_id, stop_sequence, direction')
            .eq('stop_id', boarding_stop_id);

        if (err1) throw err1;

        // Find routes that contain the destination stop
        const { data: destinationStops, error: err2 } = await supabaseAdmin
            .from('route_stops')
            .select('route_id, stop_sequence, direction')
            .eq('stop_id', destination_stop_id);

        if (err2) throw err2;

        // Match routes where boarding stop occurs BEFORE destination stop in the same direction
        const matchingRouteIds = [];
        for (const b of boardingStops) {
            for (const d of destinationStops) {
                if (b.route_id === d.route_id && b.direction === d.direction) {
                    if (b.stop_sequence < d.stop_sequence) {
                        matchingRouteIds.push(b.route_id);
                    }
                }
            }
        }

        if (matchingRouteIds.length === 0) {
            return res.json({
                success: true,
                count: 0,
                message: 'No configured direct routes connect the selected stops in this direction.',
                buses: []
            });
        }

        // Fetch all buses assigned to these matching routes
        const { data: buses, error: busError } = await supabaseAdmin
            .from('buses')
            .select(`
                id, bus_number, bus_type, status,
                route:routes(id, route_number, route_name, source, destination)
            `)
            .in('route_id', matchingRouteIds)
            .neq('status', 'decommissioned');

        if (busError) throw busError;

        // Fetch boarding stop details for ETA & distance computation
        const { data: boardingStopRecord } = await supabaseAdmin
            .from('bus_stops')
            .select('*')
            .eq('id', boarding_stop_id)
            .single();

        // Enrich with active trip, GPS status, ETA, and remaining distance
        const results = await Promise.all(buses.map(async (bus) => {
            const { data: trips } = await supabaseAdmin
                .from('trips')
                .select('id, trip_status, gps_mode, start_time')
                .eq('bus_id', bus.id)
                .eq('trip_status', 'in_progress')
                .limit(1);

            const activeTrip = trips && trips.length > 0 ? trips[0] : null;

            const { data: locs } = await supabaseAdmin
                .from('bus_locations')
                .select('latitude, longitude, speed, heading, accuracy, gps_timestamp, server_received_at')
                .eq('bus_id', bus.id)
                .order('server_received_at', { ascending: false })
                .limit(1);

            const latestLoc = locs && locs.length > 0 ? locs[0] : null;

            // Fetch route stops for distance calculation along route
            let routeStops = [];
            if (bus.route_id) {
                const { data: rStops } = await supabaseAdmin
                    .from('route_stops')
                    .select('stop_sequence, direction, bus_stops(*)')
                    .eq('route_id', bus.route_id)
                    .order('stop_sequence', { ascending: true });
                routeStops = rStops || [];
            }

            const etaInfo = calculateETAAndDistance(latestLoc, boardingStopRecord, routeStops, bus.bus_type);

            return {
                ...bus,
                is_active_trip: !!activeTrip,
                active_trip: activeTrip,
                latest_location: latestLoc,
                gps_active: !!(activeTrip && latestLoc),
                eta_info: etaInfo
            };
        }));

        return res.json({
            success: true,
            count: results.length,
            buses: results
        });
    } catch (err) {
        console.error('Find buses between stops error:', err);
        return res.status(500).json({ success: false, message: 'Failed to search connecting buses.' });
    }
}

/**
 * 5. Add Bus (Admin Only)
 */
async function addBus(req, res) {
    try {
        const { bus_number, bus_type, route_id, status } = req.body;

        if (!bus_number || !bus_type) {
            return res.status(400).json({
                success: false,
                message: 'Bus Number and Bus Type are required.'
            });
        }

        const cleanNumber = bus_number.trim().toUpperCase();

        const { data, error } = await supabaseAdmin
            .from('buses')
            .insert([{
                bus_number: cleanNumber,
                bus_type,
                route_id: route_id || null,
                status: status || 'active'
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ success: false, message: 'Bus number already exists in fleet registry.' });
            }
            throw error;
        }

        return res.status(201).json({
            success: true,
            message: 'Bus registered successfully.',
            bus: data
        });
    } catch (err) {
        console.error('Add bus error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create bus.' });
    }
}

/**
 * 6. Update Bus (Admin Only)
 */
async function updateBus(req, res) {
    try {
        const { id } = req.params;
        const { bus_number, bus_type, route_id, status } = req.body;

        const updates = {};
        if (bus_number) updates.bus_number = bus_number.trim().toUpperCase();
        if (bus_type) updates.bus_type = bus_type;
        if (route_id !== undefined) updates.route_id = route_id || null;
        if (status) updates.status = status;

        const { data, error } = await supabaseAdmin
            .from('buses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Bus details updated successfully.',
            bus: data
        });
    } catch (err) {
        console.error('Update bus error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update bus.' });
    }
}

/**
 * 7. Deactivate / Delete Bus (Admin Only)
 */
async function deleteBus(req, res) {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('buses')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.json({ success: true, message: 'Bus deleted successfully.' });
    } catch (err) {
        console.error('Delete bus error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete bus.' });
    }
}

module.exports = {
    getAllBuses,
    getBusById,
    searchBuses,
    findBusesBetweenStops,
    addBus,
    updateBus,
    deleteBus
};
