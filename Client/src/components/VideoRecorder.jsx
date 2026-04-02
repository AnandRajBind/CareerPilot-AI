import React, { useState, useEffect, useRef } from 'react'
import { Mic, Square, Pause, Play, Download, AlertCircle } from 'lucide-react'
import {
  startVideoRecording,
  stopVideoRecording,
  pauseVideoRecording,
  resumeVideoRecording,
  getRecordingDuration,
  isVideoRecordingSupported,
} from '../utils/videoUtils'

export default function VideoRecorder({ stream, onRecordingComplete, onError }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState(null)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const durationInterval = useRef(null)

  // Check support on mount
  useEffect(() => {
    const supported = isVideoRecordingSupported()
    setIsSupported(supported)
  }, [])

  // Update duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      durationInterval.current = setInterval(() => {
        setDuration(getRecordingDuration() / 1000) // Convert to seconds
      }, 100)
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }, [isRecording, isPaused])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    if (!stream) {
      const errorMsg = 'No camera stream available'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return
    }

    if (!isSupported) {
      const errorMsg = 'Video recording is not supported in your browser'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return
    }

    setError(null)
    setDuration(0)
    setRecordedBlob(null)

    try {
      await startVideoRecording(stream, {
        onStart: () => {
          setIsRecording(true)
          setIsPaused(false)
        },
        onStop: () => {
          setIsRecording(false)
        },
        onError: (error) => {
          setIsRecording(false)
          setError(`Recording error: ${error}`)
          if (onError) onError(error)
        },
      })
    } catch (err) {
      const errorMsg = err.message || 'Failed to start recording'
      setError(errorMsg)
      if (onError) onError(errorMsg)
    }
  }

  const handleStopRecording = async () => {
    try {
      const blob = await stopVideoRecording()
      setRecordedBlob(blob)
      setIsRecording(false)
      setIsPaused(false)

      if (onRecordingComplete) {
        onRecordingComplete(blob)
      }
    } catch (err) {
      const errorMsg = 'Failed to stop recording'
      setError(errorMsg)
      if (onError) onError(errorMsg)
    }
  }

  const handlePauseRecording = () => {
    pauseVideoRecording()
    setIsPaused(true)
  }

  const handleResumeRecording = () => {
    resumeVideoRecording()
    setIsPaused(false)
  }

  const handleDownload = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `interview-${new Date().getTime()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  // Don't render if not supported
  if (!isSupported) {
    return null
  }

  return (
    <div className="space-y-3 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
      {/* Recording Status and Duration */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording && (
            <>
              <span className="inline-block w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-red-600">Recording</span>
            </>
          )}
          {!isRecording && recordedBlob && (
            <>
              <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
              <span className="text-sm font-semibold text-green-600">Recording Saved</span>
            </>
          )}
          {!isRecording && !recordedBlob && (
            <>
              <span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
              <span className="text-sm font-semibold text-gray-600">Ready</span>
            </>
          )}
        </div>

        <div className="text-2xl font-bold text-gray-900 font-mono">
          {formatTime(duration)}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex gap-2 flex-wrap">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={recordedBlob !== null}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            title="Start recording"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
              title="Stop recording"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </button>

            {!isPaused ? (
              <button
                onClick={handlePauseRecording}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all"
                title="Pause recording"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleResumeRecording}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                title="Resume recording"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
            )}
          </>
        )}

        {recordedBlob && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            title="Download recorded video"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200 flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Recording Info */}
      {isRecording && (
        <p className="text-xs text-gray-600 text-center">
          💡 Recording in progress. Click "Stop Recording" when done.
        </p>
      )}

      {recordedBlob && (
        <p className="text-xs text-green-600 text-center">
          ✓ Video recording saved successfully. You can download it or proceed with the interview.
        </p>
      )}
    </div>
  )
}
