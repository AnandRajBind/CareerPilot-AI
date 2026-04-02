import React, { useState, useEffect } from 'react'
import { Volume2, Square, AlertCircle } from 'lucide-react'
import {
  speakText,
  stopSpeech,
  isTextToSpeechSupported,
} from '../utils/speechUtils'

export default function SpeakButton({ text, disabled = false, size = 'md' }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState(null)

  // Check browser support on mount
  useEffect(() => {
    const supported = isTextToSpeechSupported()
    setIsSupported(supported)
  }, [])

  const handleSpeak = async () => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in your browser')
      return
    }

    if (!text || !text.trim()) {
      setError('No text to speak')
      return
    }

    setError(null)
    setIsSpeaking(true)

    try {
      await speakText(text, {
        rate: 1,
        pitch: 1,
        volume: 1,
        lang: 'en-US',
        onEnd: () => {
          setIsSpeaking(false)
        },
        onError: (error) => {
          setIsSpeaking(false)
          setError(`Speech error: ${error}`)
          console.error('Speech error:', error)
        },
      })
    } catch (err) {
      setIsSpeaking(false)
      setError('Failed to speak text')
      console.error('Error speaking:', err)
    }
  }

  const handleStop = () => {
    stopSpeech()
    setIsSpeaking(false)
  }

  // Don't render if not supported
  if (!isSupported) {
    return null
  }

  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className="space-y-2">
      {/* Speak Button */}
      <div className="flex gap-2 items-center">
        {!isSpeaking ? (
          <button
            onClick={handleSpeak}
            disabled={disabled || !text}
            title="Listen to this question"
            className={`${sizeClasses[size]} flex items-center gap-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all`}
          >
            <Volume2 className={iconSizes[size]} />
            Listen
          </button>
        ) : (
          <button
            onClick={handleStop}
            title="Stop speaking"
            className={`${sizeClasses[size]} flex items-center gap-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all animate-pulse`}
          >
            <Square className={iconSizes[size]} />
            Stop
          </button>
        )}

        {/* Status Indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-4 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200 flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
