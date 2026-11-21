// =====================================================================
// KSRTC LOCAL BUS TRACKING SYSTEM (Hubballi–Dharwad Region)
// Node.js & Express Application Server
// =====================================================================

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { testSupabaseConnection } = require('../config/supabase');

// Import Application API Routers
const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const routeRoutes = require('./routes/routeRoutes');
const driverRoutes = require('./routes/driverRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const tripRoutes = require('./routes/tripRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();
const server = http.createServer(app);

// 1. Cross-Origin Resource Sharing (CORS) & Body Parsers
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Serve Static Frontend Files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 3. Mount Application REST APIs
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);

// 4. API Health & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'KSRTC Local Bus Tracking API',
        coverage: 'Hubballi–Dharwad Transit Region',
        database: 'Supabase PostgreSQL',
        realtime: 'Supabase Realtime (WebSockets)',
        timestamp: new Date().toISOString()
    });
});

// 5. Default Route -> Serves Common Login Page
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// 6. 404 Handler for Unrecognized API Routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint '${req.originalUrl}' does not exist.`
    });
});

// 7. Initialize Server and Test Supabase Connectivity
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`================================================================`);
    console.log(`🚌 KSRTC LOCAL BUS TRACKING SYSTEM (Hubballi–Dharwad Corridor)`);
    console.log(`🚀 Server active on port ${PORT}`);
    console.log(`🌐 Public Common Login Portal: http://localhost:${PORT}/index.html`);
    console.log(`================================================================`);
    await testSupabaseConnection();
});

module.exports = { app, server };
