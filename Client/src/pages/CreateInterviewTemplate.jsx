import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, Save } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

const CreateInterviewTemplate = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    templateName: '',
    templateDescription: '',
    jobRole: '',
    interviewType: 'Technical',
    experienceLevel: 'Mid',
    difficultyLevel: 'Medium',
    numberOfQuestions: 5,
  })
  const [loading, setLoading] = useState(false)

  const jobRoles = ['Frontend', 'Backend', 'FullStack', 'Java', 'Python', 'HR']
  const interviewTypes = ['Technical', 'Behavioral', 'Combined']
  const experienceLevels = ['Junior', 'Mid', 'Senior']
  const difficulties = ['Easy', 'Medium', 'Hard']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfQuestions' ? parseInt(value) || 1 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.templateName.trim()) {
      toast.error('Please enter a template name', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!formData.jobRole) {
      toast.error('Please select a job role', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/interviews/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobRole: formData.jobRole,
          interviewType: formData.interviewType,
          experienceLevel: formData.experienceLevel,
          difficultyLevel: formData.difficultyLevel,
          numberOfQuestions: formData.numberOfQuestions,
          templateName: formData.templateName,
          templateDescription: formData.templateDescription,
          isTemplate: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Interview template created successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        setTimeout(() => navigate('/dashboard/interviews'), 2000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create template', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Interview Template</h1>
          <p className="text-gray-600 mt-1">Configure the interview settings and save as template</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="space-y-6">
            {/* Template Info */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    name="templateName"
                    value={formData.templateName}
                    onChange={handleChange}
                    placeholder="e.g., Senior Frontend Engineer"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give your template a descriptive name for easy identification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="templateDescription"
                    value={formData.templateDescription}
                    onChange={handleChange}
                    placeholder="Describe the purpose or context of this interview template"
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Interview Configuration */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Configuration</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Role
                  </label>
                  <select
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    <option value="">Select a role</option>
                    {jobRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interview Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type
                  </label>
                  <select
                    name="interviewType"
                    value={formData.interviewType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    {interviewTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Questions */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions: {formData.numberOfQuestions}
                  </label>
                  <input
                    type="range"
                    name="numberOfQuestions"
                    min="1"
                    max="20"
                    value={formData.numberOfQuestions}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 question</span>
                    <span>20 questions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Role</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.jobRole || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Type</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.interviewType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Experience</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Difficulty</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.difficultyLevel}</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                <Save size={18} />
                {loading ? 'Creating...' : 'Create Template'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default CreateInterviewTemplate
