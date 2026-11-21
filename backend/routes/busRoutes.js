// =====================================================================
// KSRTC Local Bus Tracking System — Bus Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public & Passenger Accessible Endpoints
router.get('/', busController.getAllBuses);
router.get('/search', busController.searchBuses);
router.get('/search-by-stops', busController.findBusesBetweenStops);
router.get('/:id', busController.getBusById);

// Protected Administrator Endpoints
router.post('/', authenticateToken, requireAdmin, busController.addBus);
router.put('/:id', authenticateToken, requireAdmin, busController.updateBus);
router.delete('/:id', authenticateToken, requireAdmin, busController.deleteBus);

module.exports = router;
