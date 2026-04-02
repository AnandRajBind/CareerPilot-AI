import React, { useRef, useState } from 'react'
import { Play, Pause, Download, X } from 'lucide-react'

export default function VideoPlayback({ videoBlob, onClose }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  if (!videoBlob) {
    return null
  }

  const videoUrl = URL.createObjectURL(videoBlob)

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `interview-${new Date().getTime()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration

    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Interview Recording Playback</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            title="Close playback"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3 bg-gray-50">
          {/* Progress Bar */}
          <div
            onClick={handleProgressClick}
            className="w-full h-2 bg-gray-300 rounded-full cursor-pointer hover:h-3 transition-all"
          >
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center">
            You can download this recording for future review and practice.
          </p>
        </div>
      </div>
    </div>
  )
}
