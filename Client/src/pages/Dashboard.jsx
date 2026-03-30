import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useInterview } from '../hooks/useInterview'
import { useSearchParams } from 'react-router-dom'
import { interviewService } from '../services/interviewService'
import OverviewSection from '../components/OverviewSection'
import ProfileSection from '../components/ProfileSection'
import InterviewHistory from '../components/InterviewHistory'
import AnalyticsSection from '../components/AnalyticsSection'
import StatsCard from '../components/StatsCard'
import { TrendingUp, Clock, Target, Award } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { resetInterview } = useInterview()
  const [searchParams] = useSearchParams()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(() => {
    // Check if tab is specified in URL query params
    const tabParam = searchParams.get('tab')
    return tabParam || 'overview'
  })

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await interviewService.getInterviews()
        setInterviews(data || [])
      } catch (err) {
        const errorMsg = err.response?.data?.error?.message || 'Failed to fetch interview history'
        setError(errorMsg)
        console.error('Failed to fetch interviews:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchInterviews()
    }
  }, [user])

  // Calculate statistics
  const calculateStats = () => {
    if (!interviews.length) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        improvementRate: 0,
        roleStats: {},
        scriptScoreHistory: []
      }
    }

    const completedInterviews = interviews.filter(i => i.status === 'completed')
    
    if (!completedInterviews.length) {
      return {
        totalInterviews: interviews.length,
        averageScore: 0,
        bestScore: 0,
        improvementRate: 0,
        roleStats: {},
        scriptScoreHistory: []
      }
    }

    const scores = completedInterviews.map(i => i.evaluation?.score || 0)
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const bestScore = Math.max(...scores)
    
    // Calculate improvement (first 3 vs last 3 interviews)
    let improvementRate = 0
    if (completedInterviews.length >= 3) {
      const firstThree = completedInterviews.slice(-3).map(i => i.evaluation?.score || 0)
      const lastThree = completedInterviews.slice(0, 3).map(i => i.evaluation?.score || 0)
      const firstAvg = firstThree.reduce((a, b) => a + b, 0) / firstThree.length
      const lastAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length
      improvementRate = Math.round(((lastAvg - firstAvg) / firstAvg) * 100)
    }

    // Role statistics
    const roleStats = {}
    completedInterviews.forEach(interview => {
      const role = interview.jobRole
      if (!roleStats[role]) {
        roleStats[role] = { count: 0, scores: [], avgScore: 0 }
      }
      roleStats[role].count++
      roleStats[role].scores.push(interview.evaluation?.score || 0)
    })

    Object.keys(roleStats).forEach(role => {
      const scores = roleStats[role].scores
      roleStats[role].avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    })

    // Score history for charts
    const scriptScoreHistory = completedInterviews
      .reverse()
      .slice(0, 10)
      .map((interview, idx) => ({
        name: `Interview ${idx + 1}`,
        score: interview.evaluation?.score || 0,
        date: new Date(interview.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        role: interview.jobRole
      }))

    return {
      totalInterviews: interviews.length,
      averageScore: avgScore,
      bestScore: bestScore,
      improvementRate: improvementRate,
      roleStats: roleStats,
      scriptScoreHistory: scriptScoreHistory
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Performance Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track your interview progress and improvement</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={<Target className="w-6 h-6" />}
              label="Total Interviews"
              value={stats.totalInterviews}
              color="indigo"
            />
            <StatsCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Average Score"
              value={`${stats.averageScore}/100`}
              color="purple"
            />
            <StatsCard
              icon={<Award className="w-6 h-6" />}
              label="Best Score"
              value={`${stats.bestScore}/100`}
              color="green"
            />
            <StatsCard
              icon={<Clock className="w-6 h-6" />}
              label="Improvement"
              value={`${stats.improvementRate > 0 ? '+' : ''}${stats.improvementRate}%`}
              color={stats.improvementRate >= 0 ? 'green' : 'red'}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-200 overflow-x-auto">
          {['overview', 'analytics', 'history', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold capitalize border-b-4 transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-indigo-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {activeTab === 'overview' && (
            <OverviewSection user={user} stats={stats} interviews={interviews} />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <AnalyticsSection stats={stats} interviews={interviews} detailed={true} />
            </div>
          )}

          {activeTab === 'history' && (
            <InterviewHistory interviews={interviews} loading={loading} />
          )}

          {activeTab === 'profile' && user && (
            <ProfileSection user={user} stats={stats} />
          )}
        </div>

        {/* Action Button */}
        {interviews.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                resetInterview()
                window.location.href = '/interview-mode'
              }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Take Another Interview
            </button>
          </div>
        )}

        {interviews.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Interviews Yet</h3>
            <p className="text-gray-600 mb-6">Start your first interview to see your progress here</p>
            <button
              onClick={() => {
                resetInterview()
                window.location.href = '/interview-mode'
              }}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Start First Interview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
