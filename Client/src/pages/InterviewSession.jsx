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
      const response = await fetch(`http://localhost:5000/api/interview/session/${token}/info`)

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
      const response = await fetch(`http://localhost:5000/api/interview/session/${token}/start`, {
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

        toast.success('Interview started! Redirecting...', {
          position: 'top-right',
          autoClose: 2000,
        })

        setTimeout(() => navigate(`/interview/${data.data.interviewId}/start`), 2000)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Interview Session</h1>
            <p className="text-gray-600">Welcome to CareerPilot AI Interview</p>
          </div>

          {/* Interview Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-8 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Role</p>
                <p className="text-sm font-semibold text-gray-900">{templateInfo.jobRole}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Type</p>
                <p className="text-sm font-semibold text-gray-900">{templateInfo.interviewType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Level</p>
                <p className="text-sm font-semibold text-gray-900">{templateInfo.experienceLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Difficulty</p>
                <p className="text-sm font-semibold text-gray-900">{templateInfo.difficultyLevel}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-gray-600 uppercase font-medium mb-1">Questions</p>
              <p className="text-sm font-semibold text-gray-900">{templateInfo.numberOfQuestions} questions</p>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                    errors.candidateName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.candidateName && (
                  <p className="text-red-500 text-sm mt-1">{errors.candidateName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  value={formData.candidateEmail}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                    errors.candidateEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.candidateEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.candidateEmail}</p>
                )}
              </div>

              {/* Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> This interview will be recorded and evaluated using AI. 
                  Please provide your details to get started.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {submitting ? 'Starting Interview...' : 'Start Interview'}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            © 2024 CareerPilot AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InterviewSession
