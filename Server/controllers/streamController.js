const { buildError } = require('../utils/errorBuilder')

// Initialize Stream Server Client - Optional (only if installed)
const streamApiKey = process.env.STREAM_API_KEY
const streamApiSecret = process.env.STREAM_API_SECRET

let streamClient = null
let streamAvailable = false

// Try to load Stream SDK only if credentials are configured
if (streamApiKey && streamApiSecret) {
  try {
    const { StreamClient } = require('@stream-io/server-side-sdk')
    streamClient = new StreamClient({
      apiKey: streamApiKey,
      secret: streamApiSecret,
    })
    streamAvailable = true
    console.log('[Stream SDK] Initialized successfully')
  } catch (err) {
    console.warn('[Stream SDK] Not installed or failed to initialize:', err.message)
    streamAvailable = false
  }
} else {
  console.warn('[Stream SDK] Credentials not configured in environment variables')
}

/**
 * Generate Stream API token for user
 * POST /api/stream/token
 */
const getStreamToken = async (req, res, next) => {
  try {
    if (!streamAvailable || !streamClient) {
      throw buildError(
        'Video service not available. Using text-based interview instead.',
        503
      )
    }

    const { userId } = req.body

    if (!userId) {
      throw buildError('User ID is required', 400)
    }

    // Generate token valid for 24 hours
    const token = streamClient.generateUserToken({
      user_id: userId,
      aud: 'video-call',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    })

    res.status(200).json({
      success: true,
      data: {
        token,
        apiKey: streamApiKey,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Initialize Stream video call
 * POST /api/stream/call/init
 */
const initializeCall = async (req, res, next) => {
  try {
    if (!streamAvailable) {
      throw buildError('Video service not available', 503)
    }

    const { callId, userId } = req.body

    if (!callId || !userId) {
      throw buildError('Call ID and User ID are required', 400)
    }

    // Create call data
    const callData = {
      id: callId,
      created_by_user_id: userId,
      settings: {
        audio: {
          access_request_enabled: true,
        },
        video: {
          access_request_enabled: true,
          target_resolution: {
            width: 1280,
            height: 720,
          },
        },
        screen_sharing: {
          access_request_enabled: true,
          enabled: true,
        },
        recording: {
          enabled: true,
          mode: 'available',
        },
      },
    }

    // Initialize call on Stream platform
    // Note: This is a placeholder - actual implementation depends on Stream SDK methods
    // The call will be created when users join

    res.status(200).json({
      success: true,
      data: {
        callId,
        initialized: true,
        features: {
          video: true,
          audio: true,
          screenShare: true,
          recording: true,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Toggle session recording
 * POST /api/stream/call/recording
 */
const toggleRecording = async (req, res, next) => {
  try {
    const { callId, enabled } = req.body

    if (!callId) {
      throw buildError('Call ID is required', 400)
    }

    res.status(200).json({
      success: true,
      data: {
        callId,
        recording: enabled,
        message: `Recording ${enabled ? 'started' : 'stopped'}`,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * End interview session
 * POST /api/stream/call/end
 */
const endSession = async (req, res, next) => {
  try {
    const { callId, sessionData } = req.body

    if (!callId) {
      throw buildError('Call ID is required', 400)
    }

    // Log session end data (could be saved to database or sent to analytics)
    console.log(`Session ended for call: ${callId}`, sessionData)

    res.status(200).json({
      success: true,
      data: {
        callId,
        ended: true,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getStreamToken,
  initializeCall,
  toggleRecording,
  endSession,
}
