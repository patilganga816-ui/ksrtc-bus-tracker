// =====================================================================
// KSRTC Local Bus Tracking System — Voice Routes (Deepgram Integration)
// =====================================================================

const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

// POST /api/voice/speak — Generate Deepgram AI Voice audio for next stop announcements
router.post('/speak', voiceController.generateSpeech);

module.exports = router;
