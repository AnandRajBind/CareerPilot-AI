const jwt = require('jsonwebtoken')

/**
 * Get Stream Token
 * Generates a JWT token for Stream SDK authentication
 */
const getStreamToken = async (req, res, next) => {
  try {
    const { userId, userName } = req.body

    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'userId and userName are required',
      })
    }

    // Generate JWT token for Stream SDK
    const token = jwt.sign(
      {
        user_id: userId,
        user_name: userName,
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      token,
      userId,
      userName,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Initialize Call
 */
const initializeCall = async (req, res, next) => {
  try {
    const { callId, userId, interviewData } = req.body

    if (!callId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'callId and userId are required',
      })
    }

    res.json({
      success: true,
      message: 'Call initialized successfully',
      callId,
      userId,
      interviewData: interviewData || null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Toggle Recording
 */
const toggleRecording = async (req, res, next) => {
  try {
    const { callId, isRecording } = req.body

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: 'callId is required',
      })
    }

    res.json({
      success: true,
      message: isRecording ? 'Recording started' : 'Recording stopped',
      callId,
      isRecording: Boolean(isRecording),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * End Session
 */
const endSession = async (req, res, next) => {
  try {
    const { callId, userId } = req.body

    if (!callId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'callId and userId are required',
      })
    }

    res.json({
      success: true,
      message: 'Session ended successfully',
      callId,
      userId,
      endedAt: new Date().toISOString(),
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
