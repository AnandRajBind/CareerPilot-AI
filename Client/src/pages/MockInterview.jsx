import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader, AlertCircle } from 'lucide-react'

const MockInterview = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [studentInfo, setStudentInfo] = useState(null)
  const [showJobRoleForm, setShowJobRoleForm] = useState(false)
  const [formData, setFormData] = useState({
    jobRole: 'frontend',
    experienceLevel: 'junior',
    interviewType: 'technical',
    difficultyLevel: 'medium',
    numberOfQuestions: 5,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get student info from localStorage
    const storedStudentInfo = localStorage.getItem('studentInfo')
    if (!storedStudentInfo) {
      toast.error('Please fill student details first', {
        position: 'top-right',
        autoClose: 3000,
      })
      navigate('/')
      return
    }

    setStudentInfo(JSON.parse(storedStudentInfo))
    setShowJobRoleForm(true)
    setLoading(false)
  }, [navigate])

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

    if (!formData.jobRole.trim()) {
      newErrors.jobRole = 'Job role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStartInterview = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Call backend to start mock interview
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mock/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: studentInfo.studentName,
            rollNumber: studentInfo.rollNumber,
            collegeName: studentInfo.collegeName,
            email: studentInfo.email || '',
            ...formData,
            numberOfQuestions: parseInt(formData.numberOfQuestions),
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to start interview')
      }

      const result = await response.json()

      // Clear any stale session data
      localStorage.removeItem('currentInterview')
      localStorage.removeItem('interviewAnswers')
      sessionStorage.removeItem('sessionLockId')
      sessionStorage.removeItem('interviewId')

      // Store interview data for the screen component
      const interviewData = {
        ...studentInfo,
        ...formData,
        interviewId: result.data.interviewId,
        sessionId: result.data.sessionId,
        questions: result.data.questions,
        numberOfQuestions: result.data.numberOfQuestions,
        interviewStartTime: new Date().toISOString(),
      }

      localStorage.setItem('interviewData', JSON.stringify(interviewData))
      localStorage.setItem('mockInterviewData', JSON.stringify(interviewData))
      localStorage.setItem('isMockInterview', 'true')

      // Navigate to interview screen
      navigate('/public-interview')
    } catch (error) {
      console.error('Error starting interview:', error)
      toast.error(error.message || 'Failed to start interview. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader size={48} className="text-blue-600 mx-auto animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!showJobRoleForm) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-4">
              <span className="text-sm font-semibold text-blue-700">Mock Interview Setup</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure Your Interview</h1>
            <p className="text-gray-600">
              Hello <span className="font-semibold">{studentInfo?.name}</span>, let's set up your mock interview preferences!
            </p>
          </div>

          {/* Student Info Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Roll Number:</span> {studentInfo?.rollNumber}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">College:</span> {studentInfo?.collegeName}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleStartInterview} className="space-y-6">
            {/* Job Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Job Role / Position *
              </label>
              <select
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.jobRole ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">-- Select a job role --</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="fullstack">Full Stack Developer</option>
                <option value="java">Java Developer</option>
                <option value="python">Python Developer</option>
                <option value="data-science">Data Scientist</option>
                <option value="hr">HR / Behavioral</option>
              </select>
              {errors.jobRole && (
                <p className="text-red-500 text-sm mt-1">{errors.jobRole}</p>
              )}
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="junior">Junior (0-3 years)</option>
                <option value="mid">Mid-level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Interview Type
              </label>
              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="all">Mixed (Technical + Behavioral)</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium (Recommended)</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Number of Questions
              </label>
              <select
                name="numberOfQuestions"
                value={formData.numberOfQuestions}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value={3}>3 questions (10 minutes)</option>
                <option value={5}>5 questions (20 minutes)</option>
                <option value={10}>10 questions (40 minutes)</option>
              </select>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Tips for a better experience:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Find a quiet place for the interview</li>
                  <li>Have a pen and paper ready</li>
                  <li>Speak clearly for better AI evaluation</li>
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Starting Interview...' : 'Start Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MockInterview
