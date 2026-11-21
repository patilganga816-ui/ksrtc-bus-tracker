// =====================================================================
// KSRTC Local Bus Tracking System — Driver Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateToken, requireAdmin, requireDriver } = require('../middleware/authMiddleware');

// Driver Portal: Get own assignment
router.get('/my-assignment', authenticateToken, requireDriver, driverController.getDriverAssignment);

// Admin Management Endpoints
router.get('/', authenticateToken, requireAdmin, driverController.getAllDrivers);
router.post('/', authenticateToken, requireAdmin, driverController.createDriver);
router.post('/assign', authenticateToken, requireAdmin, driverController.assignBus);

module.exports = router;
