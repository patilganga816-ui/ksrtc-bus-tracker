// =====================================================================
// KSRTC Local Bus Tracking System — Trip Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken, requireDriver } = require('../middleware/authMiddleware');

// Public/Commuter: Retrieve active trips for tracking
router.get('/active', tripController.getActiveTrips);
router.get('/history', authenticateToken, tripController.getTripHistory);

// Driver Trip Lifecycle
router.post('/start', authenticateToken, requireDriver, tripController.startTrip);
router.post('/end', authenticateToken, tripController.endTrip);

module.exports = router;
