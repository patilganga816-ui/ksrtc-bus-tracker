// =====================================================================
// KSRTC Local Bus Tracking System — Passenger Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');
const { authenticateToken, requireAdmin, requirePassenger } = require('../middleware/authMiddleware');

// Passenger Private Endpoints
router.get('/favourites', authenticateToken, requirePassenger, passengerController.getFavourites);
router.post('/favourites', authenticateToken, requirePassenger, passengerController.addFavourite);
router.delete('/favourites/:id', authenticateToken, requirePassenger, passengerController.removeFavourite);

router.get('/notifications', authenticateToken, requirePassenger, passengerController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, requirePassenger, passengerController.markNotificationRead);
router.put('/language', authenticateToken, requirePassenger, passengerController.updateLanguagePreference);

// Administrator Passenger Management
router.get('/', authenticateToken, requireAdmin, passengerController.getAllPassengers);
router.patch('/:id/status', authenticateToken, requireAdmin, passengerController.updatePassengerStatus);

module.exports = router;
