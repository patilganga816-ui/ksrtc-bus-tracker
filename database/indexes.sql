-- =====================================================================
-- KSRTC LOCAL BUS TRACKING SYSTEM
-- Performance Indexes for Supabase PostgreSQL
-- =====================================================================

-- 1. Bus Locations: Instant retrieval of the most recent GPS fix for a given bus
CREATE INDEX IF NOT EXISTS idx_bus_locations_bus_latest 
ON bus_locations(bus_id, server_received_at DESC);

-- 2. Bus Locations: Retrieval of trip trajectory for history and reports
CREATE INDEX IF NOT EXISTS idx_bus_locations_trip_history 
ON bus_locations(trip_id, gps_timestamp ASC);

-- 3. Trips: Instant lookup of active journeys
CREATE INDEX IF NOT EXISTS idx_trips_active 
ON trips(bus_id, trip_status) 
WHERE trip_status = 'in_progress';

-- 4. Trips: Lookup active trips by driver
CREATE INDEX IF NOT EXISTS idx_trips_driver_active 
ON trips(driver_id, trip_status) 
WHERE trip_status = 'in_progress';

-- 5. Route Stops: Fast sequential retrieval of ordered stops along a route
CREATE INDEX IF NOT EXISTS idx_route_stops_ordered 
ON route_stops(route_id, direction, stop_sequence);

-- 6. Bus Stops: City-level and name filtering
CREATE INDEX IF NOT EXISTS idx_bus_stops_city_name 
ON bus_stops(city, stop_name);

-- 7. Buses: Fast lookup by bus number and status
CREATE INDEX IF NOT EXISTS idx_buses_number 
ON buses(bus_number);

CREATE INDEX IF NOT EXISTS idx_buses_status 
ON buses(status);

-- 8. Driver Assignments: Lookup active assignments for a driver
CREATE INDEX IF NOT EXISTS idx_driver_assignments_lookup 
ON driver_assignments(driver_id, status) 
WHERE status = 'active';

-- 9. Favourites: Fast retrieval of passenger saved entries
CREATE INDEX IF NOT EXISTS idx_favourites_passenger 
ON favourites(passenger_id);

-- 10. Notifications: Fast retrieval of unread notifications for a passenger
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(passenger_id, is_read, created_at DESC);
