import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ChevronRight, ChevronLeft, Volume2, Phone, SkipForward, Loader, AlertCircle } from 'lucide-react'
import { speakText } from '../utils/speechUtils'
import VoiceRecorder from '../components/VoiceRecorder'
import { useMedia } from '../context/MediaContext'
import { retryWithBackoff, retryInterviewSubmission } from '../services/retryService'

const PublicInterviewScreen = ({ isPublicMock = false, onComplete = null }) => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { cameraStream, microphoneTrack } = useMedia()

  const [interviewData, setInterviewData] = useState(null)
  const [sessionLockId, setSessionLockId] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [recordedAnswer, setRecordedAnswer] = useState(null)
  const [answerType, setAnswerType] = useState('text') // 'text', 'voice'
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isResuming, setIsResuming] = useState(false)
  const [retryingSubmission, setRetryingSubmission] = useState(false)
  const [isMockInterview, setIsMockInterview] = useState(false) // Flag to detect mock interviews
  const sessionTimeoutRef = useRef(null)

  // ===== PRODUCTION READINESS: Session Recovery on Mount =====
  useEffect(() => {
    const loadOrResumeSession = async () => {
      try {
        // Check if this is a mock interview
        const mockFlag = localStorage.getItem('isMockInterview') === 'true'
        setIsMockInterview(mockFlag)

        // Try to get saved interview data
        const savedInterview = localStorage.getItem('mockInterviewData') || localStorage.getItem('interviewData') || localStorage.getItem('currentInterview')
        const savedSessionLockId = sessionStorage.getItem('sessionLockId')
        const savedInterviewId = sessionStorage.getItem('interviewId')

        if (!savedInterview) {
          toast.error('Interview session not found', {
            position: 'top-right',
            autoClose: 3000,
          })
          if (mockFlag || isPublicMock) {
            navigate('/')
          } else {
            navigate(`/interview/session/${token}`)
          }
          return
        }

        const interviewDataParsed = JSON.parse(savedInterview)
        setInterviewData(interviewDataParsed)
        setSessionLockId(savedSessionLockId)
        
        // Debug logging
        console.log('Interview Data Loaded:', interviewDataParsed)
        console.log('Questions:', interviewDataParsed?.questions)
        
        // Also store as currentInterview for consistency
        localStorage.setItem('currentInterview', JSON.stringify(interviewDataParsed))

        // For mock interviews, skip server-side session recovery
        if (mockFlag || isPublicMock) {
          // Just load from localStorage, no server resume needed
          const savedAnswers = localStorage.getItem('interviewAnswers')
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers))
          }
          setIsResuming(false)
          return
        }

        // For authenticated interviews, try to resume from server
        if (savedSessionLockId && savedInterviewId) {
          setIsResuming(true)
          try {
            const resumeResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/interview/session/${savedInterviewId}/resume?sessionLockId=${savedSessionLockId}`
            )

            if (resumeResponse.ok) {
              const resumeData = await resumeResponse.json()
              if (resumeData.data) {
                // Restore state from server
                setCurrentQuestionIndex(resumeData.data.currentQuestionIndex || 0)
                setAnswers(resumeData.data.answers || {})

                toast.success(
                  `Resuming from question ${resumeData.data.currentQuestionIndex + 1}`,
                  {
                    position: 'top-right',
                    autoClose: 2000,
                  }
                )
              }
              } else if (resumeResponse.status === 410) {
              // Session expired
              toast.error('Interview session has expired. Please start a new one.', {
                position: 'top-right',
                autoClose: 3000,
              })
              navigate(`/interview/session/${token}`)
              return
            }
          } catch (error) {
            console.warn('Could not resume from server, using local state:', error)
            // Fall back to localStorage if resume fails
            const savedAnswers = localStorage.getItem('interviewAnswers')
            if (savedAnswers) {
              setAnswers(JSON.parse(savedAnswers))
            }
          }
          setIsResuming(false)
        }
      } catch (error) {
        console.error('Error loading session:', error)
        toast.error('Failed to load interview session', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    }

    loadOrResumeSession()
  }, [token, navigate, isPublicMock])

  // ===== PRODUCTION READINESS: Session Timeout Protection =====
  useEffect(() => {
    if (!interviewData || !sessionLockId) return

    // Reset timeout on activity
    const resetTimeout = () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }

      // Set 30-minute timeout
      sessionTimeoutRef.current = setTimeout(() => {
        toast.error('Interview session has expired due to inactivity.', {
          position: 'top-right',
          autoClose: 3000,
        })
        if (isPublicMock) {
          navigate('/')
        } else {
          navigate(`/interview/session/${token}`)
        }
      }, 30 * 60 * 1000)
    }

    resetTimeout()

    // Reset on any user activity
    const handleActivity = () => resetTimeout()
    document.addEventListener('click', handleActivity)
    document.addEventListener('keypress', handleActivity)

    return () => {
      document.removeEventListener('click', handleActivity)
      document.removeEventListener('keypress', handleActivity)
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }
    }
  }, [interviewData, sessionLockId, token, navigate])

  // Timer countdown
  useEffect(() => {
    if (!interviewData) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitAnswer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [interviewData, currentQuestionIndex])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleTextAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        type: 'text',
        content: value,
      },
    }))
  }

  const handleVoiceAnswer = (transcript) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        type: 'voice',
        content: transcript,
      },
    }))
    setRecordedAnswer(transcript)
  }

  // Handle voice recording completion - automatically move to next question
  const handleVoiceRecordingComplete = async (transcript) => {
    if (!transcript || !interviewData) return // No transcript or interview data, do nothing
    
    try {
      // IMPORTANT: Calculate current state values BEFORE async operations
      const totalQuestions = interviewData.questions.length
      const currentIndex = currentQuestionIndex
      const isLastQuestion = currentIndex >= totalQuestions - 1 // Guard against invalid indices
      
      console.log(`Voice Recording: Q${currentIndex + 1}/${totalQuestions}, isLastQuestion=${isLastQuestion}`)
      
      // Save answer state immediately
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: {
          type: 'voice',
          content: transcript,
        },
      }))
      setRecordedAnswer(transcript)

      // Save the answer to backend first - use captured values
      if (isMockInterview && interviewData) {
        const saveResponse = await fetch(`${import.meta.env.VITE_API_URL}/mock/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewId: interviewData.interviewId,
            questionIndex: currentIndex,
            answer: transcript,
            format: 'voice',
          }),
        })

        if (!saveResponse.ok) {
          console.error('Failed to save answer:', saveResponse.status)
          toast.error('Failed to save your answer. Please try again.')
          return
        }
      }

      // Small delay to show transcript, then auto-advance
      setTimeout(() => {
        try {
          console.log(`Auto-advance timeout: isLastQuestion=${isLastQuestion}`)
          
          if (isLastQuestion) {
            // Last question - complete entire interview
            console.log('Submitting interview (last question reached)')
            setSubmitting(true)
            handleSubmitAnswer()
          } else {
            // Move to next question
            console.log(`Advancing to next question: ${currentIndex + 1} -> ${currentIndex + 2}`)
            setCurrentQuestionIndex((prev) => {
              // Safety check: don't go beyond total questions
              const nextIndex = Math.min(prev + 1, totalQuestions - 1)
              console.log(`Index update: ${prev} -> ${nextIndex}`)
              return nextIndex
            })
            setTimeLeft(300)
            setRecordedAnswer(null)
          }
        } catch (error) {
          console.error('Error auto-advancing:', error)
          toast.error('Error moving to next question. Please click Next manually.')
        }
      }, 800) // 800ms delay to allow user to see the transcript
    } catch (error) {
      console.error('Error in voice recording completion:', error)
      toast.error('Error processing your answer. Please try again.')
    }
  }

  // ===== PRODUCTION READINESS: Save Progress After Each Answer =====
  const saveProgress = async () => {
    // For mock interviews, save to backend API
    if (isMockInterview && interviewData) {
      try {
        const currentAnswer = answers[currentQuestionIndex]
        if (!currentAnswer || !currentAnswer.content) {
          return // Nothing to save
        }

        await fetch(`${import.meta.env.VITE_API_URL}/mock/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewId: interviewData.interviewId,
            questionIndex: currentQuestionIndex,
            answer: currentAnswer.content,
            format: currentAnswer.format || 'text',
          }),
        })

        // Also save to localStorage as backup
        localStorage.setItem('interviewAnswers', JSON.stringify(answers))
      } catch (error) {
        console.warn('Could not save answer to server:', error)
        // Save locally as fallback
        localStorage.setItem('interviewAnswers', JSON.stringify(answers))
      }
      return
    }

    // For authenticated interviews, save to server
    if (!sessionLockId || !interviewData) return

    try {
      await fetch(`http://localhost:9000/api/interview/session/${interviewData.sessionId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionLockId,
          currentQuestionIndex,
          answers,
          transcript: '',
        }),
      })
    } catch (error) {
      console.warn('Could not save progress to server:', error)
      // Save locally as fallback
      localStorage.setItem('interviewAnswers', JSON.stringify(answers))
    }
  }

  const handleSubmitAnswer = async () => {
    if (submitting || !interviewData) return

    // Safety check: prevent submission if question index is invalid
    const totalQuestions = interviewData.questions.length
    if (currentQuestionIndex >= totalQuestions) {
      console.error(`Invalid question index: ${currentQuestionIndex} >= ${totalQuestions}`)
      toast.error('Invalid interview state. Please refresh and try again.')
      return
    }

    setSubmitting(true)

    try {
      // Check if last question
      const isLastQuestion = currentQuestionIndex === totalQuestions - 1
      console.log(`Submitting answer: Q${currentQuestionIndex + 1}/${totalQuestions}, isLast=${isLastQuestion}`)
      
      if (isLastQuestion) {
        // All questions answered - save and transition
        localStorage.setItem('interviewAnswers', JSON.stringify(answers))

        // For mock interviews, complete via backend API
        if (isMockInterview) {
          try {
            // Save final answer
            const currentAnswer = answers[currentQuestionIndex]
            if (currentAnswer && currentAnswer.content) {
              await fetch(`${import.meta.env.VITE_API_URL}/mock/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  interviewId: interviewData.interviewId,
                  questionIndex: currentQuestionIndex,
                  answer: currentAnswer.content,
                  format: currentAnswer.format || 'text',
                }),
              })
            }

            // Complete interview
            const completeResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/mock/complete/${interviewData.interviewId}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              }
            )

            if (!completeResponse.ok) {
              throw new Error('Failed to complete interview')
            }

            const completeResult = await completeResponse.json()

            toast.success('Interview submitted successfully!', {
              position: 'top-right',
              autoClose: 1500,
            })

            // Navigate to mock results page
            setTimeout(() => {
              localStorage.setItem('mockInterviewResult', JSON.stringify(completeResult.data))
              navigate(`/mock-interview-result/${interviewData.interviewId}`)
            }, 1500)

            setSubmitting(false)
            return
          } catch (error) {
            console.error('Error completing mock interview:', error)
            toast.error('Error submitting interview: ' + error.message, {
              position: 'top-right',
              autoClose: 3000,
            })
          }
        }

        // For public mock interviews with callback
        if (isPublicMock && onComplete) {
          toast.success('Interview submitted successfully!', {
            position: 'top-right',
            autoClose: 1500,
          })
          setTimeout(() => {
            setSubmitting(false)
            onComplete()
          }, 1500)
          return
        }

        // For authenticated interviews, submit to backend with retry
        try {
          setRetryingSubmission(false)

          await retryInterviewSubmission(
            async () => {
              const response = await fetch(
                `http://localhost:9000/api/interview/session/${interviewData.sessionId}/submit`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    interviewId: interviewData.sessionId,
                    sessionLockId,
                    jobRole: interviewData.jobRole,
                    experienceLevel: interviewData.experienceLevel,
                    questions: interviewData.questions.map((q, idx) => ({
                      question: q,
                      answer: answers[idx]?.content || '',
                    })),
                    interviewType: interviewData.interviewType,
                    difficultyLevel: interviewData.difficultyLevel,
                    answers: Object.entries(answers).reduce((acc, [idx, answer]) => {
                      acc[idx] = answer.content || ''
                      return acc
                    }, {}),
                  }),
                }
              )

              if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Submission failed')
              }

              return response.json()
            },
            (message, isRetrying) => {
              if (isRetrying) {
                setRetryingSubmission(true)
                toast.info(message, {
                  position: 'top-right',
                  autoClose: 3000,
                })
              }
            }
          )

          toast.success('Interview submitted successfully!', {
            position: 'top-right',
            autoClose: 2000,
          })

          setTimeout(() => {
            navigate(`/interview/session/${token}/results`)
          }, 2000)
        } catch (error) {
          toast.error(
            error.message || 'Failed to submit interview. Please check your connection and try again.',
            {
              position: 'top-right',
              autoClose: 3000,
            }
          )
        }
      } else {
        // Move to next question
        await saveProgress()
        setCurrentQuestionIndex((prev) => prev + 1)
        setTimeLeft(300)
        setRecordedAnswer(null)
      }
    } catch (error) {
      toast.error('Failed to process answer', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setSubmitting(false)
      setRetryingSubmission(false)
    }
  }

  if (!interviewData || isResuming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin" size={40} />
          <p className="text-gray-600">{isResuming ? 'Resuming interview...' : 'Loading interview...'}</p>
        </div>
      </div>
    )
  }

  // Safety check for questions data
  if (!interviewData.questions || !Array.isArray(interviewData.questions) || interviewData.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Questions</h2>
          <p className="text-gray-600 mb-6">No questions were generated for this interview.</p>
          <button
            onClick={() => navigate('/mock-interview-setup')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Start New Interview
          </button>
        </div>
      </div>
    )
  }

  const progressPercentage = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100
  const currentAnswer = answers[currentQuestionIndex]
  const currentQuestion = interviewData.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Fixed Header with Timer and Progress */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview in Progress</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {interviewData.questions.length}</p>
              </div>
              <div className={`text-3xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-indigo-600'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content - with margin to account for fixed header */}
        <div className="mt-32 space-y-6">
          {/* Retry Status Banner */}
          {retryingSubmission && (
            <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-orange-600" size={20} />
              <span className="text-orange-800 text-sm font-medium">
                Connection issue detected. Retrying submission...
              </span>
            </div>
          )}

          {/* Question Display */}
          <div className="bg-white rounded-lg shadow-lg p-8 select-none">
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex-1">{currentQuestion}</h2>
                <button
                  onClick={() => speakText(currentQuestion)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium text-sm whitespace-nowrap"
                  title="Read question aloud"
                >
                  <Volume2 size={18} />
                  Read Aloud
                </button>
              </div>
            </div>

            {/* Answer Format Selector */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Answer format:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAnswerType('text')}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    answerType === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setAnswerType('voice')}
                  className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    answerType === 'voice'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Phone size={16} />
                  Voice
                </button>
              </div>
            </div>

            {/* Answer Input Section */}
            <div className="space-y-4 mb-8">
              {answerType === 'text' && (
                <textarea
                  value={currentAnswer?.content || ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  placeholder="Type your answer here... (minimum 5 characters)"
                  className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none resize-none font-medium"
                  disabled={submitting}
                />
              )}

              {answerType === 'voice' && (
                <div className="space-y-4">
                  <VoiceRecorder 
                    onTranscript={handleVoiceAnswer}
                    onRecordingComplete={handleVoiceRecordingComplete}
                  />
                  {recordedAnswer && (
                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recorded transcript:</p>
                      <p className="text-gray-900 leading-relaxed">{recordedAnswer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons - Only show Next Question button in Text mode */}
            <div className="flex gap-4 justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex((prev) => prev - 1)
                    setTimeLeft(300)
                    setRecordedAnswer(null)
                  }
                }}
                disabled={currentQuestionIndex === 0 || submitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  currentQuestionIndex === 0 || submitting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {/* Next Question button - Only show in Text mode */}
              {answerType === 'text' && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !currentAnswer}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition ${
                    submitting || !currentAnswer
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      {retryingSubmission ? 'Retrying...' : 'Processing...'}
                    </>
                  ) : currentQuestionIndex === interviewData.questions.length - 1 ? (
                    <>
                      Complete Interview
                      <SkipForward size={18} />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              )}

              {/* Voice mode message - Show when in Voice mode */}
              {answerType === 'voice' && (
                <div className="flex-1 flex items-center justify-end">
                  <div className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm">
                    Answer will submit automatically after recording
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Character Count for Text Answer */}
          {answerType === 'text' && (
            <div className="text-right text-sm text-gray-600">
              {(currentAnswer?.content || '').length} characters
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicInterviewScreen
