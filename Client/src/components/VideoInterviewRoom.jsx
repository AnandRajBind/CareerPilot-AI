import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader, PhoneOff, Mic, MicOff, Video, VideoOff, Share2, X } from 'lucide-react'
import { useStream } from '../context/StreamContext'

const VideoInterviewRoom = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { 
    call, 
    createVideoCall, 
    endVideoCall, 
    toggleVideo, 
    toggleMicrophone,
    isFallbackMode,
    setIsFallbackMode 
  } = useStream()

  const [isLoading, setIsLoading] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const screenShareRef = useRef(null)

  // Initialize video call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsLoading(true)
        
        // Get interview session data
        const sessionData = localStorage.getItem('currentInterview')
        if (!sessionData) {
          toast.error('Interview session data not found')
          navigate(-1)
          return
        }

        const interview = JSON.parse(sessionData)
        
        // Create unique call ID based on interview and token
        const callId = `interview-${interview.interviewId}`

        // Attempt to create video call
        try {
          await createVideoCall(callId)
        } catch (err) {
          console.warn('Video call failed, using text mode:', err.message)
          setIsFallbackMode(true)
          toast.warning('Video unavailable. Using text-based interview mode.', {
            position: 'top-right',
            autoClose: 5000,
          })
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize interview:', error)
        toast.error('Failed to initialize interview')
        setIsLoading(false)
      }
    }

    initializeCall()

    return () => {
      // Cleanup on unmount
      if (call) {
        endVideoCall()
      }
    }
  }, [token, createVideoCall, endVideoCall, navigate, setIsFallbackMode])

  // Handle camera toggle
  const handleToggleCamera = async () => {
    try {
      const newState = !cameraEnabled
      await toggleVideo(newState)
      setCameraEnabled(newState)
      toast.info(newState ? 'Camera enabled' : 'Camera disabled', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (err) {
      toast.error('Failed to toggle camera')
    }
  }

  // Handle microphone toggle
  const handleToggleMicrophone = async () => {
    try {
      const newState = !micEnabled
      await toggleMicrophone(newState)
      setMicEnabled(newState)
      toast.info(newState ? 'Microphone enabled' : 'Microphone disabled', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (err) {
      toast.error('Failed to toggle microphone')
    }
  }

  // Handle screen sharing
  const handleScreenShare = async () => {
    try {
      if (!screenSharing && call?.screenShare) {
        // Start screen share
        await call.screenShare.toggle(true)
        setScreenSharing(true)
        toast.info('Screen sharing started', {
          position: 'top-right',
          autoClose: 2000,
        })
      } else if (screenSharing && call?.screenShare) {
        // Stop screen share
        await call.screenShare.toggle(false)
        setScreenSharing(false)
        toast.info('Screen sharing stopped', {
          position: 'top-right',
          autoClose: 2000,
        })
      }
    } catch (err) {
      toast.error('Failed to toggle screen sharing')
    }
  }

  // Handle end call
  const handleEndCall = async () => {
    try {
      await endVideoCall()
      navigate(`/interview/session/${token}/results`)
    } catch (err) {
      toast.error('Failed to end call')
    }
  }

  if (isFallbackMode) {
    // Fall back to text-based interview mode
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-white rounded-lg shadow-lg p-8'>
            <div className='text-center mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Interview Session
              </h1>
              <p className='text-gray-600'>
                Video unavailable - using text-based interview mode
              </p>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8'>
              <p className='text-blue-800'>
                The video interview feature is temporarily unavailable. You'll complete the interview through our text-based Q&A system instead.
              </p>
            </div>

            <button
              onClick={() => navigate(`/interview/session/${token}/screen`)}
              className='w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition'
            >
              Continue with Text Interview
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='flex flex-col items-center gap-4'>
          <Loader className='animate-spin text-primary' size={40} />
          <p className='text-gray-600'>Initializing video interview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-900 flex flex-col'>
      {/* Video Container */}
      <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4'>
        {/* Local Video */}
        <div className='bg-black rounded-lg overflow-hidden flex items-center justify-center'>
          <div ref={localVideoRef} className='w-full h-full object-cover' />
          {!cameraEnabled && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <div className='text-white text-center'>
                <VideoOff size={48} className='mx-auto mb-2' />
                <p>Camera is off</p>
              </div>
            </div>
          )}
          <div className='absolute top-4 left-4 bg-gray-800 backdrop-blur px-3 py-1 rounded text-white text-sm'>
            You
          </div>
        </div>

        {/* Remote Video (AI Interviewer) */}
        <div className='bg-black rounded-lg overflow-hidden flex items-center justify-center'>
          <div ref={remoteVideoRef} className='w-full h-full object-cover' />
          <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20'>
            <div className='text-white text-center'>
              <Video size={48} className='mx-auto mb-2' />
              <p className='text-lg font-semibold'>AI Interviewer</p>
              <p className='text-sm text-gray-300 mt-1'>Connecting...</p>
            </div>
          </div>
          <div className='absolute top-4 right-4 bg-gray-800 backdrop-blur px-3 py-1 rounded text-white text-sm'>
            Interviewer
          </div>
        </div>
      </div>

      {/* Screen Share (if active) */}
      {screenSharing && (
        <div className='bg-black border-t border-gray-700 p-4 max-h-48'>
          <div ref={screenShareRef} className='w-full h-full max-w-md rounded-lg overflow-hidden bg-gray-800' />
          <p className='text-white text-sm text-center mt-2'>Screen Sharing Active</p>
        </div>
      )}

      {/* Control Bar */}
      <div className='bg-gray-800 border-t border-gray-700 px-4 py-4'>
        <div className='flex items-center justify-center gap-4'>
          {/* Microphone */}
          <button
            onClick={handleToggleMicrophone}
            className={`p-3 rounded-full transition ${
              micEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={micEnabled ? 'Disable microphone' : 'Enable microphone'}
          >
            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Camera */}
          <button
            onClick={handleToggleCamera}
            className={`p-3 rounded-full transition ${
              cameraEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={cameraEnabled ? 'Disable camera' : 'Enable camera'}
          >
            {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={handleScreenShare}
            className={`p-3 rounded-full transition ${
              screenSharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={screenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
          >
            {screenSharing ? <X size={20} /> : <Share2 size={20} />}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className='p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition ml-8'
            title='End interview'
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoInterviewRoom
