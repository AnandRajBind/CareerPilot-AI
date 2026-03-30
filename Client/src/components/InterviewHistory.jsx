import React, { useState } from 'react'
import { Calendar, Award, Trash2 } from 'lucide-react'
import { interviewService } from '../services/interviewService'

const roleIcons = {
  frontend: '🎨',
  backend: '⚙️',
  fullstack: '🔄',
  java: '☕',
  hr: '👥',
  general: '🧠',
}

const roleColors = {
  frontend: 'bg-blue-100 text-blue-800',
  backend: 'bg-purple-100 text-purple-800',
  fullstack: 'bg-pink-100 text-pink-800',
  java: 'bg-orange-100 text-orange-800',
  hr: 'bg-green-100 text-green-800',
  general: 'bg-indigo-100 text-indigo-800',
}

const difficultyColors = {
  easy: 'bg-green-50 border-green-200',
  medium: 'bg-yellow-50 border-yellow-200',
  hard: 'bg-red-50 border-red-200',
}

const statusBadges = {
  completed: 'bg-green-100 text-green-800 border-green-300',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
  abandoned: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function InterviewHistory({ interviews, loading }) {
  // Safety check: ensure interviews is an array
  const interviewsArray = Array.isArray(interviews) ? interviews : [];
  
  const [sortBy, setSortBy] = useState('date')
  const [deleteLoading, setDeleteLoading] = useState(null)

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleDelete = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview record?')) {
      return
    }

    setDeleteLoading(interviewId)
    try {
      await interviewService.deleteInterview(interviewId)
      // Refresh page to update list
      window.location.reload()
    } catch (err) {
      console.error('Failed to delete interview:', err)
      alert('Failed to delete interview')
    } finally {
      setDeleteLoading(null)
    }
  }

  const sortedInterviews = [...interviewsArray].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sortBy === 'score') {
      return (b.evaluation?.score || 0) - (a.evaluation?.score || 0)
    }
    return 0
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!interviewsArray.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No interview history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('date')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === 'date'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📅 Sort by Date
        </button>
        <button
          onClick={() => setSortBy('score')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === 'score'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🏆 Sort by Score
        </button>
      </div>

      {/* Interview List */}
      <div className="space-y-4">
        {sortedInterviews.map((interview) => (
          <div
            key={interview._id}
            className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
              difficultyColors[interview.difficultyLevel] || 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Role and Date */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{roleIcons[interview.jobRole]}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                      {interview.jobRole}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(interview.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Details */}
              <div className="space-y-2">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusBadges[interview.status]}`}>
                    {interview.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold capitalize">{interview.difficultyLevel}</span>
                  <span className="text-gray-600"> • {interview.numberOfQuestions} Q's</span>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center justify-between md:justify-end gap-4">
                {interview.status === 'completed' && interview.evaluation?.score !== undefined ? (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(interview.evaluation.score)}`}>
                      {interview.evaluation.score}
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    In Progress
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(interview._id)}
                  disabled={deleteLoading === interview._id}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete interview"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Details Row */}
            <div className="mt-4 pt-4 border-t border-opacity-30 border-gray-400 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Experience Level</span>
                <p className="font-semibold text-gray-900 capitalize">{interview.experienceLevel}</p>
              </div>
              <div>
                <span className="text-gray-600">Interview Type</span>
                <p className="font-semibold text-gray-900 capitalize">{interview.interviewType}</p>
              </div>
              {interview.evaluation?.strengths && (
                <div>
                  <span className="text-gray-600">Status</span>
                  <p className="font-semibold text-green-600">Evaluated ✓</p>
                </div>
              )}
              {interview.createdAt && (
                <div>
                  <span className="text-gray-600">Duration</span>
                  <p className="font-semibold text-gray-900">
                    ~{Math.round(interview.numberOfQuestions * 5)} min
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      {sortedInterviews.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200 mt-8">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Interview Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-indigo-700">Total Interviews</p>
              <p className="text-2xl font-bold text-indigo-600">{interviewsArray.length}</p>
            </div>
            <div>
              <p className="text-sm text-indigo-700">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {interviewsArray.filter(i => i.status === 'completed').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-indigo-700">Avg Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(
                  interviewsArray
                    .filter(i => i.status === 'completed' && i.evaluation?.score)
                    .reduce((sum, i) => sum + (i.evaluation?.score || 0), 0) /
                    interviewsArray.filter(i => i.status === 'completed').length || 0
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-indigo-700">Best Score</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.max(
                  0,
                  ...interviewsArray
                    .filter(i => i.status === 'completed')
                    .map(i => i.evaluation?.score || 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
