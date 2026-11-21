// =====================================================================
// KSRTC Local Bus Tracking System — Authentication & Role Enforcement
// =====================================================================

let supabaseClient = null;

// Initialize Supabase Web Client
function getSupabaseClient() {
    if (!supabaseClient && window.supabase && window.KSRTC_CONFIG) {
        const { url, anonKey } = window.KSRTC_CONFIG.SUPABASE_CONFIG;
        if (url && anonKey && !url.includes('your-project-ref')) {
            supabaseClient = window.supabase.createClient(url, anonKey);
        }
    }
    return supabaseClient;
}

const auth = {
    /**
     * Unified Login with Server-Side Role Verification
     */
    async login(email, password, selectedRole, remember = true) {
        try {
            const client = getSupabaseClient();
            let token = null;

            if (client) {
                // 1. Authenticate with Supabase Auth
                const { data, error } = await client.auth.signInWithPassword({
                    email: email.trim().toLowerCase(),
                    password: password
                });

                if (error) {
                    return { success: false, message: error.message || 'Invalid email or password.' };
                }

                token = data.session.access_token;
            } else {
                // Fallback for direct testing if Supabase Client is not yet initialized with live keys
                console.warn('Supabase JS client not connected to live keys yet.');
            }

            // 2. Transmit session token to backend to verify authoritative role stored in DB
            const verifyRes = await api.post('/auth/verify-role', {
                selectedRole,
                token
            });

            if (!verifyRes.success) {
                if (client) await client.auth.signOut();
                return {
                    success: false,
                    message: verifyRes.message || 'Role verification failed.'
                };
            }

            // 3. Store verified session in browser storage
            if (token) api.setToken(token, remember);
            api.setUser(verifyRes.user, remember);

            return {
                success: true,
                user: verifyRes.user,
                redirectUrl: verifyRes.redirectUrl
            };
        } catch (err) {
            console.error('Login process error:', err);
            return {
                success: false,
                message: 'An unexpected error occurred during login. Please try again.'
            };
        }
    },

    /**
     * Logout from any role panel and return to the Common Login page
     */
    async logout() {
        try {
            const client = getSupabaseClient();
            if (client) {
                await client.auth.signOut();
            }
        } catch (e) {
            console.warn('Supabase signOut error:', e);
        } finally {
            api.clearAuth();
            window.location.href = '/index.html?logged_out=1';
        }
    },

    /**
     * Client-Side Route Protection Guard
     * Call at the top of protected pages to verify session and enforce role isolation
     */
    async guard(requiredRole) {
        const user = api.getUser();
        const token = api.getToken();

        if (!user || !token) {
            window.location.href = `/index.html?redirect=${encodeURIComponent(window.location.pathname)}`;
            return null;
        }

        if (requiredRole && user.role !== requiredRole) {
            alert(`Access Denied: Your account role (${user.role}) does not have permission to access the ${requiredRole} portal.`);
            // Redirect to appropriate home for their actual role
            if (user.role === 'passenger') window.location.href = '/passenger/home.html';
            else if (user.role === 'driver') window.location.href = '/driver/trip-setup.html';
            else if (user.role === 'admin') window.location.href = '/admin/dashboard.html';
            return null;
        }

        return user;
    }
};

window.auth = auth;
window.getSupabaseClient = getSupabaseClient;
