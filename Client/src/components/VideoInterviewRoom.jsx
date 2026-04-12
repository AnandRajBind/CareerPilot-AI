import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader, Phone, Mic, MicOff, Video, VideoOff } from 'lucide-react'

const VideoInterviewRoom = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [interviewData, setInterviewData] = useState(null)

  useEffect(() => {
    // Get interview data from localStorage
    const savedInterview = localStorage.getItem('currentInterview')
    if (!savedInterview) {
      toast.error('Interview session not found', {
        position: 'top-right',
        autoClose: 3000,
      })
      navigate(`/interview/session/${token}`)
      return
    }
    
    setInterviewData(JSON.parse(savedInterview))
    setIsLoading(false)
  }, [token, navigate])

  const handleToggleMic = () => {
    setIsMicEnabled(!isMicEnabled)
    toast.info(isMicEnabled ? '🔇 Microphone disabled' : '🎤 Microphone enabled', {
      position: 'bottom-right',
      autoClose: 2000,
    })
  }

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    toast.info(isVideoEnabled ? '📹 Camera disabled' : '📹 Camera enabled', {
      position: 'bottom-right',
      autoClose: 2000,
    })
  }

  const handleEndCall = () => {
    toast.info('Ending interview session...', {
      position: 'top-right',
      autoClose: 2000,
    })
    navigate(`/interview/session/${token}/results`)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-600">Starting video interview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Video size={64} className="text-white/30 mx-auto mb-4" />
            <p className="text-white text-lg">Video Interview Session</p>
            <p className="text-white/70 text-sm mt-2">{interviewData?.jobRole} - {interviewData?.interviewType}</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-900 border-t border-gray-800 p-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          {/* Microphone Control */}
          <button
            onClick={handleToggleMic}
            className={`p-4 rounded-full transition ${
              isMicEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isMicEnabled ? 'Disable microphone' : 'Enable microphone'}
          >
            {isMicEnabled ? (
              <Mic size={24} className="text-white" />
            ) : (
              <MicOff size={24} className="text-white" />
            )}
          </button>

          {/* Camera Control */}
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition ${
              isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isVideoEnabled ? 'Disable camera' : 'Enable camera'}
          >
            {isVideoEnabled ? (
              <Video size={24} className="text-white" />
            ) : (
              <VideoOff size={24} className="text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
            title="End call"
          >
            <Phone size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoInterviewRoom
