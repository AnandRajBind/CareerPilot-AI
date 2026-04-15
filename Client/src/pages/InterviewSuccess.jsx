import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const InterviewSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we have completion data
    const completionData = sessionStorage.getItem('interviewCompletion')
    if (!completionData) {
      navigate('/interview/mode')
      return
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Success Dialog */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-green-500 shadow-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl">✅</span>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-center text-white mb-4">
            Interview Completed!
          </h1>

          {/* Description */}
          <p className="text-center text-gray-300 text-sm mb-6">
            Thank you for completing the interview. Your responses have been successfully recorded and submitted.
          </p>

          {/* Status Box */}
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6 border border-green-500 border-opacity-30">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Status:</span>
              <span className="text-green-400 font-semibold">✓ Submitted</span>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              Your interview responses are being evaluated by our AI system. You will receive results soon.
            </p>
          </div>

          {/* Message */}
          <div className="bg-blue-900 bg-opacity-40 rounded-lg p-4 border-l-4 border-blue-400">
            <p className="text-gray-100 text-center text-sm font-semibold">
              You can now <span className="text-green-400">close this tab</span>.
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-center text-gray-500 text-xs">
              Interview ID: {sessionStorage.getItem('currentInterviewId') || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewSuccess
