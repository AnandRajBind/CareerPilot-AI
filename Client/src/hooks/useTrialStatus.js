import { useEffect, useState } from 'react'

export const useTrialStatus = () => {
  const [trialData, setTrialData] = useState({
    isActive: false,
    daysRemaining: 0,
    isExpired: false,
    trialEndDate: null,
    trialStartDate: null,
  })

  useEffect(() => {
    const company = localStorage.getItem('company')
    if (company) {
      try {
        const companyData = JSON.parse(company)
        const trialStartDate = new Date(companyData.trialStartDate)
        const trialEndDate = new Date(companyData.trialEndDate)
        const today = new Date()
        
        // Calculate days remaining
        const daysRemaining = Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24))
        const isActive = companyData.isTrialActive && today < trialEndDate
        const isExpired = !isActive || daysRemaining <= 0

        setTrialData({
          isActive,
          daysRemaining: Math.max(0, daysRemaining),
          isExpired,
          trialEndDate,
          trialStartDate,
        })
      } catch (error) {
        console.error('Error parsing company data:', error)
      }
    }
  }, [])

  return trialData
}
