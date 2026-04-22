import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentRegistrationForm from '../components/StudentRegistrationForm'

const PublicMockInterview = () => {
  const navigate = useNavigate()
  const [registered, setRegistered] = useState(false)

  const handleRegistrationComplete = (studentInfo) => {
    setRegistered(true)
    // Redirect to setup after registration
    setTimeout(() => {
      navigate('/mock-interview-setup')
    }, 500)
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <StudentRegistrationForm 
      onSubmit={handleRegistrationComplete}
      onCancel={handleCancel}
    />
  )
}

export default PublicMockInterview
