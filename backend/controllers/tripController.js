// =====================================================================
// KSRTC Local Bus Tracking System — Trip Controller (Supabase)
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');

/**
 * 1. Start Journey / Trip
 * Initiated by the Driver on Screen 12 (Driver Trip Setup)
 */
async function startTrip(req, res) {
    try {
        const { bus_id, route_id, starting_stop_id, destination_stop_id, gps_mode = 'real' } = req.body;

        if (!bus_id || !route_id || !starting_stop_id || !destination_stop_id) {
            return res.status(400).json({
                success: false,
                message: 'bus_id, route_id, starting_stop_id, and destination_stop_id are all required.'
            });
        }

        // Retrieve driver record belonging to authenticated user
        const { data: driver, error: dError } = await supabaseAdmin
            .from('drivers')
            .select('id, status')
            .eq('profile_id', req.user.id)
            .single();

        if (dError || !driver) {
            return res.status(403).json({
                success: false,
                message: 'Only authorized drivers can initiate trips.'
            });
        }

        // Verify driver assignment for this bus
        const { data: assignments, error: aError } = await supabaseAdmin
            .from('driver_assignments')
            .select('id, bus_id')
            .eq('driver_id', driver.id)
            .eq('bus_id', bus_id)
            .eq('status', 'active');

        if (aError || !assignments || assignments.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not actively assigned to operate this bus.'
            });
        }

        // Complete any stale in-progress trips for this bus
        await supabaseAdmin
            .from('trips')
            .update({ trip_status: 'completed', end_time: new Date().toISOString() })
            .eq('bus_id', bus_id)
            .eq('trip_status', 'in_progress');

        // Create new active trip in PostgreSQL
        const { data: newTrip, error: tripError } = await supabaseAdmin
            .from('trips')
            .insert([{
                driver_id: driver.id,
                bus_id,
                route_id,
                starting_stop_id,
                destination_stop_id,
                trip_status: 'in_progress',
                gps_mode: gps_mode === 'simulated' ? 'simulated' : 'real',
                start_time: new Date().toISOString()
            }])
            .select(`
                *,
                bus:buses(id, bus_number, bus_type),
                route:routes(id, route_number, route_name),
                starting_stop:bus_stops!trips_starting_stop_id_fkey(id, stop_name, city),
                destination_stop:bus_stops!trips_destination_stop_id_fkey(id, stop_name, city)
            `)
            .single();

        if (tripError) throw tripError;

        // Update bus and driver states
        await supabaseAdmin.from('buses').update({ status: 'in_transit' }).eq('id', bus_id);
        await supabaseAdmin.from('drivers').update({ status: 'on_trip' }).eq('id', driver.id);

        return res.status(201).json({
            success: true,
            message: 'Journey started successfully. GPS tracking is now active.',
            trip: newTrip
        });
    } catch (err) {
        console.error('Start trip error:', err);
        return res.status(500).json({ success: false, message: 'Failed to start trip.' });
    }
}

/**
 * 2. End Journey / Trip
 * Invoked when Driver clicks 'End Journey' on Screen 13
 */
async function endTrip(req, res) {
    try {
        const { trip_id } = req.body;

        if (!trip_id) {
            return res.status(400).json({ success: false, message: 'trip_id is required.' });
        }

        // Retrieve trip
        const { data: trip, error: tError } = await supabaseAdmin
            .from('trips')
            .select('*, driver:drivers(profile_id)')
            .eq('id', trip_id)
            .single();

        if (tError || !trip) {
            return res.status(404).json({ success: false, message: 'Trip not found.' });
        }

        // Verify authorization: must be the operating driver or an admin
        const isAdmin = req.user.role === 'admin';
        const isTripDriver = trip.driver && trip.driver.profile_id === req.user.id;

        if (!isAdmin && !isTripDriver) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only end your own assigned trip.'
            });
        }

        // Mark trip completed
        const endTime = new Date().toISOString();
        const { data: updatedTrip, error: updateError } = await supabaseAdmin
            .from('trips')
            .update({
                trip_status: 'completed',
                end_time: endTime
            })
            .eq('id', trip_id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Revert bus and driver statuses to active
        await supabaseAdmin.from('buses').update({ status: 'active' }).eq('id', trip.bus_id);
        await supabaseAdmin.from('drivers').update({ status: 'active' }).eq('id', trip.driver_id);

        return res.json({
            success: true,
            message: 'Journey ended successfully. GPS tracking deactivated.',
            trip: updatedTrip
        });
    } catch (err) {
        console.error('End trip error:', err);
        return res.status(500).json({ success: false, message: 'Failed to end trip.' });
    }
}

/**
 * 3. Get All Active Trips (For live monitoring and tracking)
 */
async function getActiveTrips(req, res) {
    try {
        const { data: trips, error } = await supabaseAdmin
            .from('trips')
            .select(`
                id, start_time, trip_status, gps_mode,
                bus:buses(id, bus_number, bus_type, status),
                route:routes(id, route_number, route_name, source, destination),
                driver:drivers(id, employee_id, license_number, profile:profiles(full_name, mobile_number)),
                starting_stop:bus_stops!trips_starting_stop_id_fkey(id, stop_name, city, latitude, longitude),
                destination_stop:bus_stops!trips_destination_stop_id_fkey(id, stop_name, city, latitude, longitude)
            `)
            .eq('trip_status', 'in_progress')
            .order('start_time', { ascending: false });

        if (error) throw error;

        // Enrich each active trip with latest GPS coordinate
        const enriched = await Promise.all(trips.map(async (t) => {
            const { data: locs } = await supabaseAdmin
                .from('bus_locations')
                .select('*')
                .eq('trip_id', t.id)
                .order('server_received_at', { ascending: false })
                .limit(1);

            return {
                ...t,
                latest_location: locs && locs.length > 0 ? locs[0] : null
            };
        }));

        return res.json({
            success: true,
            count: enriched.length,
            trips: enriched
        });
    } catch (err) {
        console.error('Get active trips error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve active trips.' });
    }
}

/**
 * 4. Get Trip History & Reporting Logs
 */
async function getTripHistory(req, res) {
    try {
        const { bus_id, driver_id, date, status } = req.query;

        let query = supabaseAdmin
            .from('trips')
            .select(`
                id, start_time, end_time, trip_status, gps_mode, created_at,
                bus:buses(id, bus_number, bus_type),
                route:routes(id, route_number, route_name),
                driver:drivers(id, employee_id, profile:profiles(full_name)),
                starting_stop:bus_stops!trips_starting_stop_id_fkey(stop_name),
                destination_stop:bus_stops!trips_destination_stop_id_fkey(stop_name)
            `)
            .order('start_time', { ascending: false });

        if (bus_id) query = query.eq('bus_id', bus_id);
        if (driver_id) query = query.eq('driver_id', driver_id);
        if (status) query = query.eq('trip_status', status);

        const { data: trips, error } = await query;
        if (error) throw error;

        return res.json({ success: true, count: trips.length, trips });
    } catch (err) {
        console.error('Trip history error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve trip history.' });
    }
}

module.exports = {
    startTrip,
    endTrip,
    getActiveTrips,
    getTripHistory
};
