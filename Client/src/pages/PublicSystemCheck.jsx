import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useSystemCheck } from '../hooks/useSystemCheck'

const PublicSystemCheck = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const {
    cameraStream,
    screenStream,
    microphoneTrack,
    cameraReady,
    micReady,
    screenReady,
    internetStatus,
    lastPingMs,
    canStart,
    testInternet,
    checkCameraAndMic,
    checkScreenShare,
  } = useSystemCheck()

  const [isStarting, setIsStarting] = useState(false)
  const [screenPromptVisible, setScreenPromptVisible] = useState(false)
  const [interviewData, setInterviewData] = useState(null)
  const videoRef = useRef(null)
  const screenVideoRef = useRef(null)

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
  }, [token, navigate])

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch(() => {})
    }
  }, [cameraStream])

  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream
      screenVideoRef.current.play().catch(() => {})
    }
  }, [screenStream])

  useEffect(() => {
    testInternet()
  }, [testInternet])

  const statusBadge = (ready) => (
    <div className="flex items-center gap-2">
      {ready ? (
        <CheckCircle className="text-green-600" size={20} />
      ) : (
        <AlertCircle className="text-red-600" size={20} />
      )}
      <span className={`text-sm font-medium ${ready ? 'text-green-700' : 'text-red-700'}`}>
        {ready ? 'Ready' : 'Not ready'}
      </span>
    </div>
  )

  const handleScreenCheckWithPrompt = () => {
    setScreenPromptVisible(true)
  }

  const handleStartInterview = async () => {
    if (!canStart) return

    setIsStarting(true)
    try {
      // Proceed to interview screen
      navigate(`/interview/session/${token}/screen`)
    } catch (error) {
      toast.error('Failed to start interview', {
        position: 'top-right',
        autoClose: 3000,
      })
      setIsStarting(false)
    }
  }

  if (!interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  const internetLabel = {
    checking: 'Checking...',
    excellent: 'Excellent',
    good: 'Good',
  }[internetStatus] || 'Poor'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">System Check</h1>
          <p className="text-gray-600">
            Let's make sure your setup is ready for the {interviewData.jobRole} interview
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Camera & Mic Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-white text-center">Camera not detected</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Camera & Microphone</p>
                {statusBadge(cameraReady && micReady)}
              </div>
            </div>

            {/* Screen Share Preview */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative bg-gray-100 aspect-video flex items-center justify-center">
                {screenReady ? (
                  <video
                    ref={screenVideoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Screen sharing not enabled</p>
                    <button
                      onClick={() => {
                        checkScreenShare()
                        handleScreenCheckWithPrompt()
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Enable Screen Share
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Screen Share</p>
                {statusBadge(screenReady)}
              </div>
            </div>
          </div>

          {/* Right: System Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>

              {/* Internet Connection */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-700 font-medium">Internet Connection</p>
                  {statusBadge(internetStatus !== 'poor')}
                </div>
                <p className="text-sm text-gray-600">
                  {internetLabel}
                  {lastPingMs && ` • ${lastPingMs}ms`}
                </p>
              </div>

              {/* Camera */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-700 font-medium">Camera</p>
                  {statusBadge(cameraReady)}
                </div>
                <button
                  onClick={checkCameraAndMic}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Test Camera
                </button>
              </div>

              {/* Microphone */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-700 font-medium">Microphone</p>
                  {statusBadge(micReady)}
                </div>
                <button
                  onClick={checkCameraAndMic}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Test Microphone
                </button>
              </div>

              {/* Screen Share */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-700 font-medium">Screen Share</p>
                  {statusBadge(screenReady)}
                </div>
                <button
                  onClick={() => {
                    checkScreenShare()
                    handleScreenCheckWithPrompt()
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {screenReady ? 'Disable Screen Share' : 'Enable Screen Share'}
                </button>
              </div>

              {/* Interview Details */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Interview Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Position:</span>
                    <span className="font-medium text-gray-900">{interviewData.jobRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Type:</span>
                    <span className="font-medium text-gray-900">{interviewData.interviewType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Level:</span>
                    <span className="font-medium text-gray-900">{interviewData.experienceLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Questions:</span>
                    <span className="font-medium text-gray-900">{interviewData.numberOfQuestions}</span>
                  </div>
                </div>
              </div>

              {/* Start Interview Button */}
              <button
                onClick={handleStartInterview}
                disabled={!canStart || isStarting}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  canStart && !isStarting
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isStarting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Starting...
                  </span>
                ) : (
                  'Start Interview'
                )}
              </button>

              {!canStart && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please enable camera, microphone, and internet connection to proceed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Screen Share Prompt Modal */}
        {screenPromptVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Screen Share Permission</h3>
              <p className="text-gray-600 mb-6">
                This interview may require screen sharing. Your screen content will be visible to the
                interviewer. You can disable it at any time.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setScreenPromptVisible(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    checkScreenShare()
                    setScreenPromptVisible(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicSystemCheck
