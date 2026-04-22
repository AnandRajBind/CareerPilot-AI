import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, Download, Eye, Plus, TrendingUp, Award, Calendar, Zap } from 'lucide-react'

const MockInterviewDashboard = () => {
  const navigate = useNavigate()
  const [studentInfo, setStudentInfo] = useState(null)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = async () => {
    try {
      // Get student info from localStorage
      const stored = localStorage.getItem('studentInfo')
      if (!stored) {
        toast.error('Student information not found. Please start an interview first.')
        navigate('/mock-interview')
        return
      }

      const student = JSON.parse(stored)
      setStudentInfo(student)

      // Fetch history from API
      const historyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/mock/history/${student.rollNumber.toLowerCase()}`
      )

      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setHistory(historyData.data.interviews || [])

        // Fetch stats
        const statsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/mock/stats/${student.rollNumber.toLowerCase()}`
        )

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            totalAttempts: statsData.data.totalAttempts,
            bestScore: statsData.data.bestScore,
            averageScore: statsData.data.averageScore,
            latestScore: historyData.data.latestScore || statsData.data.bestScore,
          })
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard')
      setLoading(false)
    }
  }

  const handleViewResult = (interviewId) => {
    navigate(`/mock-interview-result/${interviewId}`)
  }

  const handleStartNewInterview = () => {
    // Clear previous data and start fresh
    localStorage.removeItem('mockInterviewData')
    localStorage.removeItem('interviewData')
    localStorage.removeItem('isMockInterview')
    navigate('/mock-interview-setup')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin">
            <Award size={48} className="text-indigo-600 mx-auto mb-4" />
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium transition"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Interview Dashboard</h1>
                <p className="text-gray-600">Welcome, <span className="font-semibold">{studentInfo?.studentName}</span></p>
              </div>
              <button
                onClick={handleStartNewInterview}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition"
              >
                <Plus size={20} />
                Start New Interview
              </button>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{studentInfo?.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                <p className="text-lg font-semibold text-gray-900">{studentInfo?.rollNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">College</p>
                <p className="text-lg font-semibold text-gray-900">{studentInfo?.collegeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900 truncate">{studentInfo?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Attempts</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalAttempts || 0}</p>
                </div>
                <Award className="text-indigo-600 opacity-20" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Best Score</p>
                  <p className="text-3xl font-bold text-green-600">{stats.bestScore?.toFixed(1) || 0}/10</p>
                </div>
                <TrendingUp className="text-green-600 opacity-20" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.averageScore?.toFixed(1) || 0}/10</p>
                </div>
                <Zap className="text-blue-600 opacity-20" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Latest Score</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.latestScore?.toFixed(1) || 0}/10</p>
                </div>
                <Calendar className="text-purple-600 opacity-20" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Interview History */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Interview History</h2>
            <p className="text-gray-600 mt-1">View and manage your previous interview attempts</p>
          </div>

          {history && history.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {history.map((attempt) => (
                <div key={attempt._id || attempt.interviewId} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          Attempt {attempt.attemptNumber || history.length}
                        </span>
                        <span className="text-sm text-gray-600">
                          {attempt.jobRole ? `${attempt.jobRole.toUpperCase()} • ` : ''}
                          {attempt.experienceLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">
                        {(attempt.score || 0).toFixed(1)}
                        <span className="text-lg text-gray-600">/10</span>
                      </div>
                      <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        attempt.score >= 7
                          ? 'bg-green-50 text-green-700'
                          : attempt.score >= 5
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {attempt.status || 'completed'}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === attempt._id ? null : attempt._id)
                      }
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition"
                    >
                      {expandedId === attempt._id ? '▼ Hide Details' : '▶ Show Details'}
                    </button>

                    {expandedId === attempt._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Questions</p>
                            <p className="font-semibold text-gray-900">{attempt.numberOfQuestions}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Type</p>
                            <p className="font-semibold text-gray-900 capitalize">
                              {attempt.interviewType}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Difficulty</p>
                            <p className="font-semibold text-gray-900 capitalize">
                              {attempt.difficultyLevel}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">
                              {Math.round((new Date(attempt.updatedAt) - new Date(attempt.createdAt)) / 60000)} mins
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewResult(attempt._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-medium transition text-sm"
                    >
                      <Eye size={16} />
                      View Detailed Result
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Award size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-6">No interview attempts yet</p>
              <button
                onClick={handleStartNewInterview}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
              >
                Start Your First Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MockInterviewDashboard
