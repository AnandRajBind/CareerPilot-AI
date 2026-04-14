import React, { useEffect, useState } from 'react'

const AIAvatar = ({ isSpeaking = false }) => {
  const [avatarState, setAvatarState] = useState('idle')

  useEffect(() => {
    if (isSpeaking) {
      setAvatarState('talking')
    } else {
      setAvatarState('idle')
    }
  }, [isSpeaking])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Avatar Container */}
        <div
          className={`w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
            isSpeaking ? 'scale-105 ring-4 ring-blue-300' : 'scale-100'
          }`}
        >
          {/* Avatar Placeholder - Can be replaced with actual avatar image */}
          <div className="text-center">
            <div className="text-6xl mb-2">🤖</div>
            <div className="text-xs text-white font-semibold">AI Interviewer</div>
          </div>
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full animate-pulse">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></div>
          </div>
        )}

        {/* Microphone Indicator - Listening/Idle */}
        {!isSpeaking && (
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Status Text */}
      <div className="mt-6 text-center">
        <p className="text-white text-sm font-medium">
          {isSpeaking ? '🎤 AI Interviewer Speaking...' : '👂 AI Listening...'}
        </p>
      </div>
    </div>
  )
}

export default AIAvatar
