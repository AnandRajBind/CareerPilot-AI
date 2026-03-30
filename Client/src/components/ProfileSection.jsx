import React from 'react'
import { User, Mail, Calendar, Trophy, Target, TrendingUp } from 'lucide-react'

export default function ProfileSection({ user, stats }) {
  // Safety check: ensure stats is an object with default values
  const statsObj = stats || {
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    improvementRate: 0,
    roleStats: {},
  }

  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A'

  const getRoleColor = (role) => {
    const colors = {
      frontend: 'bg-blue-100 text-blue-800',
      backend: 'bg-purple-100 text-purple-800',
      fullstack: 'bg-pink-100 text-pink-800',
      java: 'bg-orange-100 text-orange-800',
      hr: 'bg-green-100 text-green-800',
      general: 'bg-indigo-100 text-indigo-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-8">
      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-8 border-2 border-indigo-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{user?.name}</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Interviews */}
          <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Interviews</p>
                <p className="text-3xl font-bold text-indigo-600">{statsObj.totalInterviews}</p>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-purple-600">{statsObj.averageScore}</p>
              </div>
            </div>
          </div>

          {/* Best Score */}
          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center text-white">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Best Score</p>
                <p className="text-3xl font-bold text-green-600">{statsObj.bestScore}</p>
              </div>
            </div>
          </div>

          {/* Improvement */}
          <div className={`${statsObj.improvementRate >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} rounded-lg p-6 border-2`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${statsObj.improvementRate >= 0 ? 'bg-blue-600' : 'bg-orange-600'} rounded-lg flex items-center justify-center text-white`}>
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Improvement Rate</p>
                <p className={`text-3xl font-bold ${statsObj.improvementRate >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {statsObj.improvementRate > 0 ? '+' : ''}{statsObj.improvementRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Breakdown */}
      {Object.keys(statsObj.roleStats).length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance by Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(statsObj.roleStats).map(([role, data]) => (
              <div key={role} className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${getRoleColor(role)}`}>
                      {role}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-indigo-600">{data.avgScore}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Interviews: {data.count}</span>
                  <span>Avg Score: {data.avgScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-8 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">💡 Tips for Improvement</h3>
        <ul className="space-y-3 text-blue-800">
          <li className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>Practice regularly - take at least 2-3 interviews per week to maintain momentum</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>Focus on weak areas - review the weaknesses section in your results</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>Study model answers - learn from the provided solutions</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>Diversify roles - practice different roles to build a well-rounded skill set</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-lg">✓</span>
            <span>Increase difficulty - once comfortable, move to medium and hard levels</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
