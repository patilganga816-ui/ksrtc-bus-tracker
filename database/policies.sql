-- =====================================================================
-- KSRTC LOCAL BUS TRACKING SYSTEM
-- Row Level Security (RLS) Policies & Realtime Setup
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL 11 TABLES
-- ---------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 2. HELPER FUNCTIONS FOR ROLE CHECKS IN RLS
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_driver()
RETURNS BOOLEAN AS $$
    SELECT (role = 'driver') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON profiles;
CREATE POLICY "Users can view own profile or admins view all"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- ---------------------------------------------------------------------
-- 4. PUBLIC READ POLICIES FOR TRANSIT DIRECTORY
-- Stops, routes, route_stops, and buses are readable by all authenticated users
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated read on bus_stops" ON bus_stops;
CREATE POLICY "Allow authenticated read on bus_stops"
    ON bus_stops FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin full access on bus_stops" ON bus_stops;
CREATE POLICY "Allow admin full access on bus_stops"
    ON bus_stops FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated read on routes" ON routes;
CREATE POLICY "Allow authenticated read on routes"
    ON routes FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin full access on routes" ON routes;
CREATE POLICY "Allow admin full access on routes"
    ON routes FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated read on route_stops" ON route_stops;
CREATE POLICY "Allow authenticated read on route_stops"
    ON route_stops FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin full access on route_stops" ON route_stops;
CREATE POLICY "Allow admin full access on route_stops"
    ON route_stops FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated read on buses" ON buses;
CREATE POLICY "Allow authenticated read on buses"
    ON buses FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin full access on buses" ON buses;
CREATE POLICY "Allow admin full access on buses"
    ON buses FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. DRIVER & ASSIGNMENT POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated read on drivers" ON drivers;
CREATE POLICY "Allow authenticated read on drivers"
    ON drivers FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin full access on drivers" ON drivers;
CREATE POLICY "Allow admin full access on drivers"
    ON drivers FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Drivers can view their own assignments or admin view all" ON driver_assignments;
CREATE POLICY "Drivers can view their own assignments or admin view all"
    ON driver_assignments FOR SELECT
    TO authenticated
    USING (
        driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid()) 
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Allow admin manage driver_assignments" ON driver_assignments;
CREATE POLICY "Allow admin manage driver_assignments"
    ON driver_assignments FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ---------------------------------------------------------------------
-- 6. TRIPS & LIVE BUS LOCATIONS POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated read on trips" ON trips;
CREATE POLICY "Allow authenticated read on trips"
    ON trips FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Drivers can insert trips" ON trips;
CREATE POLICY "Drivers can insert trips"
    ON trips FOR INSERT
    TO authenticated
    WITH CHECK (
        driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Drivers can update own trips" ON trips;
CREATE POLICY "Drivers can update own trips"
    ON trips FOR UPDATE
    TO authenticated
    USING (
        driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Allow authenticated read on bus_locations" ON bus_locations;
CREATE POLICY "Allow authenticated read on bus_locations"
    ON bus_locations FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Drivers and service role can insert bus_locations" ON bus_locations;
CREATE POLICY "Drivers and service role can insert bus_locations"
    ON bus_locations FOR INSERT
    TO authenticated
    WITH CHECK (
        trip_id IN (
            SELECT t.id FROM trips t 
            JOIN drivers d ON t.driver_id = d.id 
            WHERE d.profile_id = auth.uid() AND t.trip_status = 'in_progress'
        )
        OR public.is_admin()
    );

-- ---------------------------------------------------------------------
-- 7. FAVOURITES & NOTIFICATIONS POLICIES
-- Strict isolation per passenger
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Passengers manage their own favourites" ON favourites;
CREATE POLICY "Passengers manage their own favourites"
    ON favourites FOR ALL
    TO authenticated
    USING (passenger_id = auth.uid())
    WITH CHECK (passenger_id = auth.uid());

DROP POLICY IF EXISTS "Passengers manage their own notifications" ON notifications;
CREATE POLICY "Passengers manage their own notifications"
    ON notifications FOR ALL
    TO authenticated
    USING (passenger_id = auth.uid())
    WITH CHECK (passenger_id = auth.uid());

-- ---------------------------------------------------------------------
-- 8. ENABLE SUPABASE REALTIME REPLICATION
-- Adds bus_locations and trips to realtime publication for WebSocket events
-- ---------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bus_locations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bus_locations;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'trips'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE trips;
    END IF;
END $$;
