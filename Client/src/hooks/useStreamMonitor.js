import { useEffect, useState } from 'react'

const DEFAULT_WARNING = 'Required permissions lost. Please re-enable camera, microphone, or screen sharing.'

export const useStreamMonitor = ({
  cameraStream,
  screenStream,
  microphoneTrack,
  pingUrl = 'http://localhost:9000/api/health',
  intervalMs = 5000,
}) => {
  const [streamsOk, setStreamsOk] = useState(true)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    let isActive = true

    const checkOnce = async () => {
      const cameraTrack = cameraStream?.getVideoTracks()?.[0]
      const screenTrack = screenStream?.getVideoTracks()?.[0]
      const cameraOk = Boolean(cameraTrack && cameraTrack.readyState === 'live' && cameraTrack.enabled)
      const screenOk = Boolean(screenTrack && screenTrack.readyState === 'live' && screenTrack.enabled)
      const micOk = Boolean(microphoneTrack && microphoneTrack.readyState === 'live' && microphoneTrack.enabled)

      let internetOk = navigator.onLine
      if (internetOk) {
        try {
          const response = await fetch(pingUrl, { cache: 'no-store' })
          internetOk = response.ok
        } catch (err) {
          internetOk = false
        }
      }

      if (!isActive) return

      const ok = cameraOk && screenOk && micOk && internetOk
      setStreamsOk(ok)
      setWarning(ok ? '' : DEFAULT_WARNING)
    }

    checkOnce()
    const interval = setInterval(checkOnce, intervalMs)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [cameraStream, screenStream, microphoneTrack, pingUrl, intervalMs])

  return { streamsOk, warning }
}
