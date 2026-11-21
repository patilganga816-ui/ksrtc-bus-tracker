// =====================================================================
// KSRTC Local Bus Tracking System — Route & Stop Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public & Commuter Endpoints
router.get('/', routeController.getAllRoutes);
router.get('/stops/all', routeController.getAllStops);
router.get('/:id', routeController.getRouteById);

// Admin-only Stop & Route Configuration Endpoints
router.post('/', authenticateToken, requireAdmin, routeController.addRoute);
router.post('/stops', authenticateToken, requireAdmin, routeController.addStop);
router.put('/stops/:id', authenticateToken, requireAdmin, routeController.updateStop);
router.post('/:route_id/stops', authenticateToken, requireAdmin, routeController.configureRouteStops);

module.exports = router;
