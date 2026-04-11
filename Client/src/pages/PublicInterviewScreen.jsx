import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ChevronRight, ChevronLeft, Volume2, Phone, SkipForward, Loader } from 'lucide-react'
import { speakText } from '../utils/speechUtils'
import VoiceRecorder from '../components/VoiceRecorder'
import VideoRecorder from '../components/VideoRecorder'
import { useMedia } from '../context/MediaContext'

const PublicInterviewScreen = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { cameraStream, microphoneTrack } = useMedia()

  const [interviewData, setInterviewData] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [recordedAnswer, setRecordedAnswer] = useState(null)
  const [answerType, setAnswerType] = useState('text') // 'text', 'voice', 'video'
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [showVideo, setShowVideo] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState(null)

  useEffect(() => {
    // Get interview data from localStorage
    const savedInterview = localStorage.getItem('currentInterview')
    if (!savedInterview) {
      toast.error('Interview session not found', {
        position: 'top-right',
        autoClose: 3000,
      })
      navigate(`/interview/session/${token}`)
      return
    }
    setInterviewData(JSON.parse(savedInterview))
  }, [token, navigate])

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

  const handleSubmitAnswer = async () => {
    if (submitting) return

    setSubmitting(true)

    try {
      // Check if last question
      if (currentQuestionIndex === interviewData.questions.length - 1) {
        // All questions answered - go to evaluation
        // Save answers to localStorage
        localStorage.setItem('interviewAnswers', JSON.stringify(answers))

        toast.success('Interview completed! Processing results...', {
          position: 'top-right',
          autoClose: 2000,
        })

        setTimeout(() => {
          navigate(`/interview/session/${token}/results`)
        }, 2000)
      } else {
        // Move to next question
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
    }
  }

  if (!interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  const progressPercentage = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100
  const currentAnswer = answers[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-6xl mx-auto">
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
                      Processing...
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
