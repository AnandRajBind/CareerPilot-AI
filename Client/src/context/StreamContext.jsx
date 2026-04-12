import React, { createContext, useContext, useState, useCallback } from 'react'

const StreamContext = createContext(null)

export const useStream = () => {
  const context = useContext(StreamContext)
  if (!context) {
    throw new Error('useStream must be used within StreamProvider')
  }
  return context
}

export const StreamProvider = ({ children }) => {
  const [call, setCall] = useState(null)
  const [client, setClient] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  const initializeStream = useCallback(async (token, userId) => {
    try {
      setError(null)
      
      // Lazy load Stream SDK only when needed
      const { StreamClient } = await import('@stream-io/video-client')
      
      if (!process.env.REACT_APP_STREAM_API_KEY) {
        throw new Error('Stream API key not configured')
      }

      const streamClient = new StreamClient({
        apiKey: process.env.REACT_APP_STREAM_API_KEY,
        token,
        user: {
          id: userId,
          name: `User ${userId}`,
        },
      })

      setClient(streamClient)
      setIsInitialized(true)
    } catch (err) {
      console.error('Stream initialization error:', err)
      setError(err.message)
      setIsFallbackMode(true)
    }
  }, [])

  const createVideoCall = useCallback(async (callId) => {
    try {
      if (!client) {
        throw new Error('Stream client not initialized')
      }

      const newCall = client.call('default', callId)
      await newCall.join({ create: true })
      setCall(newCall)
      return newCall
    } catch (err) {
      console.error('Failed to create video call:', err)
      setError(err.message)
      setIsFallbackMode(true)
      throw err
    }
  }, [client])

  const endVideoCall = useCallback(async () => {
    try {
      if (call) {
        await call.leave()
        setCall(null)
      }
    } catch (err) {
      console.error('Error ending call:', err)
    }
  }, [call])

  const toggleVideo = useCallback(async (enabled) => {
    try {
      if (call) {
        await call.camera.toggle(enabled)
      }
    } catch (err) {
      console.error('Error toggling video:', err)
    }
  }, [call])

  const toggleMicrophone = useCallback(async (enabled) => {
    try {
      if (call) {
        await call.microphone.toggle(enabled)
      }
    } catch (err) {
      console.error('Error toggling microphone:', err)
    }
  }, [call])

  const value = {
    call,
    client,
    isInitialized,
    error,
    isFallbackMode,
    setIsFallbackMode,
    initializeStream,
    createVideoCall,
    endVideoCall,
    toggleVideo,
    toggleMicrophone,
  }

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
}

export default StreamContext
