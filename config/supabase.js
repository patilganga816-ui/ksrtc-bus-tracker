// =====================================================================
// KSRTC Local Bus Tracking System — Supabase Database Client
// =====================================================================

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in .env');
    console.warn('👉 Please configure your Supabase credentials in the .env file.');
}

// 1. Privileged Admin Client (Used exclusively on the server side)
// Bypasses RLS to execute trusted application logic, GPS validations, and fleet management
const supabaseAdmin = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// 2. Public Client (Respects RLS policies)
const supabase = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

// Connection verification utility
async function testSupabaseConnection() {
    try {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL.includes('placeholder')) {
            console.log('ℹ️  Supabase credentials not configured yet in .env');
            return false;
        }

        const { count, error } = await supabaseAdmin
            .from('bus_stops')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Supabase Connection Error:', error.message);
            return false;
        }

        console.log(`✅ Connected successfully to Supabase PostgreSQL at ${SUPABASE_URL}`);
        return true;
    } catch (err) {
        console.error('❌ Failed to connect to Supabase:', err.message);
        return false;
    }
}

module.exports = {
    supabase,
    supabaseAdmin,
    testSupabaseConnection
};
