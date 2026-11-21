// =====================================================================
// KSRTC Local Bus Tracking System — Passenger Controller (Supabase)
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');

/**
 * 1. Get Passenger Favourites
 */
async function getFavourites(req, res) {
    try {
        const passengerId = req.user.id;

        const { data: favs, error } = await supabaseAdmin
            .from('favourites')
            .select(`
                id, created_at,
                bus:buses(
                    id, bus_number, bus_type, status,
                    route:routes(id, route_number, route_name)
                ),
                route:routes(id, route_number, route_name, source, destination)
            `)
            .eq('passenger_id', passengerId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ success: true, count: favs.length, favourites: favs });
    } catch (err) {
        console.error('Get favourites error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve favourites.' });
    }
}

/**
 * 2. Add to Favourites
 */
async function addFavourite(req, res) {
    try {
        const passengerId = req.user.id;
        const { bus_id, route_id } = req.body;

        if (!bus_id && !route_id) {
            return res.status(400).json({
                success: false,
                message: 'At least one of bus_id or route_id is required.'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('favourites')
            .insert([{
                passenger_id: passengerId,
                bus_id: bus_id || null,
                route_id: route_id || null
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Saved to favourites.',
            favourite: data
        });
    } catch (err) {
        console.error('Add favourite error:', err);
        return res.status(500).json({ success: false, message: 'Failed to save favourite.' });
    }
}

/**
 * 3. Remove from Favourites
 */
async function removeFavourite(req, res) {
    try {
        const passengerId = req.user.id;
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('favourites')
            .delete()
            .eq('id', id)
            .eq('passenger_id', passengerId);

        if (error) throw error;

        return res.json({ success: true, message: 'Removed from favourites.' });
    } catch (err) {
        console.error('Remove favourite error:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove favourite.' });
    }
}

/**
 * 4. Get Passenger Notifications
 */
async function getNotifications(req, res) {
    try {
        const passengerId = req.user.id;

        const { data: notifs, error } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('passenger_id', passengerId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ success: true, count: notifs.length, notifications: notifs });
    } catch (err) {
        console.error('Get notifications error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
    }
}

/**
 * 5. Mark Notification as Read
 */
async function markNotificationRead(req, res) {
    try {
        const passengerId = req.user.id;
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('passenger_id', passengerId)
            .select()
            .single();

        if (error) throw error;

        return res.json({ success: true, notification: data });
    } catch (err) {
        console.error('Mark notification read error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
}

/**
 * 6. Get All Registered Passengers (Admin Only)
 */
async function getAllPassengers(req, res) {
    try {
        const { data: passengers, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, mobile_number, status, created_at')
            .eq('role', 'passenger')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ success: true, count: passengers.length, passengers });
    } catch (err) {
        console.error('Get all passengers error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve passenger list.' });
    }
}

/**
 * 7. Update Passenger Account Status (Admin Only)
 */
async function updatePassengerStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'suspended'

        if (!status || !['active', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: "Valid status ('active' or 'suspended') is required." });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ status })
            .eq('id', id)
            .eq('role', 'passenger')
            .select()
            .single();

        if (error) throw error;

        return res.json({ success: true, message: `Passenger account ${status}.`, profile: data });
    } catch (err) {
        console.error('Update passenger status error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update passenger status.' });
    }
}

/**
 * 8. Update Passenger Preferred Language
 */
async function updateLanguagePreference(req, res) {
    try {
        const passengerId = req.user.id;
        const { preferred_language } = req.body;

        if (!preferred_language || !['en', 'kn', 'hi'].includes(preferred_language)) {
            return res.status(400).json({
                success: false,
                message: "Valid language code ('en', 'kn', or 'hi') is required."
            });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ preferred_language })
            .eq('id', passengerId)
            .select()
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Language preference saved.',
            preferred_language: data ? data.preferred_language : preferred_language
        });
    } catch (err) {
        console.error('Update language error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update language preference.' });
    }
}

module.exports = {
    getFavourites,
    addFavourite,
    removeFavourite,
    getNotifications,
    markNotificationRead,
    getAllPassengers,
    updatePassengerStatus,
    updateLanguagePreference
};
