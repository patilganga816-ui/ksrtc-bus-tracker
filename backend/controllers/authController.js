// =====================================================================
// KSRTC Local Bus Tracking System — Auth Controller (Supabase)
// =====================================================================

const { supabaseAdmin } = require('../../config/supabase');

// Validation Helpers
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidIndianPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');
    const regex = /^[6-9]\d{9}$/;
    return regex.test(cleanPhone);
}

/**
 * 1. Passenger Registration
 * Creates account in Supabase Auth and stores profile in 'profiles' table
 */
async function registerPassenger(req, res) {
    try {
        const { full_name, email, mobile_number, password, confirm_password } = req.body;

        // Required fields validation
        if (!full_name || !email || !mobile_number || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'All fields (Full Name, Email, Mobile Number, Password, and Confirm Password) are required.'
            });
        }

        const trimmedName = full_name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const cleanMobile = mobile_number.replace(/[\s\-\+]/g, '').replace(/^91/, '').trim();

        // Email validation
        if (!isValidEmail(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // Indian mobile validation
        if (!isValidIndianPhone(cleanMobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
            });
        }

        // Password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters in length.'
            });
        }

        // Password matching
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match. Please re-enter identical passwords.'
            });
        }

        // Check for duplicate email or mobile number in profiles table
        const { data: existingProfiles, error: checkError } = await supabaseAdmin
            .from('profiles')
            .select('email, mobile_number')
            .or(`email.eq.${trimmedEmail},mobile_number.eq.${cleanMobile}`);

        if (checkError) {
            console.error('Check duplicate error:', checkError);
            return res.status(500).json({ success: false, message: 'Database verification failed.' });
        }

        if (existingProfiles && existingProfiles.length > 0) {
            const match = existingProfiles[0];
            if (match.email === trimmedEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'An account with this email address already exists. Please log in.'
                });
            }
            if (match.mobile_number === cleanMobile) {
                return res.status(409).json({
                    success: false,
                    message: 'An account with this mobile number already exists.'
                });
            }
        }

        // Create Supabase Auth User with auto-confirmed email (suitable for immediate project use)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: trimmedEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: trimmedName,
                mobile_number: cleanMobile,
                role: 'passenger'
            }
        });

        if (authError) {
            console.error('Supabase Auth createUser error:', authError);
            return res.status(400).json({
                success: false,
                message: authError.message || 'Failed to create user authentication credentials.'
            });
        }

        const userId = authData.user.id;

        // Ensure record exists in profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                full_name: trimmedName,
                email: trimmedEmail,
                mobile_number: cleanMobile,
                role: 'passenger',
                status: 'active'
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Rollback auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(500).json({
                success: false,
                message: 'Account profile creation failed in database.'
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Passenger registration successful! You can now log in.',
            user: {
                id: userId,
                full_name: trimmedName,
                email: trimmedEmail,
                mobile_number: cleanMobile,
                role: 'passenger'
            }
        });
    } catch (err) {
        console.error('Registration processing error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during passenger registration.'
        });
    }
}

/**
 * 2. Verify Session & Server-Side Role Enforcement
 * Called after Supabase Auth login on common login page to determine redirect destination
 */
