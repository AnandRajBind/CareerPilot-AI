import React from 'react'

const ListeningIndicator = ({ isListening = false, transcript = '' }) => {
  if (!isListening) return null

  return (
    <div className="w-full p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-600">
      <div className="flex items-center gap-3 mb-2">
        {/* Animated Microphone Pulse */}
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1 h-6 bg-green-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            ></div>
          ))}
        </div>
        <span className="text-green-300 font-semibold text-sm">AI is listening...</span>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <p className="text-green-100 text-sm italic">
          <span className="text-green-400 mr-2">You:</span>
          {transcript}
        </p>
      )}
    </div>
  )
}

export default ListeningIndicator
