// =====================================================================
// KSRTC Local Bus Tracking System — Auth Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', authController.registerPassenger);
router.post('/verify-role', authController.verifySessionAndRole);
router.post('/setup-initial-admin', authController.setupInitialAdmin);

// Protected profile endpoints
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
