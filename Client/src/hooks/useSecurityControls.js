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
      event.stopPropagation()
      triggerWarn('Copying or pasting during the interview is not allowed.')
    }

    const handleContextMenu = (event) => {
      event.preventDefault()
      event.stopPropagation()
      triggerWarn('Right click is disabled during the interview.')
    }

    const handleKeyDown = (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      const key = event.key.toLowerCase()
      if (BLOCKED_KEYS.includes(key)) {
        event.preventDefault()
        event.stopPropagation()
        triggerWarn('Copying or pasting during the interview is not allowed.')
      }
    }

    const handleBeforeInput = (event) => {
      if (event.inputType === 'insertFromPaste') {
        event.preventDefault()
        event.stopPropagation()
        triggerWarn('Copying or pasting during the interview is not allowed.')
      }
    }

    document.addEventListener('copy', handleClipboard, true)
    document.addEventListener('paste', handleClipboard, true)
    document.addEventListener('cut', handleClipboard, true)
    document.addEventListener('contextmenu', handleContextMenu, true)
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('beforeinput', handleBeforeInput, true)

    return () => {
      document.removeEventListener('copy', handleClipboard, true)
      document.removeEventListener('paste', handleClipboard, true)
      document.removeEventListener('cut', handleClipboard, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('beforeinput', handleBeforeInput, true)
      if (warnTimeoutRef.current) {
        clearTimeout(warnTimeoutRef.current)
      }
    }
  }, [enabled, onWarn])
}
