import React, { useState, useEffect } from 'react'
import { Search, Download, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import AdminLayout from '../components/AdminLayout'

const AdminResults = () => {
  const [interviews, setInterviews] = useState([])
  const [filteredInterviews, setFilteredInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')

  useEffect(() => {
    fetchResults()
  }, [])

  useEffect(() => {
    filterAndSortResults()
  }, [interviews, searchTerm, sortBy])

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const completed = (data.interviews || []).filter((i) => i.status === 'completed')
        setInterviews(completed)
      }
    } catch (error) {
      toast.error('Failed to load results', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortResults = () => {
    let filtered = interviews

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.interviewType?.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by role or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-blue-900">
                {Math.round(
                  interviews.reduce((sum, i) => sum + (i.evaluation?.score || 0), 0) / interviews.length
                )}
                %
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Highest Score</p>
              <p className="text-2xl font-bold text-green-900">
                {Math.max(...interviews.map((i) => i.evaluation?.score || 0))}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Total Completed</p>
              <p className="text-2xl font-bold text-purple-900">{interviews.length}</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminResults
