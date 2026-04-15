import React from 'react'

const AudioWaveform = ({ frequencyData = new Uint8Array(32), isAnalyzing = false }) => {
  if (!isAnalyzing && frequencyData.every(val => val === 0)) {
    return null
  }

  return (
    <div className="w-full flex items-center justify-center gap-1 p-4">
      {Array.from(frequencyData).map((value, index) => {
        // Normalize value to 0-1 range
        const normalizedValue = Math.min(value / 255, 1)
        // Calculate bar height as percentage (min 5%, max 100%)
        const heightPercent = Math.max(normalizedValue * 100, 5)

        return (
          <div
            key={index}
            className="flex-1 bg-gradient-to-t from-green-500 to-green-300 rounded-full transition-all"
            style={{
              height: `${heightPercent}%`,
              minHeight: '4px',
              maxHeight: '60px',
              opacity: normalizedValue > 0.1 ? 1 : 0.4,
              // Smooth transition without being too slow
              transitionDuration: '50ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            title={`Frequency: ${value}/255`}
          />
        )
      })}
    </div>
  )
}

export default AudioWaveform
