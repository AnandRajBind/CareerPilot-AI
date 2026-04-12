import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

/**
 * Get Stream API token for video call
 * @param {string} userId - User ID for the token
 * @returns {Promise<string>} Stream API token
 */
export const getStreamToken = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE}/stream/token`, { userId })

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get Stream token')
    }

    return response.data.data.token
  } catch (error) {
    console.error('Error getting Stream token:', error)
    throw error
  }
}

/**
 * Initialize Stream call for interview
 * @param {string} callId - Unique call ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} Call initialization data
 */
export const initializeStreamCall = async (callId, userId) => {
  try {
    const response = await axios.post(`${API_BASE}/stream/call/init`, {
      callId,
      userId,
    })

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to initialize call')
    }

    return response.data.data
  } catch (error) {
    console.error('Error initializing Stream call:', error)
    throw error
  }
}

/**
 * Record interview session
 * @param {string} callId - Call ID
 * @param {boolean} enabled - Enable/disable recording
 * @returns {Promise<object>} Recording status
 */
export const toggleSessionRecording = async (callId, enabled) => {
  try {
    const response = await axios.post(`${API_BASE}/stream/call/recording`, {
      callId,
      enabled,
    })

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to toggle recording')
    }

    return response.data.data
  } catch (error) {
    console.error('Error toggling recording:', error)
    throw error
  }
}

/**
 * End interview session
 * @param {string} callId - Call ID
 * @param {object} sessionData - Session data to save
 * @returns {Promise<object>} Session end confirmation
 */
export const endInterviewSession = async (callId, sessionData) => {
  try {
    const response = await axios.post(`${API_BASE}/stream/call/end`, {
      callId,
      sessionData,
    })

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to end session')
    }

    return response.data.data
  } catch (error) {
    console.error('Error ending session:', error)
    throw error
  }
}

export default {
  getStreamToken,
  initializeStreamCall,
  toggleSessionRecording,
  endInterviewSession,
}
