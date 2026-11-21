-- =====================================================================
-- KSRTC LOCAL BUS TRACKING SYSTEM (Hubballi–Dharwad Region)
-- Verified Transit Seed Data (Stops, Core Route, and Vehicles)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VERIFIED BUS STOPS (Hubballi & Dharwad)
-- ---------------------------------------------------------------------
INSERT INTO bus_stops (id, stop_name, city, address, latitude, longitude) VALUES
('b0000000-0000-0000-0000-000000000001', 'Hubballi CBT (Hosur)', 'Hubballi', 'Central Bus Terminal, Hosur, Hubballi', 15.3524000, 75.1384000),
('b0000000-0000-0000-0000-000000000002', 'Hubballi Railway Station', 'Hubballi', 'Shree Siddharoodha Swamiji Station Road, Hubballi', 15.3441000, 75.1481000),
('b0000000-0000-0000-0000-000000000003', 'Keshwapur Circle', 'Hubballi', 'Kusugal Road Junction, Keshwapur, Hubballi', 15.3610000, 75.1465000),
('b0000000-0000-0000-0000-000000000004', 'BVB College / KLE Tech', 'Hubballi', 'Vidyanagar Main Road, Hubballi', 15.3725000, 75.1228000),
('b0000000-0000-0000-0000-000000000005', 'Unkal Lake Cross', 'Hubballi', 'Unkal Main Road / PB Road, Hubballi', 15.3852000, 75.1116000),
('b0000000-0000-0000-0000-000000000006', 'Bairidevarkoppa', 'Hubballi', 'BRTS Corridor, Bairidevarkoppa, Hubballi', 15.3980000, 75.0990000),
('b0000000-0000-0000-0000-000000000007', 'Amargol BRTS', 'Hubballi', 'APMC Market Road, Amargol, Hubballi', 15.4120000, 75.0845000),
('b0000000-0000-0000-0000-000000000008', 'Navanagar Bus Stop', 'Hubballi', 'High Court Bench & DC Office Road, Navanagar', 15.4285000, 75.0680000),
('b0000000-0000-0000-0000-000000000009', 'Rayapur BRTS', 'Dharwad', 'Industrial Estate, PB Road, Rayapur, Dharwad', 15.4420000, 75.0515000),
('b0000000-0000-0000-0000-000000000010', 'Sattur (SDM Hospital)', 'Dharwad', 'SDM Medical College & Hospital, Sattur, Dharwad', 15.4570000, 75.0390000),
('b0000000-0000-0000-0000-000000000011', 'Navalur BRTS', 'Dharwad', 'Navalur Railway Crossing, Dharwad', 15.4720000, 75.0270000),
('b0000000-0000-0000-0000-000000000012', 'Gandhinagar Stop', 'Dharwad', 'Gandhinagar Main Road, Dharwad', 15.4850000, 75.0180000),
('b0000000-0000-0000-0000-000000000013', 'Jubilee Circle', 'Dharwad', 'PB Road Junction, Central Dharwad', 15.4600000, 75.0100000),
('b0000000-0000-0000-0000-000000000014', 'Dharwad CBT (Old Bus Stand)', 'Dharwad', 'City Bus Terminal, Market Area, Dharwad', 15.4578000, 75.0062000),
('b0000000-0000-0000-0000-000000000015', 'Karnatak University (KUD)', 'Dharwad', 'Pavate Nagar Campus Main Gate, Dharwad', 15.4402000, 74.9855000)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 2. VERIFIED ROUTES
-- Route 100-HD: Hubballi CBT to Dharwad CBT via Navanagar (BRTS Corridor)
-- Route 100-DH: Dharwad CBT to Hubballi CBT via Navanagar (BRTS Corridor)
-- ---------------------------------------------------------------------
INSERT INTO routes (id, route_number, route_name, source, destination, city_coverage, status) VALUES
('c0000000-0000-0000-0000-000000000001', '100-HD', 'Hubballi CBT to Dharwad CBT (BRTS)', 'Hubballi CBT (Hosur)', 'Dharwad CBT (Old Bus Stand)', 'Hubballi-Dharwad', 'active'),
('c0000000-0000-0000-0000-000000000002', '100-DH', 'Dharwad CBT to Hubballi CBT (BRTS)', 'Dharwad CBT (Old Bus Stand)', 'Hubballi CBT (Hosur)', 'Hubballi-Dharwad', 'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 3. ROUTE STOPS (Ordered Sequence for 100-HD Forward Direction)
-- ---------------------------------------------------------------------
INSERT INTO route_stops (route_id, stop_id, stop_sequence, direction) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1, 'forward'),  -- Hubballi CBT
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 2, 'forward'),  -- Keshwapur Circle
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 3, 'forward'),  -- BVB College
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 4, 'forward'),  -- Unkal Lake
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 5, 'forward'),  -- Bairidevarkoppa
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 6, 'forward'),  -- Amargol BRTS
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 7, 'forward'),  -- Navanagar
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000009', 8, 'forward'),  -- Rayapur BRTS
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 9, 'forward'),  -- Sattur
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 10, 'forward'), -- Navalur BRTS
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 11, 'forward'), -- Gandhinagar
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000013', 12, 'forward'), -- Jubilee Circle
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000014', 13, 'forward')  -- Dharwad CBT
ON CONFLICT (route_id, stop_sequence, direction) DO NOTHING;

-- ---------------------------------------------------------------------
-- 4. REGISTERED KSRTC FLEET BUSES
-- ---------------------------------------------------------------------
INSERT INTO buses (id, bus_number, bus_type, route_id, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'KA-25-F-1001', 'Chigari BRTS', 'c0000000-0000-0000-0000-000000000001', 'active'),
('a0000000-0000-0000-0000-000000000002', 'KA-25-F-1002', 'City Ordinary', 'c0000000-0000-0000-0000-000000000001', 'active'),
('a0000000-0000-0000-0000-000000000003', 'KA-25-F-1003', 'Suvarna Express', 'c0000000-0000-0000-0000-000000000001', 'active'),
('a0000000-0000-0000-0000-000000000004', 'KA-25-F-1004', 'Chigari BRTS', 'c0000000-0000-0000-0000-000000000002', 'active')
ON CONFLICT (bus_number) DO NOTHING;