async function verifySessionAndRole(req, res) {
    try {
            const authHeader = req.headers['authorization'];
     let token = authHeader && authHeader.split(' ')[1];
     const { selectedRole, token: bodyToken } = req.body;

     if (!token && bodyToken) {
         token = bodyToken;
     }

        // Verify token with Supabase
        const { data: { user }, error: tokenError } = await supabaseAdmin.auth.getUser(token);

        if (tokenError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication session expired or invalid. Please log in again.'
            });
        }

        // Fetch authoritative role from database profiles table (NEVER trust frontend)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({
                success: false,
                message: 'No associated application profile found for this user.'
            });
        }

        if (profile.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account is currently suspended or pending authorization.'
            });
        }

        const actualRole = profile.role;

        // If the user selected a specific role on the common login page, verify it strictly
        if (selectedRole && selectedRole.toLowerCase() !== actualRole) {
            return res.status(403).json({
                success: false,
                code: 'ROLE_MISMATCH',
                actualRole: actualRole,
                message: `Access denied. You selected '${selectedRole}', but your account is registered as '${actualRole}'.`
            });
        }

        // Determine destination dashboard
        let redirectUrl = '/passenger/home.html';
        let driverData = null;

        if (actualRole === 'driver') {
            redirectUrl = '/driver/trip-setup.html';
            const { data: driver } = await supabaseAdmin
                .from('drivers')
                .select('*, driver_assignments(*, buses(*))')
                .eq('profile_id', user.id)
                .maybeSingle();
            driverData = driver;
        } else if (actualRole === 'admin') {
            redirectUrl = '/admin/dashboard.html';
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: profile.full_name,
                mobile_number: profile.mobile_number,
                role: actualRole,
                status: profile.status,
                preferred_language: profile.preferred_language || 'en'
            },
            driver: driverData,
            redirectUrl: redirectUrl
        });
    } catch (err) {
        console.error('Session & role verification error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during role verification.'
        });
    }
}

/**
 * 3. Retrieve Authenticated User Profile
 */
async function getProfile(req, res) {
    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        let driverDetails = null;
        if (profile.role === 'driver') {
            const { data: driver } = await supabaseAdmin
                .from('drivers')
                .select('*')
                .eq('profile_id', profile.id)
                .single();
            driverDetails = driver;
        }

        return res.json({
            success: true,
            profile,
            driver: driverDetails
        });
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
}

/**
 * 4. Update Passenger Profile
 */
async function updateProfile(req, res) {
    try {
        const { full_name, mobile_number, preferred_language } = req.body;
        const updates = {};

        if (full_name) updates.full_name = full_name.trim();
        if (preferred_language && ['en', 'kn', 'hi'].includes(preferred_language)) {
            updates.preferred_language = preferred_language;
        }
        if (mobile_number) {
            const cleanMobile = mobile_number.replace(/[\s\-\+]/g, '').replace(/^91/, '').trim();
            if (!isValidIndianPhone(cleanMobile)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid 10-digit Indian mobile number.'
                });
            }
            updates.mobile_number = cleanMobile;
        }

        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({ success: false, message: 'Failed to update profile.' });
        }

        return res.json({
            success: true,
            message: 'Profile updated successfully.',
            profile: data
        });
    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({ success: false, message: 'Server error while updating profile.' });
    }
}

/**
 * 5. Secure Root Administrator Setup
 * Used once during system setup to initialize the master administrator safely
 */
async function setupInitialAdmin(req, res) {
    try {
        const { email, password, full_name, mobile_number, setup_key } = req.body;

        // Ensure key matches or no admin exists in the system
        const { data: admins, error: countError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

        if (admins && admins.length > 0 && setup_key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return res.status(403).json({
                success: false,
                message: 'An administrator already exists. Public administrator creation is prohibited.'
            });
        }

        if (!email || !password || !full_name || !mobile_number) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, full name, and mobile number are required to create admin.'
            });
        }

        // Create Supabase Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: full_name.trim(),
                mobile_number: mobile_number.trim(),
                role: 'admin'
            }
        });

        if (authError) {
            return res.status(400).json({ success: false, message: authError.message });
        }

        // Ensure Admin Profile
        await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                full_name: full_name.trim(),
                email: email.trim().toLowerCase(),
                mobile_number: mobile_number.trim(),
                role: 'admin',
                status: 'active'
            });

        return res.status(201).json({
            success: true,
            message: 'Master Administrator created successfully.',
            admin: {
                id: authData.user.id,
                email: email.trim().toLowerCase(),
                role: 'admin'
            }
        });
    } catch (err) {
        console.error('Setup initial admin error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create administrator.' });
    }
}

module.exports = {
    registerPassenger,
    verifySessionAndRole,
    getProfile,
    updateProfile,
    setupInitialAdmin
};
