import { useState, useCallback, useRef, useEffect } from 'react'

export const useAudioAnalyzer = () => {
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(32))
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const microphoneSourceRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Initialize audio context and analyser
  const initializeAudioContext = useCallback((stream) => {
    try {
      // Create or resume audio context
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        audioContextRef.current = audioContext
      }

      const audioContext = audioContextRef.current

      // Resume if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => console.warn('Failed to resume audio context:', err))
      }

      // Create analyser node
      if (!analyserRef.current) {
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256 // 256 frequency bins
        analyser.smoothingTimeConstant = 0.8
        analyserRef.current = analyser
      }

      // Create microphone source (only once)
      if (!microphoneSourceRef.current && stream) {
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyserRef.current)
        microphoneSourceRef.current = source
      }

      console.log('✅ Audio analyzer initialized')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize audio analyzer:', error)
      return false
    }
  }, [])

  // Start analyzing audio
  const startAnalyzing = useCallback((stream) => {
    if (isAnalyzing) return

    const initialized = initializeAudioContext(stream)
    if (!initialized) {
      console.error('Failed to initialize audio context')
      return
    }

    setIsAnalyzing(true)

    const analyzeFrame = () => {
      if (!analyserRef.current) return

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)

      // Downsample to 32 bars for visualization
      const barCount = 32
      const sampledData = new Uint8Array(barCount)
      const samplesPerBar = Math.floor(dataArray.length / barCount)

      for (let i = 0; i < barCount; i++) {
        let sum = 0
        for (let j = 0; j < samplesPerBar; j++) {
          sum += dataArray[i * samplesPerBar + j]
        }
        sampledData[i] = sum / samplesPerBar
      }

      setFrequencyData(sampledData)

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(analyzeFrame)
    }

    analyzeFrame()
  }, [isAnalyzing, initializeAudioContext])

  // Stop analyzing audio
  const stopAnalyzing = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Reset frequency data
    setFrequencyData(new Uint8Array(32).fill(0))
    setIsAnalyzing(false)

    console.log('✅ Audio analyzer stopped')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzing()
      
      // Cleanup audio context and references
      if (microphoneSourceRef.current) {
        microphoneSourceRef.current.disconnect()
        microphoneSourceRef.current = null
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect()
        analyserRef.current = null
      }

      // Close audio context if needed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => console.warn('Failed to close audio context:', err))
        audioContextRef.current = null
      }
    }
  }, [stopAnalyzing])

  return {
    frequencyData,
    isAnalyzing,
    startAnalyzing,
    stopAnalyzing,
  }
}
