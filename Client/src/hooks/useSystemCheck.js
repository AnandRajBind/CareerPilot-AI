import { useCallback, useEffect, useState } from 'react'
import { useMedia } from '../context/MediaContext'
import { useScreenShare } from './useScreenShare'

const INTERNET_THRESHOLDS = {
  excellent: 80,
  good: 150,
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api'

export const useSystemCheck = () => {
  const {
    cameraStream,
    setCameraStream,
    microphoneTrack,
    setMicrophoneTrack,
  } = useMedia()

  const {
    screenStream,
    screenReady,
    errorMessage: screenError,
    checkScreenShare,
    stopScreenShare,
  } = useScreenShare()

  const [cameraReady, setCameraReady] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [internetStatus, setInternetStatus] = useState('checking')
  const [lastPingMs, setLastPingMs] = useState(null)
  const [permissionLost, setPermissionLost] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Use screen error if available
  useEffect(() => {
    if (screenError) {
      setErrorMessage(screenError)
    }
  }, [screenError])

  const testInternet = useCallback(async () => {
    setInternetStatus('checking')
    setLastPingMs(null)
    try {
      const start = performance.now()
      const response = await fetch(`${API_URL}/health`, {
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error('Health check failed')
      }
      const elapsed = Math.round(performance.now() - start)
      setLastPingMs(elapsed)

      if (elapsed < INTERNET_THRESHOLDS.excellent) {
        setInternetStatus('excellent')
      } else if (elapsed < INTERNET_THRESHOLDS.good) {
        setInternetStatus('good')
      } else {
        setInternetStatus('poor')
      }
    } catch (err) {
      setInternetStatus('poor')
    }
  }, [])

  const checkCameraAndMic = useCallback(async () => {
    setErrorMessage('')
    setPermissionLost(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      const audioTrack = stream.getAudioTracks()[0] || null
      setCameraStream(stream)
      setMicrophoneTrack(audioTrack)
      setCameraReady(true)
      setMicReady(Boolean(audioTrack))
      return true
    } catch (err) {
      setCameraReady(false)
      setMicReady(false)
      setErrorMessage('Camera or microphone permission denied. Please allow access.')
      return false
    }
  }, [setCameraStream, setMicrophoneTrack])

  // Continuous monitoring - every 5 seconds check if devices are still active
  useEffect(() => {
    const monitoringInterval = setInterval(() => {
      let anyLost = false

      // Check camera
      if (cameraStream) {
        const videoTrack = cameraStream.getVideoTracks()[0]
        if (!videoTrack || !videoTrack.enabled || videoTrack.readyState === 'ended') {
          setCameraReady(false)
          anyLost = true
        }
      }

      // Check microphone
      if (microphoneTrack) {
        if (!microphoneTrack.enabled || microphoneTrack.readyState === 'ended') {
          setMicReady(false)
          anyLost = true
        }
      }

      if (anyLost) {
        setPermissionLost(true)
        setErrorMessage('One or more permissions were lost. Please re-enable them.')
      }
    }, 5000)

    return () => clearInterval(monitoringInterval)
  }, [cameraStream, microphoneTrack])

  const internetOk = internetStatus === 'excellent' || internetStatus === 'good'
  const canStart = cameraReady && micReady && screenReady && internetOk && !permissionLost

  return {
    cameraStream,
    screenStream,
    microphoneTrack,
    cameraReady,
    micReady,
    screenReady,
    internetStatus,
    lastPingMs,
    errorMessage,
    permissionLost,
    canStart,
    setErrorMessage,
    testInternet,
    checkCameraAndMic,
    checkScreenShare,
    stopScreenShare,
  }
}
