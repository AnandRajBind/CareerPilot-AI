import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from 'lucide-react'
import PublicSystemCheck from './PublicSystemCheck'
import PublicInterviewScreen from './PublicInterviewScreen'
import MockInterviewResults from './MockInterviewResults'

const PublicInterview = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [interviewData, setInterviewData] = useState(null)
  const [currentStep, setCurrentStep] = useState('system-check') // system-check -> interview -> results

  useEffect(() => {
    // Get interview data from localStorage
    const storedInterviewData = localStorage.getItem('interviewData')
    if (!storedInterviewData) {
      toast.error('No interview data found. Please start from the home page.', {
        position: 'top-right',
        autoClose: 3000,
      })
      navigate('/')
      return
    }

    setInterviewData(JSON.parse(storedInterviewData))
    setLoading(false)
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader size={48} className="text-blue-600 mx-auto animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Loading interview...</p>
        </div>
      </div>
    )
  }

  if (!interviewData) {
    return null
  }

  // Render different components based on current step
  if (currentStep === 'system-check') {
    return (
      <PublicSystemCheck 
        onProceed={() => setCurrentStep('interview')} 
        isPublicMock={true}
      />
    )
  }

  if (currentStep === 'interview') {
    return (
      <PublicInterviewScreen 
        interviewData={interviewData}
        isPublicMock={true}
        onComplete={() => setCurrentStep('results')}
      />
    )
  }

  if (currentStep === 'results') {
    return <MockInterviewResults />
  }

  return null
}

export default PublicInterview
