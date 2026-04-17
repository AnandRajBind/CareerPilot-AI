import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ChevronRight, ChevronLeft, Volume2, Phone, SkipForward, Loader, AlertCircle } from 'lucide-react'
import { speakText } from '../utils/speechUtils'
import VoiceRecorder from '../components/VoiceRecorder'
import VideoRecorder from '../components/VideoRecorder'
import { useMedia } from '../context/MediaContext'
import { retryWithBackoff, retryInterviewSubmission } from '../services/retryService'

const PublicInterviewScreen = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { cameraStream, microphoneTrack } = useMedia()

  const [interviewData, setInterviewData] = useState(null)
  const [sessionLockId, setSessionLockId] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [recordedAnswer, setRecordedAnswer] = useState(null)
  const [answerType, setAnswerType] = useState('text') // 'text', 'voice', 'video'
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [showVideo, setShowVideo] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState(null)
  const [isResuming, setIsResuming] = useState(false)
  const [retryingSubmission, setRetryingSubmission] = useState(false)
  const sessionTimeoutRef = useRef(null)

  // ===== PRODUCTION READINESS: Session Recovery on Mount =====
  useEffect(() => {
    const loadOrResumeSession = async () => {
      try {
        // Try to get saved interview data
        const savedInterview = localStorage.getItem('currentInterview')
        const savedSessionLockId = sessionStorage.getItem('sessionLockId')
        const savedInterviewId = sessionStorage.getItem('interviewId')

        if (!savedInterview) {
          toast.error('Interview session not found', {
            position: 'top-right',
            autoClose: 3000,
          })
          navigate(`/interview/session/${token}`)
          return
        }

        const interviewDataParsed = JSON.parse(savedInterview)
        setInterviewData(interviewDataParsed)
        setSessionLockId(savedSessionLockId)

        // If we have a session lock ID, try to resume from server
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
  }, [token, navigate])

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
        navigate(`/interview/session/${token}`)
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

  const currentQuestion = interviewData?.questions[currentQuestionIndex]

  const handleTextAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        type: 'text',
        content: value,
      },
    }))
  }

  const handleVoiceAnswer = (audioBlob, transcript) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        type: 'voice',
        audioBlob,
        transcript,
        content: transcript,
      },
    }))
    setRecordedAnswer(transcript)
  }

  const handleVideoAnswer = (videoBlob) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        type: 'video',
        videoBlob,
      },
    }))
    setRecordedVideo(videoBlob)
  }

  // ===== PRODUCTION READINESS: Save Progress After Each Answer =====
  const saveProgress = async () => {
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
    if (submitting) return

    setSubmitting(true)

    try {
      // Check if last question
      if (currentQuestionIndex === interviewData.questions.length - 1) {
        // ===== PRODUCTION READINESS: Submit with Retry =====
        // All questions answered - submit for evaluation
        localStorage.setItem('interviewAnswers', JSON.stringify(answers))

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
        setRecordedVideo(null)
        setShowVideo(false)
        setAnswerType('text')
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

  const progressPercentage = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100
  const currentAnswer = answers[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Session Status Banner */}
        {retryingSubmission && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-orange-600" size={20} />
            <span className="text-orange-800 text-sm font-medium">
              Connection issue detected. Retrying submission...
            </span>
          </div>
        )}

        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Interview</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Time remaining</p>
                <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {interviewData.questions.length}
              </p>
              <p className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion?.question}</h2>
                <button
                  onClick={() => speakText(currentQuestion?.question)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium text-sm"
                >
                  <Volume2 size={18} />
                  Read Aloud
                </button>
              </div>

              {/* Answer Type Selector */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Answer format:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setAnswerType('text')
                      setShowVideo(false)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      answerType === 'text'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => {
                      setAnswerType('voice')
                      setShowVideo(false)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      answerType === 'voice'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Phone size={16} />
                    Voice
                  </button>
                  <button
                    onClick={() => {
                      setAnswerType('video')
                      setShowVideo(true)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      answerType === 'video'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              {/* Answer Input */}
              {answerType === 'text' && (
                <div className="mb-6">
                  <textarea
                    value={currentAnswer?.content || ''}
                    onChange={(e) => handleTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {answerType === 'voice' && (
                <div className="mb-6">
                  <VoiceRecorder onRecordingComplete={handleVoiceAnswer} />
                  {recordedAnswer && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recorded transcript:</p>
                      <p className="text-gray-900">{recordedAnswer}</p>
                    </div>
                  )}
                </div>
              )}

              {answerType === 'video' && (
                <div className="mb-6">
                  <VideoRecorder onRecordingComplete={handleVideoAnswer} />
                  {recordedVideo && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Video recorded successfully</p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 justify-between">
                <button
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex((prev) => prev - 1)
                      setTimeLeft(300)
                    }
                  }}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !currentAnswer}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                    submitting || !currentAnswer
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      {retryingSubmission ? 'Retrying...' : 'Processing...'}
                    </>
                  ) : currentQuestionIndex === interviewData.questions.length - 1 ? (
                    <>
                      Complete
                      <SkipForward size={18} />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Video Feed */}
          {showVideo && cameraStream && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
                <div className="bg-black aspect-video flex items-center justify-center">
                  <video
                    autoPlay
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                </div>
                <div className="p-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Your camera feed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicInterviewScreen
