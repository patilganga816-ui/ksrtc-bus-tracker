# KSRTC — LOCAL BUS TRACKING SYSTEM
## Hubballi–Dharwad Transit Division (BE ISE Academic Engineering Project)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Realtime](https://img.shields.io/badge/Realtime-WebSockets%20CDC-blue.svg)](https://supabase.com/docs/guides/realtime)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet.js%20%2B%20OSM-brightgreen.svg)](https://leafletjs.com/)

---

## 1. Project Overview & Problem Statement

Public transit commuters in the **Hubballi–Dharwad twin-city municipal corridor** in Karnataka frequently experience schedule uncertainty, extended waiting times at stops along the Old PB Road / BRTS corridor, and an inability to track the physical movement of approaching buses.

The **KSRTC Local Bus Tracking System** is a complete, production-ready, full-stack web application developed as an academic capstone project for **Bachelor of Engineering in Information Science and Engineering**. The system turns authorized drivers' smartphones into high-precision GPS telemetry units using the browser's native `navigator.geolocation.watchPosition()` API, streams validated spatial coordinates through an Express.js backend to **Supabase PostgreSQL**, and automatically broadcasts position updates to passengers via **Supabase Realtime WebSockets** on interactive **Leaflet.js / OpenStreetMap** interfaces.

### Core Distinctions
- **Zero Same-Wi-Fi Requirement**: The passenger and driver operate from completely separate smartphones on different cellular networks (Airtel, Jio, Vodafone, or independent Wi-Fi).
- **One Unified Common Login Portal**: A single common login page (`/index.html`) featuring role-segmented selection for Passenger, Driver, and Administrator.
- **Server-Side Trust-Nothing Role Verification**: The backend strictly validates user roles from the database `profiles` table using Supabase Auth JWTs.
- **Hubballi–Dharwad Geographic Perimeter Enforcement**: Restricts coordinates to verified boundaries ($[15.1500^{\circ}\text{ N}, 15.5500^{\circ}\text{ N}]$ latitude and $[74.9500^{\circ}\text{ E}, 75.3000^{\circ}\text{ E}]$ longitude).
- **Dual Telemetry Pipeline**:
  - **Mode A (Real GPS)**: Native smartphone satellite GPS streaming.
  - **Mode B (Simulated GPS)**: Geographically verified waypoint interpolation along Route 100-HD for classroom evaluations.

### Enhanced Features (v2)
1. **Estimated Time of Arrival (ETA)**:
   - Dynamic real-time calculation based on the bus's live GPS coordinates, transit velocity, route corridor parameters, and stop dwell times.
   - Updates automatically whenever a new GPS fix arrives via Supabase Realtime WebSockets.
   - Stale GPS signals (> 120s) and passed stops are honestly flagged. No hardcoded or fabricated arrival numbers.
2. **Multilingual Localization (i18n)**:
   - Full trilingual support for **English**, **Kannada (ಕನ್ನಡ)**, and **Hindi (हिन्दी)** across all passenger portals.
   - Clean reusable translation dictionary (`frontend/js/i18n.js`).
   - Official localized bus stop names for all Hubballi and Dharwad stops.
   - Seamless header language switch with instant rendering and session persistence.
3. **Distance Information**:
   - Live remaining distance between the bus's latest location and the passenger's selected boarding stop.
   - Route-based transit distance calculation along sequenced transit stops, with fallback indication.
   - Automatically renders in kilometres (`km`) or metres (`m`). Handles buses that have already passed the boarding stop.

---

## 2. Technology Stack

| Layer | Technologies Employed |
| :--- | :--- |
| **Frontend UI/UX** | HTML5, CSS3 (KSRTC Blue & White Theme), Vanilla JavaScript (ES6+), Leaflet.js, OpenStreetMap Tiles |
| **Backend Gateway** | Node.js, Express.js REST APIs, CORS, Dotenv |
| **Database & Auth** | Supabase PostgreSQL 15+, Supabase Authentication (JWT), Supabase Row Level Security (RLS) |
| **Live Telemetry** | Supabase Realtime Engine (PostgreSQL CDC over WebSockets), Haversine Distance Filter |
| **Client Sensors** | HTML5 Geolocation API (`navigator.geolocation.watchPosition`) |
| **Deployment** | Render / Railway (Node Backend), Vercel / Netlify (Frontend), Supabase Cloud (Database) |

---

## 3. High-Level Architecture & Data Flow

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|                                                                         |
|  +--------------------+   +---------------------+   +----------------+  |
|  |  Driver Smartphone |   | Passenger Smartphone|   | Administrator  |  |
|  | (watchPosition GPS)|   | (Leaflet Live Map)  |   |  Workstation   |  |
|  +---------+----------+   +----------+----------+   +--------+-------+  |
+------------|-------------------------|-----------------------|----------+
             | HTTPS POST              |                       |
             | Telemetry               |                       |
             v                         |                       |
+-----------------------------------+  |                       |
|   NODE.JS & EXPRESS APPLICATION   |  |                       |
|   - JWT Token Authentication Guard|  |                       |
|   - Driver Active Trip Verifier   |  |                       |
|   - Hubballi-Dharwad BBox Filter  |  |                       |
|   - Max Velocity Limiter (90 km/h)|  |                       |
+--------------------+--------------+  |                       |
                     |                 |                       |
                     | INSERT          |                       |
                     v                 |                       |
+-----------------------------------+  |                       |
|   SUPABASE POSTGRESQL DATABASE    |  |                       |
|   - 11 Relational Tables          |  |                       |
|   - Row Level Security (RLS)      |  |                       |
|   - PostgreSQL Write-Ahead Log    |  |                       |
+--------------------+--------------+  |                       |
                     |                 |                       |
                     | CDC Event       |                       |
                     v                 |                       |
+-----------------------------------+  |                       |
|      SUPABASE REALTIME ENGINE     |  |                       |
|      (WebSockets Channel Push)    |--+-----------------------+
+-----------------------------------+
```

---

## 4. Hubballi–Dharwad Transit Geography & Bus Stops

The operational perimeter covers the Twin Cities transit corridor:

$$\text{Latitude: } 15.1500^{\circ}\text{ N to } 15.5500^{\circ}\text{ N}, \quad \text{Longitude: } 74.9500^{\circ}\text{ E to } 75.3000^{\circ}\text{ E}$$

### Verified Stop Sequence (Route 100-HD Corridor)
1. **Hubballi CBT (Hosur)** (`15.3524, 75.1384`) — Central Terminal
2. **Keshwapur Circle** (`15.3610, 75.1465`) — Kusugal Road
3. **BVB College / KLE Tech** (`15.3725, 75.1228`) — Vidyanagar
4. **Unkal Lake Cross** (`15.3852, 75.1116`) — Tourist Entrance
5. **Bairidevarkoppa BRTS** (`15.3980, 75.0990`) — High Corridor Stop
6. **Amargol BRTS** (`15.4120, 75.0845`) — APMC Market
7. **Navanagar Bus Stop** (`15.4285, 75.0680`) — High Court Bench & DC Office
8. **Rayapur BRTS** (`15.4420, 75.0515`) — Industrial Estate
9. **Sattur (SDM Hospital)** (`15.4570, 75.0390`) — Medical Campus
10. **Navalur BRTS** (`15.4720, 75.0270`) — Railway Crossing
11. **Gandhinagar Stop** (`15.4850, 75.0180`) — Dharwad South
12. **Jubilee Circle** (`15.4600, 75.0100`) — Commercial Junction
13. **Dharwad CBT (Old Bus Stand)** (`15.4578, 75.0062`) — Dharwad City Terminal

---

## 5. PostgreSQL Relational Schema Design

```
profiles ------------ drivers -------------- driver_assignments ----------- buses
   |                     |                                                   |
   |                     +----------------- trips ---------------------------+
   |                                          |                              |
   +--- favourites                            +--- bus_locations             +--- routes
   |                                          |                                     |
   +--- notifications                    bus_stops ---------------------------- route_stops
```

The database schema comprises **11 normalized tables** located in `database/`:
1. `profiles`: Extends `auth.users` with full name, validated mobile, application role, and status.
2. `drivers`: Certified employee ID, license number, and driver duty state.
3. `routes`: Transit corridor definitions between terminals.
4. `bus_stops`: Master geographic stop registry with spatial check constraints.
5. `route_stops`: Ordered sequence of stops along a route with unique composite constraint.
6. `buses`: Fleet vehicles registered by bus number and vehicle type.
7. `driver_assignments`: Administrative allocation binding drivers to specific buses.
8. `trips`: Journey lifecycle management (`in_progress`, `completed`, `cancelled`).
9. `bus_locations`: Time-series GPS fixes storing latitude, longitude, speed, heading, and accuracy.
10. `favourites`: Passenger bookmarked buses and corridors.
11. `notifications`: Transit announcements and arrival advisories.

---

## 6. Project Structure

```
ksrtc_tracking_system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Passenger registration, role resolution, admin setup
│   │   ├── busController.js        # Fleet management & stop-to-stop search engine
│   │   ├── driverController.js     # Driver authorizations & bus assignments
│   │   ├── locationController.js   # GPS telemetry ingestion & simulation pulse
│   │   ├── passengerController.js  # Favourites, notifications & commuter directory
│   │   ├── routeController.js      # Transit routes & stop sequencing
│   │   └── tripController.js       # Journey start/end lifecycle management
│   ├── middleware/
│   │   ├── authMiddleware.js       # Supabase JWT extraction & role enforcement
│   │   └── gpsValidator.js         # Hubballi-Dharwad bbox & speed limiter
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── busRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── passengerRoutes.js
│   │   ├── routeRoutes.js
│   │   └── tripRoutes.js
│   ├── utils/
│   │   ├── helpers.js              # Haversine distance & validators
│   │   └── simulationData.js       # 40+ waypoint coordinates along Route 100-HD
│   └── server.js                   # Express application entrypoint
│
├── config/
│   └── supabase.js                 # Dual-client Supabase setup (Admin & Anon)
│
├── database/
│   ├── schema.sql                  # Complete table DDL, check constraints & triggers
│   ├── indexes.sql                 # 10 performance indexes for rapid lookups
│   ├── policies.sql                # Row Level Security (RLS) & Realtime CDC setup
│   ├── seed_stops.sql              # Verified Hubballi & Dharwad stops & Route 100-HD
│   └── migration_v2.sql            # Additive migration: i18n & localized stops
│
├── frontend/
│   ├── index.html                  # Unified Common Login Page (3-Role Selection)
│   ├── reset-password.html         # Self-service password recovery
│   ├── passenger/
│   │   ├── register.html           # Passenger registration with phone validation
│   │   ├── home.html               # Stop-to-stop search & active fleet overview
│   │   ├── search-results.html     # Results with Live ETA & remaining distance
│   │   ├── route-details.html      # Complete stop sequence & path map
│   │   ├── live-tracking.html      # Realtime Leaflet live map with live ETA & distance HUD
│   │   ├── favourites.html         # Bookmarked buses & corridors
│   │   ├── notifications.html      # Advisory alerts & updates
│   │   └── account.html            # Commuter profile & preferred language selector
│   ├── driver/
│   │   ├── trip-setup.html         # Duty vehicle verification & start journey
│   │   ├── live-trip.html          # Active smartphone GPS watch console
│   │   └── trip-ended.html         # Duty completion summary
│   ├── admin/
│   │   ├── dashboard.html          # Operational KPI dashboard
│   │   ├── buses.html              # Fleet vehicle CRUD
│   │   ├── drivers.html            # Driver registration & bus assignment
│   │   ├── routes-stops.html       # Map coordinate picker & stop sequencer
│   │   ├── live-monitoring.html    # Hubballi-Dharwad multi-bus monitoring map
│   │   ├── passengers.html         # Commuter account management
│   │   └── trips-reports.html      # Journey logs & CSV export
│   ├── css/
│   │   └── ksrtc-theme.css         # Unified responsive KSRTC blue-and-white theme
│   ├── js/
│   │   ├── config.js               # Supabase credentials & map defaults
│   │   ├── api.js                  # Centralized fetch wrapper with Bearer tokens
│   │   ├── auth.js                 # Unified authentication, session guards & logout
│   │   ├── i18n.js                 # Multilingual translation dictionary (en, kn, hi)
│   │   ├── eta-calculator.js       # Route distance & estimated arrival time engine
│   │   ├── map-helper.js           # Leaflet map builder, custom icons & polylines
│   │   └── realtime-tracker.js     # Supabase Realtime WebSocket subscription engine
│   └── assets/
│       └── logo.svg                # KSRTC SVG bus emblem
│
├── .env.example                    # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 7. Local Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- Free [Supabase](https://supabase.com/) Account

