import React from 'react'
import { TrendingUp, Target, Award, Zap } from 'lucide-react'

export default function OverviewSection({ company, stats, interviews }) {
  // Safety checks
  const statsObj = stats || {
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    improvementRate: 0,
    roleStats: {},
  }

  const interviewsArray = Array.isArray(interviews) ? interviews : []
  const completedInterviews = interviewsArray.filter(i => i.status === 'completed')

  // Get recent interviews
  const recentInterviews = completedInterviews.slice(0, 3)

  // Get performance level
  const getPerformanceLevel = () => {
    const avgScore = statsObj.averageScore || 0
    if (avgScore >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (avgScore >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (avgScore >= 40) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const performance = getPerformanceLevel()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8 border-2 border-indigo-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to {company?.companyName}! 👋
        </h2>
        <p className="text-gray-600 mb-4">
          {statsObj.totalInterviews === 0
            ? "Start your first interview to begin tracking your company's progress"
            : `Your company has completed ${completedInterviews.length} interview${completedInterviews.length !== 1 ? 's' : ''}. Keep up the great work!`}
        </p>
      </div>

      {/* Performance Summary */}
      <div className={`${performance.bg} rounded-lg p-8 border-2 border-gray-200`}>
        <div className="flex items-center gap-4 mb-4">
          <Award className={`w-8 h-8 ${performance.color}`} />
          <h3 className="text-2xl font-bold text-gray-900">Your Performance Level</h3>
        </div>
        <p className={`text-4xl font-bold ${performance.color} mb-2`}>{performance.level}</p>
        <p className="text-gray-600">
          {performance.level === 'Excellent' &&
            'Outstanding! You\'re consistently scoring high. Try harder difficulty levels to push yourself further.'}
          {performance.level === 'Good' &&
            'Great progress! Focus on areas of improvement to reach the 80+ score range.'}
          {performance.level === 'Fair' &&
            'Solid foundation! Keep practicing and reviewing weak areas to improve faster.'}
          {performance.level === 'Needs Work' &&
            'Every interview is a learning opportunity. Review the feedback and practice consistently.'}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Interviews */}
          <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <p className="text-sm text-indigo-700 font-semibold">Total Interviews</p>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{statsObj.totalInterviews}</p>
            <p className="text-xs text-indigo-600 mt-2">
              {completedInterviews.length} completed
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-purple-700 font-semibold">Average Score</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{statsObj.averageScore}/100</p>
            <p className="text-xs text-purple-600 mt-2">
              {statsObj.totalInterviews > 0
                ? `Out of ${statsObj.totalInterviews} interviews`
                : 'Take an interview to start'}
            </p>
          </div>

          {/* Improvement */}
          <div className={`${statsObj.improvementRate >= 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} rounded-lg p-6 border-2`}>
            <div className="flex items-center gap-3 mb-2">
              <Zap className={`w-5 h-5 ${statsObj.improvementRate >= 0 ? 'text-green-600' : 'text-orange-600'}`} />
              <p className={`text-sm font-semibold ${statsObj.improvementRate >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                Improvement Trend
              </p>
            </div>
            <p className={`text-3xl font-bold ${statsObj.improvementRate >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {statsObj.improvementRate > 0 ? '+' : ''}{statsObj.improvementRate}%
            </p>
            <p className={`text-xs mt-2 ${statsObj.improvementRate >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {statsObj.improvementRate > 0 ? 'Getting better!' : statsObj.improvementRate < 0 ? 'Focus more' : 'Consistent'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      {recentInterviews.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Interviews</h3>
          <div className="space-y-3">
            {recentInterviews.map((interview, idx) => (
              <div key={interview._id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">
                    {idx + 1}. {interview.jobRole.charAt(0).toUpperCase() + interview.jobRole.slice(1)} Interview
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(interview.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} • Difficulty: {interview.difficultyLevel}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    (interview.evaluation?.score || 0) >= 80 ? 'text-green-600' :
                    (interview.evaluation?.score || 0) >= 60 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {interview.evaluation?.score || 0}/100
                  </p>
                  <p className="text-xs text-gray-600">{interview.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Quick Tips</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✓ Practice regularly to improve consistency</li>
          <li>✓ Review weak areas after each interview</li>
          <li>✓ Gradually increase difficulty levels</li>
          <li>✓ Focus on one role at a time for better results</li>
        </ul>
      </div>
    </div>
  )
}
