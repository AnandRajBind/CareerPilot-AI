import { useCallback, useMemo, useState } from 'react'
import { useMedia } from '../context/MediaContext'

const INTERNET_THRESHOLDS = {
  excellent: 80,
  good: 150,
}

export const useSystemCheck = () => {
  const {
    cameraStream,
    setCameraStream,
    screenStream,
    setScreenStream,
    microphoneTrack,
    setMicrophoneTrack,
  } = useMedia()

  const [cameraReady, setCameraReady] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [screenReady, setScreenReady] = useState(false)
  const [internetStatus, setInternetStatus] = useState('checking')
  const [lastPingMs, setLastPingMs] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const testInternet = useCallback(async () => {
    setInternetStatus('checking')
    setLastPingMs(null)
    try {
      const start = performance.now()
      const response = await fetch('http://localhost:5000/api/health', {
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
    } catch (err) {
      setCameraReady(false)
      setMicReady(false)
      setErrorMessage('Camera or microphone permission denied. Please allow access.')
    }
  }, [setCameraStream, setMicrophoneTrack])

  const checkScreenShare = useCallback(async () => {
    setErrorMessage('')
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      })

      const track = stream.getVideoTracks()[0]
      const settings = track.getSettings()

      if (settings.displaySurface && settings.displaySurface !== 'monitor') {
        stream.getTracks().forEach((t) => t.stop())
        setScreenReady(false)
        setErrorMessage('Please share entire screen.')
        return
      }

      track.onended = () => {
        setScreenReady(false)
        setScreenStream(null)
        setErrorMessage('Screen sharing stopped. Please share your entire screen again.')
      }

      setScreenStream(stream)
      setScreenReady(true)
    } catch (err) {
      setScreenReady(false)
      setErrorMessage('Screen share permission denied. Please allow access.')
    }
  }, [setScreenStream])

  const internetOk = internetStatus === 'excellent' || internetStatus === 'good'
  const canStart = cameraReady && micReady && screenReady && internetOk

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
    canStart,
    setErrorMessage,
    testInternet,
    checkCameraAndMic,
    checkScreenShare,
  }
}
