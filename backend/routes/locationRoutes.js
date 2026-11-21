// =====================================================================
// KSRTC Local Bus Tracking System — Location & Telemetry Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateGPSCoordinates } = require('../middleware/gpsValidator');

// Public tracking query endpoints
router.get('/latest/:busId', locationController.getLatestBusLocation);
router.get('/trip/:tripId', locationController.getTripLocations);

// Protected telemetry recording from Driver Phone
router.post('/update', authenticateToken, validateGPSCoordinates, locationController.recordLocation);

// Simulated GPS Step Endpoint (Used in classroom testing mode)
router.post('/simulate', authenticateToken, locationController.simulateGPSStep);

module.exports = router;
