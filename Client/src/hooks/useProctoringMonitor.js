import { useEffect, useRef, useState } from 'react'

const TERMINATION_MESSAGE = 'Suspicious activity detected. Interview terminated.'

export const useProctoringMonitor = ({ enabled, onWarning, onTerminate }) => {
  const [violationCount, setViolationCount] = useState(0)
  const warningTimeoutRef = useRef(null)
  const fullscreenRequestedRef = useRef(false)
  const ignoreNextFullscreenRef = useRef(false)
  const ignoreFirstFullscreenViolationRef = useRef(true)

  useEffect(() => {
    if (!enabled) return

    const requestFullscreen = async () => {
      if (fullscreenRequestedRef.current) return
      fullscreenRequestedRef.current = true
      try {
        if (!document.fullscreenElement) {
          ignoreNextFullscreenRef.current = true
          await document.documentElement.requestFullscreen()
        }
      } catch (err) {
        if (ignoreFirstFullscreenViolationRef.current) {
          ignoreFirstFullscreenViolationRef.current = false
          return
        }
        handleViolation('Fullscreen is required. Please allow fullscreen.')
      }
    }

    const handleViolation = (message) => {
      setViolationCount((prev) => {
        const next = prev + 1
        if (next >= 3) {
          onTerminate(TERMINATION_MESSAGE)
          return next
        }
        const warningMessage = next === 2 ? 'Final warning: ' + message : message
        onWarning(next, warningMessage)
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current)
        }
        warningTimeoutRef.current = setTimeout(() => {
          onWarning(next, '')
        }, 2500)
        return next
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('Tab switch detected.')
      }
    }

    const handleBlur = () => {
      handleViolation('Window switch detected.')
    }

    const handleContextMenu = (event) => {
      event.preventDefault()
      handleViolation('Right click detected.')
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        if (ignoreNextFullscreenRef.current) {
          ignoreNextFullscreenRef.current = false
          return
        }
        if (ignoreFirstFullscreenViolationRef.current) {
          ignoreFirstFullscreenViolationRef.current = false
          return
        }
        handleViolation('Exited fullscreen mode.')
      }
    }

    requestFullscreen()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('contextmenu', handleContextMenu, true)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('contextmenu', handleContextMenu, true)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      fullscreenRequestedRef.current = false
      ignoreFirstFullscreenViolationRef.current = true
    }
  }, [enabled, onWarning, onTerminate])

  return { violationCount }
}
