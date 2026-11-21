// =====================================================================
// KSRTC Local Bus Tracking System — Frontend Configuration
// =====================================================================

// Backend API Base Address
const API_BASE_URL = window.location.origin + '/api';

// Supabase Public Client Credentials (Anon key is safe for public client usage)
// Note: When deploying or testing locally, ensure these match your Supabase Project settings
const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || 'https://uzutufzucpkgiytiwbij.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dXR1Znp1Y3BrZ2l5dGl3YmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNzc5ODAsImV4cCI6MjExMDY1Mzk4MH0.B3tkQNNqLl5wGnfgdRHtOn6D4Xvpa1he2f6VukqEJeY'
};

// Hubballi–Dharwad Geographical Map Defaults
const MAP_CONFIG = {
    center: [15.4200, 75.0800], // Midpoint between Hubballi and Dharwad on Old PB Road
    defaultZoom: 12,
    minZoom: 10,
    maxZoom: 18,
    bounds: [
        [15.1500, 74.9500], // Southwest boundary
        [15.5500, 75.3000]  // Northeast boundary
    ],
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | KSRTC Local Fleet'
};

// Expose globally
window.KSRTC_CONFIG = {
    API_BASE_URL,
    SUPABASE_CONFIG,
    MAP_CONFIG
};
