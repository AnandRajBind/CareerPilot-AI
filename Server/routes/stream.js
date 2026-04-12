const express = require('express')
const streamController = require('../controllers/streamController')

const router = express.Router()

/**
 * Stream Video API Routes
 * Public endpoints (no authentication required for compatibility)
 */

// Generate Stream token
router.post('/token', streamController.getStreamToken)

// Initialize call
router.post('/call/init', streamController.initializeCall)

// Toggle recording
router.post('/call/recording', streamController.toggleRecording)

// End session
router.post('/call/end', streamController.endSession)

module.exports = router
