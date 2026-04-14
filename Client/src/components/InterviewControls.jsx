import React from 'react'
import { Mic, MicOff, Video, VideoOff, Phone, SkipForward } from 'lucide-react'

const InterviewControls = ({
  isMicEnabled,
  isVideoEnabled,
  isTakingResponse,
  onMicToggle,
  onVideoToggle,
  onEndInterview,
  onSkipQuestion,
  connectionStatus = 'good',
}) => {
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'poor':
        return 'text-red-400'
      case 'fair':
        return 'text-yellow-400'
      case 'good':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="bg-gray-900 border-t border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Controls */}
        <div className="flex items-center gap-3">
          {/* Microphone */}
          <button
            onClick={onMicToggle}
            disabled={isTakingResponse}
            className={`p-3 rounded-full transition ${
              isMicEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isMicEnabled ? 'Disable microphone' : 'Enable microphone'}
          >
            {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Camera */}
          <button
            onClick={onVideoToggle}
            className={`p-3 rounded-full transition ${
              isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoEnabled ? 'Disable camera' : 'Enable camera'}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Skip Question */}
          <button
            onClick={onSkipQuestion}
            disabled={isTakingResponse}
            className="px-4 py-3 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Skip this question"
          >
            <SkipForward size={18} />
            <span className="text-sm font-semibold">Skip</span>
          </button>
        </div>

        {/* Middle: Connection Status */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className={`text-sm font-medium ${getConnectionColor()}`}>
            {connectionStatus === 'good' && '✓ Good Connection'}
            {connectionStatus === 'fair' && '⚠ Fair Connection'}
            {connectionStatus === 'poor' && '✗ Poor Connection'}
          </span>
        </div>

        {/* Right: End Interview */}
        <button
          onClick={onEndInterview}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
          title="End interview"
        >
          <Phone size={20} />
        </button>
      </div>
    </div>
  )
}

export default InterviewControls
