import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const StudentFormModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    collegeName: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
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
      newErrors.studentName = 'Student name is required'
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required'
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Store student data in localStorage
      const studentInfo = {
        name: formData.studentName,
        rollNumber: formData.rollNumber,
        collegeName: formData.collegeName,
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('studentInfo', JSON.stringify(studentInfo))

      // Reset form
      setFormData({
        studentName: '',
        rollNumber: '',
        collegeName: '',
      })

      // Close modal and redirect
      onClose()
      
      // Navigate to mock interview page
      navigate('/mock-interview')
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ submit: 'Failed to submit form. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Start Mock Interview</h2>
            <p className="text-sm text-gray-600 mt-1">No registration required. Just fill in your details!</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Enter your full name"
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
              Roll Number *
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g., 21CS001"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.rollNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.rollNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.rollNumber}</p>
            )}
          </div>

          {/* College Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              College / University Name *
            </label>
            <input
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              placeholder="Enter your college name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.collegeName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.collegeName && (
              <p className="text-red-500 text-sm mt-1">{errors.collegeName}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        </form>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          ✓ Completely free • ✓ No sign-up needed • ✓ Instant feedback
        </p>
      </div>
    </div>
  )
}

export default StudentFormModal
