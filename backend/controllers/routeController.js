// =====================================================================
// KSRTC Local Bus Tracking System — Routes & Stops Controller (Supabase)
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');

/**
 * 1. Get all routes with stop counts
 */
async function getAllRoutes(req, res) {
    try {
        const { data: routes, error } = await supabaseAdmin
            .from('routes')
            .select(`
                id, route_number, route_name, source, destination, city_coverage, status, created_at,
                buses(id, bus_number, status)
            `)
            .order('route_number', { ascending: true });

        if (error) throw error;

        // Fetch ordered stops for each route
        const enrichedRoutes = await Promise.all(routes.map(async (r) => {
            const { data: rStops } = await supabaseAdmin
                .from('route_stops')
                .select('id, stop_sequence, direction, bus_stops(id, stop_name, city, latitude, longitude)')
                .eq('route_id', r.id)
                .order('stop_sequence', { ascending: true });

            return {
                ...r,
                stops_count: rStops ? rStops.length : 0,
                stops: rStops || []
            };
        }));

        return res.json({ success: true, count: enrichedRoutes.length, routes: enrichedRoutes });
    } catch (err) {
        console.error('Get routes error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve routes.' });
    }
}

/**
 * 2. Get route by ID with fully ordered stop sequence
 */
async function getRouteById(req, res) {
    try {
        const { id } = req.params;

        const { data: route, error } = await supabaseAdmin
            .from('routes')
            .select(`
                id, route_number, route_name, source, destination, city_coverage, status, created_at,
                buses(id, bus_number, bus_type, status)
            `)
            .eq('id', id)
            .single();

        if (error || !route) {
            return res.status(404).json({ success: false, message: 'Route not found.' });
        }

        // Fetch forward stops
        const { data: forwardStops } = await supabaseAdmin
            .from('route_stops')
            .select(`
                id, stop_sequence, direction,
                stop:bus_stops(id, stop_name, city, address, latitude, longitude)
            `)
            .eq('route_id', id)
            .eq('direction', 'forward')
            .order('stop_sequence', { ascending: true });

        // Fetch reverse stops if any
        const { data: reverseStops } = await supabaseAdmin
            .from('route_stops')
            .select(`
                id, stop_sequence, direction,
                stop:bus_stops(id, stop_name, city, address, latitude, longitude)
            `)
            .eq('route_id', id)
            .eq('direction', 'reverse')
            .order('stop_sequence', { ascending: true });

        return res.json({
            success: true,
            route: {
                ...route,
                forward_stops: forwardStops || [],
                reverse_stops: reverseStops || []
            }
        });
    } catch (err) {
        console.error('Get route error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve route details.' });
    }
}

/**
 * 3. Get all verified bus stops across Hubballi and Dharwad
 */
async function getAllStops(req, res) {
    try {
        const { city } = req.query;

        let query = supabaseAdmin
            .from('bus_stops')
            .select('*')
            .order('city', { ascending: true })
            .order('stop_name', { ascending: true });

        if (city) {
            query = query.eq('city', city);
        }

        const { data: stops, error } = await query;

        if (error) throw error;

        return res.json({ success: true, count: stops.length, stops });
    } catch (err) {
        console.error('Get stops error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve bus stops.' });
    }
}

/**
 * 4. Add Bus Stop (Admin Only) with map verification check
 */
async function addStop(req, res) {
    try {
        const { stop_name, city, address, latitude, longitude } = req.body;

        if (!stop_name || !city || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Stop Name, City, Address, Latitude, and Longitude are all required.'
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (lat < 15.1500 || lat > 15.5500 || lng < 74.9500 || lng > 75.3000) {
            return res.status(422).json({
                success: false,
                message: 'Stop coordinates must fall within the Hubballi–Dharwad boundary [15.15-15.55 N, 74.95-75.30 E].'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('bus_stops')
            .insert([{
                stop_name: stop_name.trim(),
                city: city.trim(),
                address: address.trim(),
                latitude: lat,
                longitude: lng
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Bus stop added successfully.',
            stop: data
        });
    } catch (err) {
        console.error('Add stop error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create bus stop.' });
    }
}

/**
 * 5. Update Bus Stop (Admin Only)
 */
async function updateStop(req, res) {
    try {
        const { id } = req.params;
        const { stop_name, city, address, latitude, longitude } = req.body;

        const updates = {};
        if (stop_name) updates.stop_name = stop_name.trim();
        if (city) updates.city = city.trim();
        if (address) updates.address = address.trim();
        if (latitude !== undefined) updates.latitude = parseFloat(latitude);
        if (longitude !== undefined) updates.longitude = parseFloat(longitude);

        const { data, error } = await supabaseAdmin
            .from('bus_stops')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Bus stop updated successfully.',
            stop: data
        });
    } catch (err) {
        console.error('Update stop error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update bus stop.' });
    }
}

/**
 * 6. Add Route (Admin Only)
 */
async function addRoute(req, res) {
    try {
        const { route_number, route_name, source, destination, city_coverage } = req.body;

        if (!route_number || !route_name || !source || !destination) {
            return res.status(400).json({
                success: false,
                message: 'Route Number, Route Name, Source, and Destination are required.'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('routes')
            .insert([{
                route_number: route_number.trim().toUpperCase(),
                route_name: route_name.trim(),
                source: source.trim(),
                destination: destination.trim(),
                city_coverage: city_coverage || 'Hubballi-Dharwad',
                status: 'active'
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ success: false, message: 'Route number already exists.' });
            }
            throw error;
        }

        return res.status(201).json({
            success: true,
            message: 'Route created successfully.',
            route: data
        });
    } catch (err) {
        console.error('Add route error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create route.' });
    }
}

/**
 * 7. Configure / Sequence Stops along a Route (Admin Only)
 */
async function configureRouteStops(req, res) {
    try {
        const { route_id } = req.params;
        const { stops, direction = 'forward' } = req.body; // stops: Array of { stop_id, stop_sequence }

        if (!Array.isArray(stops)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payload: stops must be an array of sequenced stop objects.'
            });
        }

        // Clear existing stops for this route and direction
        await supabaseAdmin
            .from('route_stops')
            .delete()
            .eq('route_id', route_id)
            .eq('direction', direction);

        if (stops.length > 0) {
            const recordsToInsert = stops.map((item, index) => ({
                route_id,
                stop_id: item.stop_id,
                stop_sequence: item.stop_sequence || (index + 1),
                direction
            }));

            const { error: insertError } = await supabaseAdmin
                .from('route_stops')
                .insert(recordsToInsert);

            if (insertError) throw insertError;
        }

        return res.json({
            success: true,
            message: `Successfully sequenced ${stops.length} stops for this route (${direction}).`
        });
    } catch (err) {
        console.error('Configure route stops error:', err);
        return res.status(500).json({ success: false, message: 'Failed to sequence route stops.' });
    }
}

module.exports = {
    getAllRoutes,
    getRouteById,
    getAllStops,
    addStop,
    updateStop,
    addRoute,
    configureRouteStops
};
