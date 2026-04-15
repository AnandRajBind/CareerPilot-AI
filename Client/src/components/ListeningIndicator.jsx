import React, { useEffect, useRef } from 'react'
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer'
import AudioWaveform from './AudioWaveform'

const ListeningIndicator = ({ isListening = false, transcript = '', audioStream = null }) => {
  const { frequencyData, isAnalyzing, startAnalyzing, stopAnalyzing } = useAudioAnalyzer()
  const audioStreamRef = useRef(audioStream)

  // Start/stop audio analysis based on listening state
  useEffect(() => {
    audioStreamRef.current = audioStream
  }, [audioStream])

  useEffect(() => {
    if (isListening && audioStreamRef.current) {
      console.log('🎵 Starting audio analysis...')
      startAnalyzing(audioStreamRef.current)
    } else {
      console.log('🎵 Stopping audio analysis...')
      stopAnalyzing()
    }

    return () => {
      if (isAnalyzing) {
        stopAnalyzing()
      }
    }
  }, [isListening, startAnalyzing, stopAnalyzing, isAnalyzing])

  if (!isListening) return null

  return (
    <div className="w-full p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-600">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-green-300 font-semibold text-sm">🎤 Listening...</span>
      </div>

      {/* Animated Waveform */}
      <div className="mb-4 bg-green-950 rounded-lg p-2 min-h-20 flex items-end">
        <AudioWaveform frequencyData={frequencyData} isAnalyzing={isAnalyzing} />
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