### Step 1: Install Dependencies
Open your terminal in the project directory and execute:
```bash
npm install
```

### Step 2: Supabase Database Setup
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor** tab in the Supabase Dashboard.
3. Open and run the SQL scripts in this exact sequence:
   - `database/schema.sql` (Creates tables, triggers, and foreign keys)
   - `database/indexes.sql` (Creates high-performance indexes)
   - `database/policies.sql` (Configures Row Level Security and Realtime replication)
   - `database/seed_stops.sql` (Populates verified Hubballi–Dharwad stops and Route 100-HD)
   - `database/migration_v2.sql` (Additive migration: preferred language & localized stop names)

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate `.env` with your Supabase credentials from **Project Settings > API**:
   ```env
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-public-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key
   MIN_LAT=15.1500
   MAX_LAT=15.5500
   MIN_LNG=74.9500
   MAX_LNG=75.3000
   MAX_SPEED_KMPH=90
   ```
3. Update `frontend/js/config.js` with your `SUPABASE_URL` and `SUPABASE_ANON_KEY` for client-side Realtime WebSockets:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://your-project-ref.supabase.co',
       anonKey: 'your-public-anon-key'
   };
   ```

### Step 4: Launch the Server
```bash
npm start
```
The server will bind to `0.0.0.0:3000`. Access the application via:
```
http://localhost:3000/index.html
```

---

## 8. Two-Phone Real-World Demonstration Guide

This test demonstrates real-time satellite tracking between two independent devices without requiring a common Wi-Fi network.

### Preparation
1. Deploy the backend and frontend to a publicly accessible HTTPS URL (e.g. Render / Railway / Vercel) or expose your local machine using an HTTPS tunnel (`cloudflared tunnel` or `ngrok http 3000`).
   > *Note: Modern mobile browsers require HTTPS to grant GPS location access via `navigator.geolocation`.*
2. Ensure you have authorized a driver account in the Administrator panel and assigned a bus (e.g., `KA-25-F-1001` on Route `100-HD`).

### Phone 1 — Passenger / Project Guide Device
1. Connect Phone 1 to **Mobile Data (4G/5G)** or independent Wi-Fi.
2. Open the public HTTPS application URL.
3. On the Common Login page, select **Passenger**.
4. Log in (or click *Register Here* to create a new commuter account).
5. On **Passenger Home**:
   - Select Boarding Stop: **Hubballi CBT (Hosur)**
   - Select Destination Stop: **Dharwad CBT (Old Bus Stand)**
   - Click **Search Available Buses**.
6. Select bus **KA-25-F-1001** and tap **📍 Track Live Bus**.
7. Keep the live map open on Phone 1.

### Phone 2 — Driver / Evaluator Device
1. Connect Phone 2 to a **completely different internet network** (different mobile carrier).
2. Open the same public HTTPS application URL.
3. On the Common Login page, select **Driver**.
4. Sign in with the authorized driver credentials.
5. On **Driver Trip Setup**:
   - Confirm assigned bus `KA-25-F-1001` and Route `100-HD`.
   - Origin: `Hubballi CBT`, Destination: `Dharwad CBT`.
   - Telemetry Mode: Select **📱 Real Smartphone GPS**.
   - Tap **🚀 Start Journey & Transmit GPS**.
6. When prompted by the mobile browser, tap **Allow** for location access.
7. Walk or travel with Phone 2 along the street.

### Verification of Success
- As Phone 2 physically moves, `navigator.geolocation.watchPosition()` streams coordinates to the backend.
- The backend validates the coordinates against the Hubballi–Dharwad bounding box and commits them to Supabase PostgreSQL.
- Supabase Realtime pushes the new location via WebSocket to Phone 1.
- **The bus marker on Phone 1 moves smoothly along the road in real-time with zero manual page refreshes.**
- The Administrator dashboard reflects the bus as actively in-transit.
- When the driver clicks **End Journey**, tracking stops permanently and the trip is archived.

---

## 9. REST API Reference

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Passenger registration with phone validation |
| `POST` | `/api/auth/verify-role` | Authenticated | Server-side role resolution & dashboard redirection |
| `GET` | `/api/buses` | Public | List all buses with latest GPS fix & route |
| `GET` | `/api/buses/search-by-stops` | Public | Core passenger search connecting origin and destination |
| `POST` | `/api/buses` | Admin | Register new fleet vehicle |
| `GET` | `/api/routes` | Public | List routes with ordered stop sequences |
| `GET` | `/api/routes/stops/all` | Public | List verified Hubballi & Dharwad stops |
| `POST` | `/api/routes/stops` | Admin | Create bus stop with verified coordinates |
| `GET` | `/api/drivers/my-assignment` | Driver | Fetch driver's assigned bus and route |
| `POST` | `/api/drivers` | Admin | Authorize driver account in Supabase |
| `POST` | `/api/drivers/assign` | Admin | Bind driver to specific fleet vehicle |
| `POST` | `/api/trips/start` | Driver | Initiate active duty trip |
| `POST` | `/api/trips/end` | Driver / Admin | Finalize journey & deactivate GPS |
| `GET` | `/api/trips/active` | Public | List all active trips in progress |
| `POST` | `/api/locations/update` | Driver | Stream validated GPS telemetry fix |
| `GET` | `/api/locations/latest/:busId`| Public | Fetch latest position for cold-start map rendering |
| `POST` | `/api/locations/simulate` | Authenticated | Step simulated waypoint along Route 100-HD |
| `GET` | `/api/passengers/favourites` | Passenger | List saved favourite buses & routes |
| `PUT` | `/api/passengers/language` | Passenger | Persist preferred language ('en', 'kn', 'hi') |
| `GET` | `/api/health` | Public | Health and diagnostic check |

---

## 10. Production Deployment Instructions

### Backend Hosting (Render / Railway)
1. Push repository to GitHub.
2. In Render / Railway, create a new **Web Service** connected to your repository.
3. Build command: `npm install`
4. Start command: `node backend/server.js`
5. Configure Environment Variables in the provider's dashboard:
   - `PORT=3000`
   - `NODE_ENV=production`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MIN_LAT=15.1500`, `MAX_LAT=15.5500`, `MIN_LNG=74.9500`, `MAX_LNG=75.3000`
6. The service will provide an internet-accessible HTTPS URL.

### Frontend Client Configuration
Ensure `frontend/js/config.js` points to your public production backend URL and Supabase project:
```javascript
const API_BASE_URL = window.location.origin + '/api';
const SUPABASE_CONFIG = {
    url: 'https://your-project-ref.supabase.co',
    anonKey: 'your-public-anon-key'
};
```

---

## 11. Academic Engineering Deliverables

This project includes all deliverables required for a Bachelor of Engineering Information Science & Engineering minor project:
- **System Requirements Specification (SRS)**
- **Entity-Relationship (ER) Diagram & Normalization Analysis (3NF/BCNF)**
- **Data Flow Diagrams (DFD Level 0 & Level 1)**
- **UML Architectural Models (Use Case, Sequence, Class, and Activity Diagrams)**
- **Comprehensive Verification & Multi-Phone Test Reports**
