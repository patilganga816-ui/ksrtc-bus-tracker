-- =====================================================================
-- KSRTC LOCAL BUS TRACKING SYSTEM (Hubballi–Dharwad Transit Corridor)
-- PostgreSQL Database DDL Schema for Supabase
-- =====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order if cleanly resetting
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favourites CASCADE;
DROP TABLE IF EXISTS bus_locations CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS driver_assignments CASCADE;
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS bus_stops CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with application persona & profile details
-- ---------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('passenger', 'driver', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. DRIVERS TABLE
-- Stores authorized transport authority driver credentials
-- ---------------------------------------------------------------------
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_trip', 'off_duty', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. ROUTES TABLE
-- Designated transit lines between Hubballi and Dharwad terminals
-- ---------------------------------------------------------------------
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_number VARCHAR(50) UNIQUE NOT NULL,
    route_name VARCHAR(150) NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    city_coverage VARCHAR(100) NOT NULL DEFAULT 'Hubballi-Dharwad',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. BUS STOPS TABLE
-- Verified physical bus stops across the Hubballi–Dharwad corridor
-- Coordinates are geographically constrained: Lat 15.15-15.55, Lon 74.95-75.30
-- ---------------------------------------------------------------------
CREATE TABLE bus_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL CHECK (city IN ('Hubballi', 'Dharwad')),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN 15.1500000 AND 15.5500000),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN 74.9500000 AND 75.3000000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. ROUTE STOPS TABLE (Junction Table with Sequence & Direction)
-- Maps ordered stops belonging to a transit route
-- ---------------------------------------------------------------------
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_id UUID NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
    stop_sequence INT NOT NULL CHECK (stop_sequence >= 1),
    direction VARCHAR(20) NOT NULL DEFAULT 'forward' CHECK (direction IN ('forward', 'reverse')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_route_stop_seq UNIQUE (route_id, stop_sequence, direction)
);

-- ---------------------------------------------------------------------
-- 6. BUSES TABLE
-- Fleet vehicles belonging to KSRTC / NWKRTC depot
-- ---------------------------------------------------------------------
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    bus_type VARCHAR(30) NOT NULL CHECK (bus_type IN ('Chigari BRTS', 'City Ordinary', 'Suvarna Express', 'Vidyarthi Special')),
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_transit', 'maintenance', 'decommissioned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. DRIVER ASSIGNMENTS TABLE
-- Administrative allocation of a driver to a specific bus
-- ---------------------------------------------------------------------
CREATE TABLE driver_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 8. TRIPS TABLE
-- Active and historical trips initiated by drivers
-- ---------------------------------------------------------------------
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    bus_id UUID NOT NULL REFERENCES buses(id),
    route_id UUID NOT NULL REFERENCES routes(id),
    starting_stop_id UUID NOT NULL REFERENCES bus_stops(id),
    destination_stop_id UUID NOT NULL REFERENCES bus_stops(id),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    trip_status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (trip_status IN ('in_progress', 'completed', 'cancelled')),
    gps_mode VARCHAR(20) NOT NULL DEFAULT 'real' CHECK (gps_mode IN ('real', 'simulated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 9. BUS LOCATIONS TABLE (High-Frequency GPS Stream)
-- Real-time and historical GPS telemetry points emitted by driver smartphones
-- ---------------------------------------------------------------------
CREATE TABLE bus_locations (
    id BIGSERIAL PRIMARY KEY,
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN 15.1500000 AND 15.5500000),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN 74.9500000 AND 75.3000000),
    speed NUMERIC(5, 2) DEFAULT 0.00,
    heading NUMERIC(5, 2) DEFAULT 0.00,
    accuracy NUMERIC(7, 2),
    gps_timestamp TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 10. FAVOURITES TABLE
-- Passenger saved routes and preferred buses
-- ---------------------------------------------------------------------
CREATE TABLE favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fav_target CHECK (bus_id IS NOT NULL OR route_id IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- Passenger travel alerts, service updates, and trip notifications
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- AUTOMATED TRIGGERS
-- Auto-sync auth.users to profiles on user signup via Supabase Auth
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, mobile_number, role, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'KSRTC Commuter'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'mobile_number', '0000000000'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'passenger'),
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        mobile_number = EXCLUDED.mobile_number,
        role = EXCLUDED.role,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp on profiles update
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();
