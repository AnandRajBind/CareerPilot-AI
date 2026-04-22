import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  Loader, 
  Download, 
  Home, 
  Share2, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown 
} from 'lucide-react'

const MockInterviewResult = () => {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState({})

  useEffect(() => {
    const loadResult = async () => {
      try {
        // Try to get from cache first
        const cachedResult = localStorage.getItem('mockInterviewResult')
        if (cachedResult) {
          setResult(JSON.parse(cachedResult))
          localStorage.removeItem('mockInterviewResult')
          setLoading(false)
          return
        }

        // Fetch from API if not cached
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/mock/result/${interviewId}`
        )

        if (!response.ok) {
          throw new Error('Failed to load interview result')
        }

        const data = await response.json()
        setResult(data.data)
      } catch (error) {
        console.error('Error loading result:', error)
        toast.error('Failed to load interview result', {
          position: 'top-right',
          autoClose: 3000,
        })
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [interviewId, navigate])

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const downloadReport = () => {
    if (!result) return

    const reportLines = [
      'Mock Interview Report',
      '====================',
      `Student: ${result.studentName}`,
      `Roll Number: ${result.rollNumber}`,
      `College: ${result.collegeName}`,
      `Date: ${new Date(result.completedAt).toLocaleDateString()}`,
      '',
      'Interview Details',
      '-----------------',
      `Job Role: ${result.jobRole}`,
      `Experience Level: ${result.experienceLevel}`,
      `Interview Type: ${result.interviewType}`,
      `Difficulty: ${result.difficultyLevel}`,
      `Duration: ${Math.floor(result.duration / 60)} minutes ${result.duration % 60} seconds`,
      '',
      `Overall Score: ${result.overallScore}/10`,
      '',
      'Feedback',
      '--------',
      `Strengths: ${result.overallFeedback.strengths}`,
      `Weaknesses: ${result.overallFeedback.weaknesses}`,
      `Suggestions: ${result.overallFeedback.suggestions}`,
      `Interview Tips: ${result.overallFeedback.interviewTips}`,
      '',
      'Question-wise Performance',
      '-------------------------',
    ]

    result.evaluations.forEach((evaluation, idx) => {
      reportLines.push('')
      reportLines.push(`Question ${idx + 1}: ${evaluation.question}`)
      reportLines.push(`Your Answer: ${evaluation.answer}`)
      reportLines.push(`Score: ${evaluation.score}/10`)
      reportLines.push(`Strengths: ${evaluation.strengths}`)
      reportLines.push(`Weaknesses: ${evaluation.weaknesses}`)
      reportLines.push(`Suggestions: ${evaluation.suggestions}`)
      reportLines.push(`Model Answer: ${evaluation.modelAnswer}`)
      reportLines.push('---')
    })

    const reportContent = reportLines.join('\n')

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent)
    )
    element.setAttribute(
      'download',
      `mock-interview-report-${result.studentName}-${new Date().toISOString().split('T')[0]}.txt`
    )
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast.success('Report downloaded successfully!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't load your interview results. Please try again.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const scorePercentage = (result.overallScore / 10) * 100
  const scoreColor =
    result.overallScore >= 7 ? 'text-green-600' :
    result.overallScore >= 5 ? 'text-yellow-600' :
    'text-red-600'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Results</h1>
          <p className="text-gray-600">Your mock interview has been completed and evaluated</p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Overall Score</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${scoreColor}`}>
                  {result.overallScore.toFixed(1)}
                </span>
                <span className="text-2xl text-gray-400">/10</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-32 h-32 rounded-full relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke={
                      result.overallScore >= 7
                        ? '#10b981'
                        : result.overallScore >= 5
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                    strokeWidth="8"
                    strokeDasharray={`${(scorePercentage / 100) * 377} 377`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-900">
                    {Math.round(scorePercentage)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Job Role
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {result.jobRole}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Experience
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                {result.experienceLevel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Duration
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {Math.floor(result.duration / 60)}m {result.duration % 60}s
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Questions
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {result.totalQuestions}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Feedback */}
        {result.overallFeedback && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-600" />
              Overall Feedback
            </h2>

            <div className="space-y-6">
              {/* Strengths */}
              {result.overallFeedback.strengths && (
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-2">
                    <CheckCircle size={20} />
                    Strengths
                  </h3>
                  <p className="text-gray-700">{result.overallFeedback.strengths}</p>
                </div>
              )}

              {/* Weaknesses */}
              {result.overallFeedback.weaknesses && (
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2 mb-2">
                    <AlertCircle size={20} />
                    Areas for Improvement
                  </h3>
                  <p className="text-gray-700">{result.overallFeedback.weaknesses}</p>
                </div>
              )}

              {/* Suggestions */}
              {result.overallFeedback.suggestions && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">💡 Suggestions</h3>
                  <p className="text-gray-700">{result.overallFeedback.suggestions}</p>
                </div>
              )}

              {/* Interview Tips */}
              {result.overallFeedback.interviewTips && (
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-purple-700 mb-2">📌 Interview Tips</h3>
                  <p className="text-gray-700">{result.overallFeedback.interviewTips}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question-wise Performance */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Question-wise Performance
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {result.evaluations.map((evaluation, index) => (
              <div key={index} className="p-6">
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full text-left flex items-start justify-between gap-4 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        Q{index + 1}
                      </span>
                      <span className={`text-lg font-semibold ${
                        evaluation.score >= 7 ? 'text-green-600' :
                        evaluation.score >= 5 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {evaluation.score}/10
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {evaluation.question}
                    </p>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${
                      expandedQuestions[index] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                {expandedQuestions[index] && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    {/* User's Answer */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Your Answer
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {evaluation.answer}
                      </p>
                    </div>

                    {/* Strengths */}
                    {evaluation.strengths && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">
                          ✓ Strengths
                        </h4>
                        <p className="text-gray-700">{evaluation.strengths}</p>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {evaluation.weaknesses && (
                      <div>
                        <h4 className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-2">
                          ⚠ Areas to Improve
                        </h4>
                        <p className="text-gray-700">{evaluation.weaknesses}</p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {evaluation.suggestions && (
                      <div>
                        <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">
                          💡 Suggestions
                        </h4>
                        <p className="text-gray-700">{evaluation.suggestions}</p>
                      </div>
                    )}

                    {/* Model Answer */}
                    {evaluation.modelAnswer && (
                      <div>
                        <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">
                          📌 Model Answer
                        </h4>
                        <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">
                          {evaluation.modelAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            <Download size={20} />
            Download Report
          </button>
          <button
            onClick={() => navigate('/mock-interview-dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            <BarChart3 size={20} />
            My Dashboard
          </button>
          <button
            onClick={() => navigate('/mock-interview-setup')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Take Another Interview
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <Home size={20} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default MockInterviewResult
