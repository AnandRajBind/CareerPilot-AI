import React from 'react'

const InterviewProgress = ({ currentQuestion, totalQuestions, timeElapsed }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (currentQuestion / totalQuestions) * 100

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="max-w-6xl mx-auto">
        {/* Top Row: Question Progress and Timer */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold text-sm">
            Question {currentQuestion} of {totalQuestions}
          </span>
          <span className="text-gray-400 text-sm font-mono">
            ⏱️ {formatTime(timeElapsed)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default InterviewProgress
