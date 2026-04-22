import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'

const StudentRegistrationForm = ({ onSubmit = null, onCancel = null }) => {
  const navigate = useNavigate()
  const [step, setStep] = useState('registration') // registration, history, ready
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [studentHistory, setStudentHistory] = useState(null)
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    collegeName: '',
    email: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Full name is required'
    } else if (formData.studentName.trim().length < 2) {
      newErrors.studentName = 'Name must be at least 2 characters'
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required'
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required'
    }

    if (formData.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkStudentHistory = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Check if student has previous attempts
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mock/history/${formData.rollNumber.toLowerCase()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.data && result.data.interviews && result.data.interviews.length > 0) {
          setStudentHistory(result.data)
          setStep('history')
        } else {
          // No history, ready to proceed
          proceedToInterview()
        }
      } else {
        // If error fetching history, just proceed anyway
        proceedToInterview()
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      // Proceed anyway on error
      proceedToInterview()
    } finally {
      setIsLoading(false)
    }
  }

  const proceedToInterview = () => {
    // Save student info to localStorage
    localStorage.setItem('studentInfo', JSON.stringify(formData))

    // Clear any stale interview data
    localStorage.removeItem('currentInterview')
    localStorage.removeItem('interviewData')
    localStorage.removeItem('interviewAnswers')
    sessionStorage.removeItem('sessionLockId')
    sessionStorage.removeItem('interviewId')

    if (onSubmit) {
      onSubmit(formData)
    } else {
      navigate('/mock-interview-setup')
    }
  }

  const handleStartNewInterview = () => {
    proceedToInterview()
  }

  const handleViewResult = (interviewId) => {
    navigate(`/mock-interview-result/${interviewId}`)
  }

  // Registration Step
  if (step === 'registration') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-blue-700">Student Registration</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Interview Platform</h1>
              <p className="text-gray-600">
                Practice your interview skills with our AI-powered mock interview system. No login required!
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                checkStudentHistory()
              }}
              className="space-y-6"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="e.g., Rajesh Kumar"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.studentName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.studentName && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>
                )}
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Roll Number / ID *
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g., BIT2024001"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.rollNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.rollNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.rollNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This helps us track your progress across multiple attempts
                </p>
              </div>

              {/* College Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  College Name *
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="e.g., Birla Institute of Technology and Science"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.collegeName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.collegeName && (
                  <p className="text-red-500 text-sm mt-1">{errors.collegeName}</p>
                )}
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Why we need this information:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Track your progress across multiple attempts</li>
                    <li>Generate personalized feedback and statistics</li>
                    <li>Help you improve your interview skills</li>
                  </ul>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => onCancel && onCancel()}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // History Step - Show Previous Attempts
  if (step === 'history') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
              <p className="text-gray-600">
                We found {studentHistory?.totalAttempts} previous mock interview attempt(s) for you
              </p>
            </div>

            {/* Latest Score Card */}
            {studentHistory?.latestScore && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">Your Latest Score</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-blue-600">
                      {studentHistory.latestScore.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      on {new Date(studentHistory.latestAttempt).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircle size={40} className="text-green-500" />
                </div>
              </div>
            )}

            {/* Previous Attempts */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Previous Attempts</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {studentHistory?.interviews.map((interview) => (
                  <div
                    key={interview.interviewId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{interview.jobRole}</p>
                      <p className="text-sm text-gray-600">
                        {interview.experienceLevel} • {interview.status} • Score: {interview.score.toFixed(1)}/10
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(interview.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewResult(interview.interviewId)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 mb-6">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-semibold">Keep practicing!</p>
                <p className="text-xs mt-1">
                  Attempt more interviews to improve your score and interview skills.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('registration')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStartNewInterview}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                Start New Interview
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default StudentRegistrationForm
