import { useEffect, useRef } from 'react'

const BLOCKED_KEYS = ['c', 'v', 'x', 'a']

export const useSecurityControls = (enabled, onWarn) => {
  const warnTimeoutRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const triggerWarn = (message) => {
      if (warnTimeoutRef.current) {
        clearTimeout(warnTimeoutRef.current)
      }
      onWarn(message)
      warnTimeoutRef.current = setTimeout(() => {
        onWarn('')
      }, 2500)
    }

    const handleClipboard = (event) => {
      event.preventDefault()
      triggerWarn('Copying or pasting during the interview is not allowed.')
    }

    const handleContextMenu = (event) => {
      event.preventDefault()
      triggerWarn('Right click is disabled during the interview.')
    }

    const handleKeyDown = (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      const key = event.key.toLowerCase()
      if (BLOCKED_KEYS.includes(key)) {
        event.preventDefault()
        triggerWarn('Copying or pasting during the interview is not allowed.')
      }
    }

    document.addEventListener('copy', handleClipboard)
    document.addEventListener('paste', handleClipboard)
    document.addEventListener('cut', handleClipboard)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('copy', handleClipboard)
      document.removeEventListener('paste', handleClipboard)
      document.removeEventListener('cut', handleClipboard)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      if (warnTimeoutRef.current) {
        clearTimeout(warnTimeoutRef.current)
      }
    }
  }, [enabled, onWarn])
}
