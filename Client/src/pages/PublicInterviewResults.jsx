import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader, Home, Download, Mail } from 'lucide-react'

const PublicInterviewResults = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [interviewData, setInterviewData] = useState(null)
  const [answers, setAnswers] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    // Get data from localStorage
    const savedInterview = localStorage.getItem('currentInterview')
    const savedAnswers = localStorage.getItem('interviewAnswers')

    if (!savedInterview || !savedAnswers) {
      setError('Interview data not found. Please complete the interview first.')
      setLoading(false)
      return
    }

    setInterviewData(JSON.parse(savedInterview))
    setAnswers(JSON.parse(savedAnswers))
    setLoading(false)
  }, [])

  // Evaluate answers
  useEffect(() => {
    if (interviewData && answers && !results && !evaluating) {
      evaluateAnswers()
    }
  }, [interviewData, answers])

  const evaluateAnswers = async () => {
    try {
      setEvaluating(true)

      const candidateInfo = JSON.parse(localStorage.getItem('candidateInfo') || '{}')

      // Format answers for evaluation
      const formattedAnswers = interviewData.questions.map((q, idx) => {
        const answer = answers[idx]
        return {
          question: q.question,
          answer: answer?.content || 'No answer provided',
        }
      })

      // Send to backend for evaluation
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interview/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interviewData.interviewId,
          jobRole: interviewData.jobRole,
          experienceLevel: interviewData.experienceLevel,
          questions: formattedAnswers,
          interviewType: interviewData.interviewType,
          difficultyLevel: interviewData.difficultyLevel,
          candidateEmail: candidateInfo.email,
          candidateName: candidateInfo.name,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Evaluation failed')
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      toast.error('Failed to evaluate interview: ' + error.message, {
        position: 'top-right',
        autoClose: 3000,
      })
      setError('Failed to evaluate your interview. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  const sendResultsEmail = async () => {
    if (!results || sendingEmail) return

    setSendingEmail(true)
    try {
      const candidateInfo = JSON.parse(localStorage.getItem('candidateInfo') || '{}')

      const response = await fetch(`${import.meta.env.VITE_API_URL}/interview/send-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: candidateInfo.email,
          interviewId: interviewData.interviewId,
          results: results,
        }),
      })

      if (response.ok) {
        toast.success(`Results sent to ${candidateInfo.email}`, {
          position: 'top-right',
          autoClose: 3000,
        })
      } else {
        toast.error('Failed to send email', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.error('Error sending email', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-3">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (evaluating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader className="animate-spin mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluating Your Interview</h2>
          <p className="text-gray-600">
            Our AI is analyzing your responses. This may take a minute...
          </p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600">No results available</p>
        </div>
      </div>
    )
  }

  const candidateInfo = JSON.parse(localStorage.getItem('candidateInfo') || '{}')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Results</h1>
          <p className="text-gray-600">Your performance evaluation for {interviewData.jobRole}</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-white">
                  {Math.round(results.overallScore || 0)}
                </p>
                <p className="text-green-100 text-sm font-medium">/ 100</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {results.performanceLevel || 'Completed'}
            </h2>
            <p className="text-gray-600 mb-6">{results.summary || 'Interview completed successfully'}</p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Candidate:</strong> {candidateInfo.name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Position:</strong> {interviewData.jobRole}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Interview Type:</strong> {interviewData.interviewType}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        {results.scores && Object.keys(results.scores).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Evaluation</h3>

            <div className="space-y-6">
              {Object.entries(results.scores).map(([category, score]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <span className="text-lg font-bold text-gray-900">{Math.round(score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        score >= 80
                          ? 'bg-green-600'
                          : score >= 60
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {results.feedback && Object.keys(results.feedback).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Feedback</h3>

            <div className="space-y-4">
              {results.feedback.strengths && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {(Array.isArray(results.feedback.strengths)
                      ? results.feedback.strengths
                      : [results.feedback.strengths]
                    ).map((item, idx) => (
                      <li key={idx} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.feedback.areasForImprovement && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Areas for Improvement</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {(Array.isArray(results.feedback.areasForImprovement)
                      ? results.feedback.areasForImprovement
                      : [results.feedback.areasForImprovement]
                    ).map((item, idx) => (
                      <li key={idx} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question-by-Question Review */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Answer Reviews</h3>

          <div className="space-y-6">
            {(results.questions || []).map((q, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Q{idx + 1}: {q.question}</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{q.answer}</p>
                </div>

                {q.feedback && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Feedback:</strong> {q.feedback}
                    </p>
                  </div>
                )}

                {q.score !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Score</p>
                      <span className="font-bold text-lg">{Math.round(q.score)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${q.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={sendResultsEmail}
            disabled={sendingEmail}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {sendingEmail ? (
              <>
                <Loader size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail size={18} />
                Email Results
              </>
            )}
          </button>

          <button
            onClick={() => {
              // Download PDF would be implemented here
              toast.info('PDF download coming soon!', {
                position: 'top-right',
                autoClose: 3000,
              })
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            <Download size={18} />
            Download PDF
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('currentInterview')
              localStorage.removeItem('interviewAnswers')
              localStorage.removeItem('candidateInfo')
              navigate('/')
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Thank you for taking the interview!</p>
        </div>
      </div>
    </div>
  )
}

export default PublicInterviewResults
