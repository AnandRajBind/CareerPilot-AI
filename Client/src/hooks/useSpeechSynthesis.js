import { useState, useCallback, useRef, useEffect } from 'react'

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported] = useState(() => 'speechSynthesis' in window)
  const utteranceRef = useRef(null)

  const speak = useCallback((text, options = {}) => {
    if (!isSupported) {
      console.warn('⚠️ Speech Synthesis not supported in this browser')
      return
    }

    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Cannot speak empty text')
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 0.95
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 0.9

    utterance.onstart = () => {
      console.log('🔊 Speech started')
      setIsSpeaking(true)
    }
    
    utterance.onend = () => {
      console.log('🔊 Speech ended')
      setIsSpeaking(false)
    }
    
    utterance.onerror = (event) => {
      console.error('🔊 Speech error:', event.error)
      setIsSpeaking(false)
    }

    utteranceRef.current = utterance
    console.log('🔊 Speaking:', text.substring(0, 50) + '...')
    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  }
}
