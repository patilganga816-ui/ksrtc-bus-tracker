// =====================================================================
// KSRTC Local Bus Tracking System — Central API Client
// =====================================================================

const api = {
    // Session token management
    getToken() {
        return localStorage.getItem('ksrtc_token') || sessionStorage.getItem('ksrtc_token') || null;
    },

    setToken(token, remember = true) {
        if (!token) return;
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('ksrtc_token', token);
    },

    getUser() {
        const userStr = localStorage.getItem('ksrtc_user') || sessionStorage.getItem('ksrtc_user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },

    setUser(user, remember = true) {
        if (!user) return;
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('ksrtc_user', JSON.stringify(user));
    },

    clearAuth() {
        localStorage.removeItem('ksrtc_token');
        localStorage.removeItem('ksrtc_user');
        sessionStorage.removeItem('ksrtc_token');
        sessionStorage.removeItem('ksrtc_user');
    },

    // HTTP Request Wrapper
    async request(endpoint, options = {}) {
        const baseUrl = window.KSRTC_CONFIG ? window.KSRTC_CONFIG.API_BASE_URL : (window.location.origin + '/api');
        const url = `${baseUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Handle unauthorized access or session expiry
            if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
                this.clearAuth();
                if (!window.location.pathname.endsWith('index.html')) {
                    window.location.href = '/index.html?session_expired=1';
                }
                return null;
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err);
            return {
                success: false,
                message: 'Network error or server unreachable. Please verify your connection.'
            };
        }
    },

    get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    patch(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

window.api = api;
