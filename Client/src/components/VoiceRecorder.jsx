import React, { useState, useEffect } from 'react'
import { Mic, Square, AlertCircle } from 'lucide-react'
import {
  startListening,
  stopListening,
  abortListening,
  isSpeechRecognitionSupported,
} from '../utils/speechUtils'

export default function VoiceRecorder({ onTranscript, onError, autoInsert = true }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState(null)

  // Check browser support on mount
  useEffect(() => {
    const supported = isSpeechRecognitionSupported()
    setIsSupported(supported)

    if (supported) {
      // Check microphone permission
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' }).then((result) => {
          setPermission(result.state)
        })
      }
    }
  }, [])

  const handleStartListening = async () => {
    if (!isSupported) {
      const errorMsg = 'Voice input is not supported in your browser'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return
    }

    setError(null)
    setTranscript('')
    setInterimTranscript('')
    setIsListening(true)

    try {
      const result = await startListening({
        continuous: false,
        interimResults: true,
        lang: 'en-US',
        onResult: (data) => {
          setTranscript(data.transcript)
          setInterimTranscript(data.interimTranscript)

          if (data.isFinal && autoInsert && onTranscript) {
            onTranscript(data.transcript)
          }
        },
        onEnd: () => {
          setIsListening(false)
          if (transcript && onTranscript) {
            onTranscript(transcript)
          }
        },
        onError: (error) => {
          setIsListening(false)
          const errorMsg = `Microphone error: ${error}`
          setError(errorMsg)
          if (onError) onError(errorMsg)
        },
        onStart: () => {
          setError(null)
        },
      })
    } catch (err) {
      setIsListening(false)
      const errorMsg = err.message || 'Failed to start voice recording'
      setError(errorMsg)
      if (onError) onError(errorMsg)
    }
  }

  const handleStopListening = () => {
    stopListening()
    setIsListening(false)
  }

  const handleManualInsert = () => {
    if (transcript && onTranscript) {
      onTranscript(transcript)
    }
  }

  // Don't render if not supported
  if (!isSupported) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex gap-2 flex-wrap items-center">
        {!isListening ? (
          <button
            onClick={handleStartListening}
            disabled={isListening}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-all"
            title="Start recording voice input"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStopListening}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all animate-pulse"
            title="Stop recording"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </button>
        )}

        {/* Insert Manual Button */}
        {transcript && !isListening && (
          <button
            onClick={handleManualInsert}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            title="Insert transcript into answer field"
          >
            Insert Text
          </button>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <p className="text-sm text-blue-700 font-semibold mb-2">Your Speech:</p>
          <div className="space-y-2">
            {transcript && (
              <p className="text-gray-900 text-base">{transcript}</p>
            )}
            {interimTranscript && isListening && (
              <p className="text-gray-600 text-base italic opacity-75">
                {interimTranscript}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recording Status */}
      {isListening && (
        <div className="bg-blue-100 rounded-lg p-3 border-l-4 border-blue-600">
          <p className="text-blue-800 font-semibold text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Listening... Speak now
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Voice Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Permission Warning */}
      {permission === 'denied' && (
        <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-semibold text-sm">Microphone Access Denied</p>
            <p className="text-yellow-700 text-sm">
              Please enable microphone access in your browser settings to use voice input.
            </p>
          </div>
        </div>
      )}

      {/* Info Message */}
      <p className="text-xs text-gray-500">
        💡 Tip: Speak clearly and wait for the transcript to appear before submitting.
      </p>
    </div>
  )
}
