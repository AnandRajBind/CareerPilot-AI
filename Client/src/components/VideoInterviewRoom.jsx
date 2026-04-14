import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from 'lucide-react'
import AIAvatar from './AIAvatar'
import QuestionCaption from './QuestionCaption'
import ListeningIndicator from './ListeningIndicator'
import TranscriptPanel from './TranscriptPanel'
import CandidateVideo from './CandidateVideo'
import InterviewControls from './InterviewControls'
import InterviewProgress from './InterviewProgress'
import InterviewAnswerControls from './InterviewAnswerControls'
import { useInterviewSession } from '../hooks/useInterviewSession'
import { useMedia } from '../context/MediaContext'

const VideoInterviewRoom = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { cameraStream } = useMedia()

  const [isLoading, setIsLoading] = useState(true)
  const [interviewData, setInterviewData] = useState(null)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('good')
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  // Interview session hook
  const interview = useInterviewSession(interviewData)

  // Load interview data and setup
  useEffect(() => {
    const savedInterview = localStorage.getItem('currentInterview')
    if (!savedInterview) {
      toast.error('Interview session not found', {
        position: 'top-right',
        autoClose: 3000,
      })
      navigate(`/interview/session/${token}`)
      return
    }

    const data = JSON.parse(savedInterview)
    setInterviewData(data)
    setIsLoading(false)

    // Start recording when interview starts
    startRecording()
  }, [token, navigate])

  // Start recording media
  const startRecording = () => {
    try {
      if (!cameraStream) {
        throw new Error('Camera stream not available')
      }

      const chunks = []
      recordedChunksRef.current = chunks

      // Get audio from microphone if available
      const audioTracks = []
      if (cameraStream.getAudioTracks().length > 0) {
        audioTracks.push(...cameraStream.getAudioTracks())
      }

      const recordingStream = new MediaStream([
        ...cameraStream.getVideoTracks(),
        ...audioTracks,
      ])

      const mediaRecorder = new MediaRecorder(recordingStream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      toast.error('Failed to start recording: ' + error.message, {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  // Stop recording and save
  const stopRecording = async () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)

          // Save to localStorage (or send to backend)
          localStorage.setItem(
            'interviewRecording',
            JSON.stringify({
              url,
              duration: interview.timeElapsed,
              timestamp: new Date().toISOString(),
            })
          )

          setIsRecording(false)
          resolve(url)
        }
        mediaRecorderRef.current.stop()
      } else {
        resolve(null)
      }
    })
  }

  // Handle end interview
  const handleEndInterview = async () => {
    toast.info('Finalizing interview...', {
      position: 'top-right',
    })

    // Stop recording
    await stopRecording()

    // Save answers to localStorage
    localStorage.setItem(
      'interviewAnswers',
      JSON.stringify({
        answers: interview.answers,
        timeElapsed: interview.timeElapsed,
        interviewId: interviewData.id,
      })
    )

    // Redirect to results
    setTimeout(() => {
      navigate(`/interview/session/${token}/results`)
    }, 1000)
  }

  // Simulate connection status change
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['good', 'good', 'fair']
      const random = statuses[Math.floor(Math.random() * statuses.length)]
      setConnectionStatus(random)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-300" size={48} />
          <p className="text-white text-lg">Initializing Interview...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = interview.getCurrentQuestion()

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <InterviewProgress
        currentQuestion={interview.getCurrentQuestionNumber()}
        totalQuestions={interview.getTotalQuestions()}
        timeElapsed={interview.timeElapsed}
      />

      {/* Main Interview Area */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: AI Avatar */}
          <div className="lg:col-span-1 flex flex-col justify-center items-center">
            <AIAvatar isSpeaking={interview.isSpeaking} />
          </div>

          {/* Center: Question & Answer Controls */}
          <div className="lg:col-span-1 flex flex-col justify-between gap-4">
            {currentQuestion && !interview.isInterviewComplete() && (
              <>
                <QuestionCaption
                  question={currentQuestion}
                  isAnimating={interview.isSpeaking}
                  speed={30}
                />

                {/* Manual Answer Controls */}
                <InterviewAnswerControls
                  isListening={interview.isListening}
                  isSpeaking={interview.isSpeaking}
                  readyForAnswer={interview.readyForAnswer}
                  onPlayAgain={interview.playQuestion}
                  onStartAnswer={interview.startAnswer}
                  onStopAnswer={interview.stopAnswer}
                  disabled={interview.isInterviewComplete()}
                />

                <ListeningIndicator
                  isListening={interview.isListening}
                  transcript={interview.spokenText}
                />
              </>
            )}

            {interview.isInterviewComplete() && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg border-2 border-green-500">
                <div className="text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-white font-bold text-lg">Interview Complete!</p>
                  <p className="text-gray-300 text-sm mt-2">
                    Thank you for your responses. Your interview is being evaluated...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Transcript & Candidate Video */}
          <div className="lg:col-span-1 flex flex-col gap-3 relative">
            <div className="flex-1 overflow-hidden">
              <TranscriptPanel transcript={interview.transcript} />
            </div>

            {/* Floating Candidate Video */}
            <div className="absolute top-4 right-4 z-10">
              <CandidateVideo stream={cameraStream} isRecording={isRecording} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <InterviewControls
        isMicEnabled={isMicEnabled}
        isVideoEnabled={isVideoEnabled}
        isTakingResponse={interview.isTakingResponse}
        onMicToggle={() => setIsMicEnabled(!isMicEnabled)}
        onVideoToggle={() => setIsVideoEnabled(!isVideoEnabled)}
        onEndInterview={handleEndInterview}
        onSkipQuestion={interview.skipQuestion}
        connectionStatus={connectionStatus}
      />
    </div>
  )
}

export default VideoInterviewRoom


