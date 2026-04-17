import React, { useState, useEffect } from 'react'
import { Search, Download, Filter, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import AdminLayout from '../components/AdminLayout'

const AdminResults = () => {
  const [interviews, setInterviews] = useState([])
  const [filteredInterviews, setFilteredInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRole, setSelectedRole] = useState('all')
  const [scoreRange, setScoreRange] = useState([0, 100])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          toast.error('No authentication token found. Please login again.', {
            position: 'top-right',
            autoClose: 3000,
          })
          setLoading(false)
          return
        }

        // ===== PRODUCTION READINESS: Force fresh data (no caching) =====
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000/api'
        const response = await fetch(`${apiUrl}/interviews?status=completed&t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.success && data.data?.interviews) {
          setInterviews(data.data.interviews)
        } else if (Array.isArray(data)) {
          // Handle case where response is directly an array
          setInterviews(data)
        } else {
          setInterviews([])
        }
      } catch (error) {
        console.error('Error fetching results:', error)
        toast.error('Failed to load results: ' + error.message, {
          position: 'top-right',
          autoClose: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    // ===== PRODUCTION READINESS: Auto-refresh results every 30 seconds =====
    fetchResults()

    // Auto-refresh interval
    const refreshInterval = setInterval(fetchResults, 30000) // 30 seconds

    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    filterAndSortResults()
  }, [interviews, searchTerm, sortBy, selectedRole, scoreRange, dateRange])

  const filterAndSortResults = () => {
    let filtered = interviews

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.interviewType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter((i) => i.jobRole === selectedRole)
    }

    // Filter by score range
    filtered = filtered.filter(
      (i) =>
        (i.evaluation?.score || 0) >= scoreRange[0] &&
        (i.evaluation?.score || 0) <= scoreRange[1]
    )

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01')
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date('2999-12-31')
      
      filtered = filtered.filter((i) => {
        const interviewDate = new Date(i.createdAt)
        return interviewDate >= startDate && interviewDate <= endDate
      })
    }

    // Sort
    if (sortBy === 'score-asc') {
      filtered.sort((a, b) => (a.evaluation?.score || 0) - (b.evaluation?.score || 0))
    } else if (sortBy === 'score-desc') {
      filtered.sort((a, b) => (b.evaluation?.score || 0) - (a.evaluation?.score || 0))
    } else if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    setFilteredInterviews(filtered)
  }

  const downloadResults = (interview) => {
    const data = {
      candidateName: interview.candidateName || 'Anonymous',
      candidateEmail: interview.candidateEmail,
      jobRole: interview.jobRole,
      interviewType: interview.interviewType,
      experienceLevel: interview.experienceLevel,
      score: interview.evaluation?.score,
      strengths: interview.evaluation?.strengths,
      weaknesses: interview.evaluation?.weaknesses,
      suggestions: interview.evaluation?.suggestions,
      completedAt: interview.createdAt,
    }

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)))
    element.setAttribute('download', `interview-result-${interview._id}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast.success('Results downloaded successfully', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  // Generate chart data
  const getScoreDistributionData = () => {
    const ranges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 },
    ]

    return ranges.map((r) => ({
      name: r.range,
      count: interviews.filter((i) => (i.evaluation?.score || 0) >= r.min && (i.evaluation?.score || 0) <= r.max)
        .length,
    }))
  }

  const getRoleDistributionData = () => {
    const roleMap = {}
    interviews.forEach((i) => {
      roleMap[i.jobRole] = (roleMap[i.jobRole] || 0) + 1
    })

    return Object.entries(roleMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }

  const getScoreTrendData = () => {
    const sortedByDate = [...interviews].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const last7 = sortedByDate.slice(-7)

    return last7.map((i) => ({
      date: new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: i.evaluation?.score || 0,
    }))
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  const ScoreBar = ({ score }) => {
    let color = 'bg-red-500'
    if (score >= 75) color = 'bg-green-500'
    else if (score >= 50) color = 'bg-yellow-500'

    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className="font-semibold text-gray-900 w-12 text-right">{score}%</span>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Results</h1>
          <p className="text-gray-600 mt-1">
            View detailed evaluations and candidate performance
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by role, candidate, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
              </select>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                <Filter size={18} />
                Advanced Filters
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    <option value="all">All Roles</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Fullstack</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="hr">HR</option>
                  </select>
                </div>

                {/* Score Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score Range: {scoreRange[0]}-{scoreRange[1]}%
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scoreRange[0]}
                      onChange={(e) => setScoreRange([Math.min(parseInt(e.target.value), scoreRange[1]), scoreRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scoreRange[1]}
                      onChange={(e) => setScoreRange([scoreRange[0], Math.max(parseInt(e.target.value), scoreRange[0])])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setSelectedRole('all')
                    setScoreRange([0, 100])
                    setDateRange({ start: '', end: '' })
                  }}
                  className="md:col-span-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {interviews.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Score Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getScoreDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Role Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Interviews by Role</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getRoleDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getRoleDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Score Trend Chart */}
            {getScoreTrendData().length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Score Trend (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getScoreTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      dot={{ fill: '#6366f1', r: 6 }}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading results...</div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {interviews.length === 0 ? 'No completed interviews yet.' : 'No results match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Results List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview._id}
                  onClick={() => setSelectedInterview(interview)}
                  className={`bg-white rounded-lg shadow-sm border transition cursor-pointer ${
                    selectedInterview?._id === interview._id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{interview.jobRole}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {interview.candidateName ? `Candidate: ${interview.candidateName}` : 'Anonymous Candidate'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {interview.interviewType} • {interview.experienceLevel} Level
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {interview.evaluation?.score}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <ScoreBar score={interview.evaluation?.score || 0} />
                  </div>
                </div>
              ))}
            </div>

            {/* Details Panel */}
            {selectedInterview && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Details</h2>

                  {/* Score */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-600 uppercase mb-2">Overall Score</p>
                    <p className="text-4xl font-bold text-primary">
                      {selectedInterview.evaluation?.score}%
                    </p>
                  </div>

                  {/* Info */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    {selectedInterview.candidateName && (
                      <div>
                        <p className="text-xs text-gray-600">Candidate Name</p>
                        <p className="font-semibold text-gray-900">{selectedInterview.candidateName}</p>
                      </div>
                    )}
                    {selectedInterview.candidateEmail && (
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 break-all text-sm">{selectedInterview.candidateEmail}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600">Job Role</p>
                      <p className="font-semibold text-gray-900">{selectedInterview.jobRole}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Experience Level</p>
                      <p className="font-semibold text-gray-900">{selectedInterview.experienceLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Difficulty</p>
                      <p className="font-semibold text-gray-900">{selectedInterview.difficultyLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedInterview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Strengths */}
                  {selectedInterview.evaluation?.strengths?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">✓ Strengths</h3>
                      <ul className="space-y-2">
                        {selectedInterview.evaluation.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-600 leading-relaxed">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {selectedInterview.evaluation?.weaknesses?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">⚠ Areas to Improve</h3>
                      <ul className="space-y-2">
                        {selectedInterview.evaluation.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-gray-600 leading-relaxed">
                            • {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {selectedInterview.evaluation?.suggestions?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 Suggestions</h3>
                      <ul className="space-y-2">
                        {selectedInterview.evaluation.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-gray-600 leading-relaxed">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={() => downloadResults(selectedInterview)}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition font-medium"
                  >
                    <Download size={18} />
                    Download Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {interviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1 uppercase font-medium">Average Score</p>
              <p className="text-3xl font-bold text-blue-900">
                {Math.round(
                  interviews.reduce((sum, i) => sum + (i.evaluation?.score || 0), 0) / interviews.length
                )}
                %
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-1 uppercase font-medium">Highest Score</p>
              <p className="text-3xl font-bold text-green-900">
                {Math.max(...interviews.map((i) => i.evaluation?.score || 0))}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-gray-600 mb-1 uppercase font-medium">Total Interviews</p>
              <p className="text-3xl font-bold text-purple-900">{interviews.length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-xs text-gray-600 mb-1 uppercase font-medium">Lowest Score</p>
              <p className="text-3xl font-bold text-orange-900">
                {Math.min(...interviews.map((i) => i.evaluation?.score || 0))}%
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminResults
