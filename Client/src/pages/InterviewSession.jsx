import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from 'lucide-react'

const InterviewSession = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [templateInfo, setTemplateInfo] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTemplateInfo()
  }, [token])

  const fetchTemplateInfo = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/interview/session/${token}/info`)

      if (response.ok) {
        const data = await response.json()
        setTemplateInfo(data.data)
        setShowForm(true)
      } else {
        toast.error('Interview session not found or has expired', {
          position: 'top-right',
          autoClose: 3000,
        })
        setTimeout(() => navigate('/'), 3000)
      }
    } catch (error) {
      toast.error('Failed to load interview session', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.candidateName.trim()) {
      newErrors.candidateName = 'Name is required'
    }

    if (!formData.candidateEmail.trim()) {
      newErrors.candidateEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.candidateEmail)) {
      newErrors.candidateEmail = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`http://localhost:9000/api/interview/session/${token}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: formData.candidateName,
          candidateEmail: formData.candidateEmail,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store interview data in localStorage
        localStorage.setItem(
          'currentInterview',
          JSON.stringify({
            interviewId: data.data.interviewId,
            questions: data.data.questions,
            numberOfQuestions: data.data.numberOfQuestions,
            jobRole: data.data.jobRole,
            experienceLevel: data.data.experienceLevel,
            interviewType: data.data.interviewType,
            difficultyLevel: data.data.difficultyLevel,
            isTemplateBasedInterview: true,
          })
        )

        // Store candidate info
        localStorage.setItem(
          'candidateInfo',
          JSON.stringify({
            name: formData.candidateName,
            email: formData.candidateEmail,
          })
        )

        toast.success('Interview started! Redirecting to system check...', {
          position: 'top-right',
          autoClose: 2000,
        })

        setTimeout(() => navigate(`/interview/session/${token}/system-check`), 2000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to start interview', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-primary" size={40} />
          <p className="text-gray-600">Loading interview session...</p>
        </div>
      </div>
    )
  }

  if (!templateInfo) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Interview Session</h1>
            <p className="text-sm text-gray-600">Welcome to CareerPilot AI Interview</p>
          </div>

          {/* Interview Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Interview Details</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-0.5">Role</p>
                <p className="text-xs font-semibold text-gray-900">{templateInfo.jobRole}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-0.5">Type</p>
                <p className="text-xs font-semibold text-gray-900">{templateInfo.interviewType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-0.5">Level</p>
                <p className="text-xs font-semibold text-gray-900">{templateInfo.experienceLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-0.5">Difficulty</p>
                <p className="text-xs font-semibold text-gray-900">{templateInfo.difficultyLevel}</p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-xs text-gray-600 uppercase font-medium mb-0.5">Questions</p>
              <p className="text-xs font-semibold text-gray-900">{templateInfo.numberOfQuestions} questions</p>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                    errors.candidateName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.candidateName && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.candidateName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  value={formData.candidateEmail}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                    errors.candidateEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.candidateEmail && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.candidateEmail}</p>
                )}
              </div>

              {/* Info */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-900">
                  <span className="font-semibold">📝 Note:</span> This interview will be recorded and evaluated using AI.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 text-sm rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {submitting ? 'Starting Interview...' : 'Start Interview'}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-3 flex-shrink-0">
            © 2024 CareerPilot AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InterviewSession
