import { useState, useCallback, useRef, useEffect } from 'react'

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioStream, setAudioStream] = useState(null)
  const [isSupported] = useState(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    return !!SpeechRecognition
  })
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const timeoutRef = useRef(null)
  const retryCountRef = useRef(0)
  const maxRetriesRef = useRef(3)
  const audioStreamRef = useRef(null)

  const startListening = useCallback((options = {}) => {
    if (!isSupported) {
      console.warn('⚠️ Speech Recognition not supported in this browser')
      return false
    }

    // Get microphone stream for audio analysis
    const getAudioStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStreamRef.current = stream
        setAudioStream(stream)
        console.log('🎤 Microphone stream obtained for audio analysis')
        return stream
      } catch (error) {
        console.warn('⚠️ Could not get microphone stream for visualization:', error)
        return null
      }
    }

    // Start getting the audio stream
    getAudioStream()

    // Clean up previous recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.log('Cleanup previous recognition')
      }
    }

    // Clear previous state
    finalTranscriptRef.current = ''
    setTranscript('')
    retryCountRef.current = 0

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    // Use continuous true so user can speak naturally
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = options.lang || 'en-US'
    recognition.maxAlternatives = 1

    let speechDetected = false
    let startTime = Date.now()

    recognition.onstart = () => {
      console.log('🎤 Listening started - waiting for speech...')
      setIsListening(true)
      retryCountRef.current = 0
      speechDetected = false
      startTime = Date.now()

      // Set timeout - if NO speech for 8 seconds, stop and warn user
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        if (!speechDetected) {
          console.warn('❌ No speech detected for 8 seconds - check microphone!')
          console.warn('⚠️ Possible issues:')
          console.warn('  1. Microphone not granted permission')
          console.warn('  2. Microphone is muted')
          console.warn('  3. Microphone not working')
          recognition.stop()
        }
      }, 8000)
    }

    recognition.onresult = (event) => {
      // Mark that speech was detected
      speechDetected = true
      const elapsedTime = Date.now() - startTime
      console.log(`✅ Speech detected after ${elapsedTime}ms`)

      // Reset timeout on each result (user is speaking)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ 3 seconds silence - stopping listening')
        recognition.stop()
      }, 3000)

      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' '
          console.log('✅ Final:', transcript)
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = finalTranscriptRef.current + interimTranscript
      setTranscript(fullTranscript)
      console.log('📝 Transcript:', fullTranscript)
    }

    recognition.onend = () => {
      console.log('🎤 Listening ended')
      if (!speechDetected) {
        console.error('❌ ERROR: No speech was captured!')
        console.error('Check:')
        console.error('1. Browser Console Permissions')
        console.error('2. Microphone is enabled in browser')
        console.error('3. System volume is up')
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsListening(false)

      // Call end callback with final transcript if provided
      if (options.onRecognitionEnd) {
        const finalAnswer = finalTranscriptRef.current.trim()
        console.log(`📤 Calling onRecognitionEnd with transcript: "${finalAnswer.substring(0, 50)}..."`)
        options.onRecognitionEnd(finalAnswer)
      }
    }

    recognition.onerror = (event) => {
      console.error('❌ Speech error:', event.error)

      // More detailed error handling
      if (event.error === 'no-speech') {
        console.error('🔴 No speech was heard - microphone may not be working')
      } else if (event.error === 'network') {
        console.warn('🔄 Network error - retrying...')
        if (retryCountRef.current < maxRetriesRef.current) {
          retryCountRef.current += 1
          console.log(`Retry ${retryCountRef.current}/${maxRetriesRef.current}`)
          setTimeout(() => {
            try {
              recognition.start()
            } catch (e) {
              console.error('Retry failed:', e)
              setIsListening(false)
            }
          }, 500)
          return
        }
      } else if (event.error === 'not-allowed') {
        console.error('🚫 Microphone permission denied!')
      } else if (event.error === 'audio-capture') {
        console.error('🎤 No microphone found or not accessible')
      }

      setIsListening(false)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      console.log('🎙️ Speech recognition started')
      return true
    } catch (e) {
      console.error('Failed to start recognition:', e)
      return false
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.log('Error stopping:', e)
      }
    }
    
    // Stop all audio tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      audioStreamRef.current = null
      setAudioStream(null)
      console.log('🎤 Audio stream stopped')
    }
    
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    finalTranscriptRef.current = ''
    setTranscript('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [stopListening])

  return {
    startListening,
    stopListening,
    reset,
    isListening,
    transcript,
    audioStream,
    isSupported,
  }
}
