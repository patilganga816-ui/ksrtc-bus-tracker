// =====================================================================
// KSRTC Local Bus Tracking System — Driver Controller (Supabase)
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');

/**
 * 1. Get all drivers (Admin Only)
 */
async function getAllDrivers(req, res) {
    try {
        const { data: drivers, error } = await supabaseAdmin
            .from('drivers')
            .select(`
                id, license_number, employee_id, status, created_at,
                profile:profiles(id, full_name, email, mobile_number, status),
                driver_assignments(
                    id, assigned_date, status,
                    bus:buses(id, bus_number, bus_type, status, route:routes(id, route_number, route_name))
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({
            success: true,
            count: drivers.length,
            drivers
        });
    } catch (err) {
        console.error('Get drivers error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve drivers.' });
    }
}

/**
 * 2. Create Driver Account (Admin Only)
 * Creates Supabase Auth User, Profile, and Driver records
 */
async function createDriver(req, res) {
    try {
        const { full_name, email, mobile_number, password, license_number, employee_id } = req.body;

        if (!full_name || !email || !mobile_number || !password || !license_number || !employee_id) {
            return res.status(400).json({
                success: false,
                message: 'All fields (Name, Email, Mobile, Password, License Number, and Employee ID) are required.'
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanMobile = mobile_number.replace(/[\s\-\+]/g, '').replace(/^91/, '').trim();
        const cleanLicense = license_number.trim().toUpperCase();
        const cleanEmpId = employee_id.trim().toUpperCase();

        // 1. Create Supabase Auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: full_name.trim(),
                mobile_number: cleanMobile,
                role: 'driver'
            }
        });

        if (authError) {
            return res.status(400).json({ success: false, message: authError.message });
        }

        const userId = authData.user.id;

        // 2. Ensure Profile in profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                full_name: full_name.trim(),
                email: cleanEmail,
                mobile_number: cleanMobile,
                role: 'driver',
                status: 'active'
            });

        if (profileError) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw profileError;
        }

        // 3. Create record in drivers table
        const { data: driverData, error: driverError } = await supabaseAdmin
            .from('drivers')
            .insert([{
                profile_id: userId,
                license_number: cleanLicense,
                employee_id: cleanEmpId,
                status: 'active'
            }])
            .select()
            .single();

        if (driverError) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw driverError;
        }

        return res.status(201).json({
            success: true,
            message: 'Driver account authorized and registered successfully.',
            driver: driverData
        });
    } catch (err) {
        console.error('Create driver error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create driver account.' });
    }
}

/**
 * 3. Assign Driver to a Bus (Admin Only)
 */
async function assignBus(req, res) {
    try {
        const { driver_id, bus_id } = req.body;

        if (!driver_id || !bus_id) {
            return res.status(400).json({
                success: false,
                message: 'Both driver_id and bus_id are required.'
            });
        }

        // Deactivate previous active assignments for this driver
        await supabaseAdmin
            .from('driver_assignments')
            .update({ status: 'completed' })
            .eq('driver_id', driver_id)
            .eq('status', 'active');

        // Create new active assignment
        const { data, error } = await supabaseAdmin
            .from('driver_assignments')
            .insert([{
                driver_id,
                bus_id,
                assigned_date: new Date().toISOString().split('T')[0],
                status: 'active'
            }])
            .select(`
                id, assigned_date, status,
                bus:buses(id, bus_number, bus_type, route:routes(id, route_number, route_name))
            `)
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Bus successfully assigned to driver.',
            assignment: data
        });
    } catch (err) {
        console.error('Assign bus error:', err);
        return res.status(500).json({ success: false, message: 'Failed to allocate bus assignment.' });
    }
}

/**
 * 4. Get Current Driver Assignment (Used by Driver Portal)
 */
async function getDriverAssignment(req, res) {
    try {
        const userId = req.user.id;

        // Retrieve driver record
        const { data: driver, error: dError } = await supabaseAdmin
            .from('drivers')
            .select('id, license_number, employee_id, status')
            .eq('profile_id', userId)
            .single();

        if (dError || !driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver profile not found. Please contact administration.'
            });
        }

        // Retrieve active assignment
        const { data: assignments, error: aError } = await supabaseAdmin
            .from('driver_assignments')
            .select(`
                id, assigned_date, status,
                bus:buses(
                    id, bus_number, bus_type, status,
                    route:routes(
                        id, route_number, route_name, source, destination, city_coverage,
                        route_stops(
                            id, stop_sequence, direction,
                            stop:bus_stops(id, stop_name, city, latitude, longitude)
                        )
                    )
                )
            `)
            .eq('driver_id', driver.id)
            .eq('status', 'active')
            .limit(1);

        if (aError) throw aError;

        const currentAssignment = assignments && assignments.length > 0 ? assignments[0] : null;

        // Check if there is an active trip already in progress
        let activeTrip = null;
        if (currentAssignment && currentAssignment.bus) {
            const { data: trips } = await supabaseAdmin
                .from('trips')
                .select('*')
                .eq('driver_id', driver.id)
                .eq('bus_id', currentAssignment.bus.id)
                .eq('trip_status', 'in_progress')
                .limit(1);

            if (trips && trips.length > 0) {
                activeTrip = trips[0];
            }
        }

        return res.json({
            success: true,
            driver,
            assignment: currentAssignment,
            active_trip: activeTrip
        });
    } catch (err) {
        console.error('Get driver assignment error:', err);
        return res.status(500).json({ success: false, message: 'Failed to load driver assignment.' });
    }
}

module.exports = {
    getAllDrivers,
    createDriver,
    assignBus,
    getDriverAssignment
};
