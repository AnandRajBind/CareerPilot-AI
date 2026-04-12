import { useCallback, useEffect, useState } from 'react'

export const useScreenShare = () => {
  const [screenStream, setScreenStream] = useState(null)
  const [screenReady, setScreenReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Validate that only entire screen is shared
  const validateScreenShare = (videoTrack) => {
    const settings = videoTrack.getSettings()
    if (settings.displaySurface && settings.displaySurface !== 'monitor') {
      setScreenReady(false)
      setErrorMessage('Please share your entire screen for the interview.')
      return false
    }
    return true
  }

  const checkScreenShare = useCallback(async () => {
    setErrorMessage('')
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
      })

      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) {
        throw new Error('No video track found')
      }

      // Validate entire screen only
      if (!validateScreenShare(videoTrack)) {
        stream.getTracks().forEach((track) => track.stop())
        return false
      }

      // Stop stream when user stops sharing
      videoTrack.onended = () => {
        setScreenReady(false)
        setScreenStream(null)
        setErrorMessage('Screen sharing stopped.')
      }

      setScreenStream(stream)
      setScreenReady(true)
      return true
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Screen share permission denied.')
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('No screen found to share.')
      } else {
        setErrorMessage('Failed to start screen share.')
      }
      setScreenReady(false)
      return false
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
      setScreenStream(null)
      setScreenReady(false)
    }
  }, [screenStream])

  // Continuous monitoring - check every 5 seconds if screen share is still active
  useEffect(() => {
    if (!screenReady || !screenStream) return

    const monitorInterval = setInterval(() => {
      const videoTrack = screenStream.getVideoTracks()[0]
      if (!videoTrack || videoTrack.readyState === 'ended' || !videoTrack.enabled) {
        setScreenReady(false)
        setErrorMessage('Screen share connection lost.')
      }
    }, 5000)

    return () => clearInterval(monitorInterval)
  }, [screenReady, screenStream])

  return {
    screenStream,
    screenReady,
    errorMessage,
    checkScreenShare,
    stopScreenShare,
    setErrorMessage,
  }
}
