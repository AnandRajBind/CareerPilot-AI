import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#4f46e5', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export default function AnalyticsSection({ stats, interviews, detailed = false }) {
  // Safety checks: ensure props are valid
  const interviewsArray = Array.isArray(interviews) ? interviews : [];
  const statsObj = stats || {};

  // Prepare data for charts
  const scoreData = statsObj.scriptScoreHistory || [];

  // Role performance data
  const rolePerformanceData = Object.entries(statsObj.roleStats || {}).map(([role, data]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    score: data.avgScore,
    count: data.count,
  }))

  // Difficulty distribution
  const difficultyData = [
    {
      name: 'Easy',
      value: interviewsArray.filter(i => i.difficultyLevel === 'easy').length,
    },
    {
      name: 'Medium',
      value: interviewsArray.filter(i => i.difficultyLevel === 'medium').length,
    },
    {
      name: 'Hard',
      value: interviewsArray.filter(i => i.difficultyLevel === 'hard').length,
    },
  ].filter(d => d.value > 0)

  // Score distribution
  const scoreDistribution = [
    {
      name: 'Excellent (80+)',
      value: interviewsArray.filter(
        i => i.status === 'completed' && (i.evaluation?.score || 0) >= 80
      ).length,
    },
    {
      name: 'Good (60-79)',
      value: interviewsArray.filter(
        i => i.status === 'completed' && (i.evaluation?.score || 0) >= 60 && (i.evaluation?.score || 0) < 80
      ).length,
    },
    {
      name: 'Needs Work (<60)',
      value: interviewsArray.filter(
        i => i.status === 'completed' && (i.evaluation?.score || 0) < 60
      ).length,
    },
  ].filter(d => d.value > 0)

  // Interview type distribution
  const typeData = [
    {
      name: 'Technical',
      value: interviewsArray.filter(i => i.interviewType === 'technical').length,
    },
    {
      name: 'Behavioral',
      value: interviewsArray.filter(i => i.interviewType === 'behavioral').length,
    },
    {
      name: 'Combined',
      value: interviewsArray.filter(i => i.interviewType === 'combined').length,
    },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8">
      {/* Score Trend Chart */}
      {scoreData.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value}/100`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Role Performance Chart */}
      {rolePerformanceData.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Performance by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rolePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value}/100`}
              />
              <Legend />
              <Bar dataKey="score" fill="#a855f7" name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {detailed && (
        <>
          {/* Distribution Charts - 2 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Difficulty Distribution */}
            {difficultyData.length > 0 && (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⭐ Difficulty Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Score Distribution */}
            {scoreDistribution.length > 0 && (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Score Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Interview Type Distribution */}
          {typeData.length > 0 && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎤 Interview Type Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#ec4899" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4">💡 AI Insights</h3>
            <div className="space-y-3 text-blue-800">
              {(statsObj.averageScore || 0) >= 80 ? (
                <p>
                  🌟 <strong>Excellent performance!</strong> You're consistently scoring high. Try harder difficulty levels to further improve.
                </p>
              ) : (statsObj.averageScore || 0) >= 60 ? (
                <p>
                  👍 <strong>Good foundation.</strong> Focus on the identified weak areas to boost your scores to 80+.
                </p>
              ) : (
                <p>
                  💪 <strong>Keep practicing.</strong> Each interview is a learning opportunity. Study the model answers and weak areas.
                </p>
              )}

              {rolePerformanceData.length > 1 && (
                <p>
                  🎯 <strong>Best role:</strong>{' '}
                  {rolePerformanceData.reduce((best, current) => 
                    current.score > best.score ? current : best
                  ).name}{' '}
                  ({rolePerformanceData.reduce((best, current) => 
                    current.score > best.score ? current : best
                  ).score}/100)
                </p>
              )}

              {(statsObj.improvementRate || 0) > 0 ? (
                <p>
                  📈 <strong>Positive trend:</strong> Your recent interviews are {Math.abs(statsObj.improvementRate)}% better than your earlier ones!
                </p>
              ) : (statsObj.improvementRate || 0) < 0 ? (
                <p>
                  📉 <strong>Attention needed:</strong> Recent scores are lower. Review your recent weak areas and practice more.
                </p>
              ) : (
                <p>
                  ➡️ <strong>Consistent performance:</strong> Your scores are steady. Try new roles or difficulty levels for growth.
                </p>
              )}

              {interviewsArray.length < 5 && (
                <p>
                  📊 <strong>More data needed:</strong> Complete at least 5 interviews for meaningful trend analysis.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
