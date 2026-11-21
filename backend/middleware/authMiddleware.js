// =====================================================================
// KSRTC Local Bus Tracking System — Supabase Auth & Role Middleware
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');

/**
 * Authenticates requests using Supabase Auth JWT
 * Extracts Bearer token, verifies via Supabase Auth, and attaches profile from DB
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        // Verify token with Supabase Auth
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session. Please log in again.'
            });
        }

        // Fetch authoritative role and profile details from database
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(403).json({
                success: false,
                message: 'User profile not found in database.'
            });
        }

        if (profile.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account is suspended. Please contact KSRTC administration.'
            });
        }

        // Attach user and profile to request
        req.user = {
            id: user.id,
            email: user.email,
            full_name: profile.full_name,
            mobile_number: profile.mobile_number,
            role: profile.role,
            status: profile.status
        };

        // If driver, attach driver details
        if (profile.role === 'driver') {
            const { data: driver } = await supabaseAdmin
                .from('drivers')
                .select('*')
                .eq('profile_id', user.id)
                .single();
            if (driver) {
                req.driver = driver;
            }
        }

        next();
    } catch (err) {
        console.error('Authentication Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Authentication processing failed.'
        });
    }
}

/**
 * Guard requiring Administrator role
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden: Administrator privileges required.'
        });
    }
    next();
}

/**
 * Guard requiring Driver role
 */
function requireDriver(req, res, next) {
    if (!req.user || req.user.role !== 'driver') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden: Driver privileges required.'
        });
    }
    next();
}

/**
 * Guard requiring Passenger role
 */
function requirePassenger(req, res, next) {
    if (!req.user || req.user.role !== 'passenger') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden: Passenger privileges required.'
        });
    }
    next();
}

module.exports = {
    authenticateToken,
    requireAdmin,
    requireDriver,
    requirePassenger
};
