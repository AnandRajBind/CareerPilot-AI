import { useState, useCallback, useEffect, useRef } from 'react'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { useSpeechRecognition } from './useSpeechRecognition'

export const useInterviewSession = (interviewData) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [transcript, setTranscript] = useState([])
  const [isAnswering, setIsAnswering] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isTakingResponse, setIsTakingResponse] = useState(false)
  const [shouldAskQuestion, setShouldAskQuestion] = useState(false)
  const [readyForAnswer, setReadyForAnswer] = useState(false)
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(false)
  const [answerSubmitError, setAnswerSubmitError] = useState('')
  
  const timerRef = useRef(null)
  const hasSubmittedRef = useRef(false)
  const questionPlayedRef = useRef({}) // Track which questions have been spoken

  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis()
  const { startListening, stopListening, transcript: spokenText, reset: resetTranscript, isListening } = useSpeechRecognition()

  // Timer Management
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Initialize interview when data is loaded
  useEffect(() => {
    if (interviewData?.questions && interviewData.questions.length > 0) {
      setShouldAskQuestion(true)
    }
  }, [interviewData])

  const getCurrentQuestion = useCallback(() => {
    if (!interviewData?.questions || currentQuestionIndex >= interviewData.questions.length) {
      return null
    }
    return interviewData.questions[currentQuestionIndex]
  }, [interviewData?.questions, currentQuestionIndex])

  // NEW: Play question (guards against repetition)
  const playQuestion = useCallback((forceReplay = false) => {
    const question = getCurrentQuestion()
    if (!question) {
      console.warn('No question available to play')
      return
    }

    // Guard: If question already played AND not forced replay, skip
    if (questionPlayedRef.current[currentQuestionIndex] && !forceReplay) {
      console.log(`✓ Q${currentQuestionIndex + 1} already spoken. Use "Listen Again" to replay.`)
      setReadyForAnswer(true)
      return
    }

    console.log(`🔊 Playing Q${currentQuestionIndex + 1}: "${question.substring(0, 50)}..."`)

    // Make sure no listening is happening
    if (isListening) {
      console.log('Stopping active listening before playing...')
      stopListening()
    }

    // Cancel any ongoing speech
    stopSpeaking()

    // Small delay to ensure previous speech is stopped
    setTimeout(() => {
      setIsQuestionSpeaking(true)
      speak(question, { rate: 0.95 })
      setReadyForAnswer(false)
      
      // Mark question as played after speaking completes
      setTimeout(() => {
        questionPlayedRef.current[currentQuestionIndex] = true
        setIsQuestionSpeaking(false)
      }, 3000) // Adjust based on average question length
    }, 100)
  }, [getCurrentQuestion, currentQuestionIndex, speak, stopSpeaking, stopListening, isListening])

  // NEW: Submit answer (called automatically when recognition ends)
  // MUST be defined BEFORE startAnswer to avoid forward reference
  const submitAnswer = useCallback((finalTranscript) => {
    console.log(`📤 Submitting answer for Q${currentQuestionIndex + 1}`)
    setAnswerSubmitError('') // Clear any previous error

    const question = getCurrentQuestion()
    if (!question) return

    // TRANSCRIPT SAFETY: Validate answer is not empty
    const userAnswer = finalTranscript.trim()
    
    if (!userAnswer || userAnswer.length === 0) {
      console.warn('⚠️ No answer detected - user must try again')
      setAnswerSubmitError('No answer detected. Please try again.')
      setIsTakingResponse(false)
      setIsAnswering(false)
      return
    }

    console.log(`✅ Answer submitted for Q${currentQuestionIndex + 1}: "${userAnswer.substring(0, 50)}..."`)

    // Step 1: Save answer to state
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: userAnswer,
    }))

    // Step 2: Update transcript
    setTranscript((prev) => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1].answer = userAnswer
      }
      return updated
    })

    setIsTakingResponse(false)
    setIsAnswering(false)

    // Step 3: Check if more questions exist
    const totalQuestions = interviewData?.questions?.length || 0
    const nextIndex = currentQuestionIndex + 1

    if (nextIndex < totalQuestions) {
      // Step 4: Move to next question
      console.log(`📍 Moving from Q${currentQuestionIndex + 1} to Q${nextIndex + 1}`)
      resetTranscript()
      setReadyForAnswer(false)
      
      // IMPORTANT: Clear the played flag for the new question BEFORE state update
      questionPlayedRef.current[nextIndex] = false
      
      // Set flag to trigger auto-play useEffect
      hasSubmittedRef.current = true
      
      // Update question index - this will trigger useEffect to auto-play
      setCurrentQuestionIndex(nextIndex)
    } else {
      // Interview complete
      console.log('🎉 Interview complete!')
    }
  }, [currentQuestionIndex, getCurrentQuestion, interviewData?.questions?.length, resetTranscript, playQuestion])

  // NEW: Start recording answer manually
  const startAnswer = useCallback(() => {
    if (!getCurrentQuestion()) {
      console.warn('No question available')
      return
    }

    console.log(`🎤 User starting answer for Q${currentQuestionIndex + 1}`)

    // Make sure speech synthesis is stopped
    if (isSpeaking) {
      console.log('Stopping speech synthesis before listening...')
      stopSpeaking()
    }

    // Small delay to ensure synthesis is stopped
    setTimeout(() => {
      console.log('👂 Starting speech recognition...')
      setIsTakingResponse(true)
      setIsAnswering(true)
      resetTranscript()

      const success = startListening({
        lang: 'en-US',
        // Pass callback to auto-submit when recognition ends
        onRecognitionEnd: submitAnswer,
      })

      if (!success) {
        console.error('🚫 Failed to start listening - check microphone permissions!')
        setIsTakingResponse(false)
        setIsAnswering(false)
      }
    }, 100)
  }, [getCurrentQuestion, currentQuestionIndex, isSpeaking, stopSpeaking, startListening, resetTranscript, submitAnswer])

  // NEW: Stop recording answer manually (ONLY stops recognition)
  const stopAnswer = useCallback(() => {
    console.log(`⏹️ User clicked Stop Answer for Q${currentQuestionIndex + 1}`)
    // Stop speech recognition ONLY
    // Submission happens automatically via submitAnswer callback when recognition ends
    stopListening()
  }, [stopListening, currentQuestionIndex])

  // Auto-ask first question when interview loads
  useEffect(() => {
    if (shouldAskQuestion && !isAnswering && !isSpeaking && currentQuestionIndex === 0 && !hasSubmittedRef.current) {
      const question = getCurrentQuestion()
      if (question) {
        console.log(`🔄 Auto-playing first Q${currentQuestionIndex + 1}`)
        setTimeout(() => {
          playQuestion()
          setReadyForAnswer(true)
        }, 500)
      }
    }
  }, [shouldAskQuestion, currentQuestionIndex, isAnswering, isSpeaking, playQuestion, getCurrentQuestion])

  // Auto-ask next question when moving to new question
  useEffect(() => {
    if (hasSubmittedRef.current && !isSpeaking && currentQuestionIndex > 0 && !isAnswering) {
      setTimeout(() => {
        const question = getCurrentQuestion()
        if (question) {
          console.log(`🔄 Auto-playing Q${currentQuestionIndex + 1}`)
          playQuestion()
          setReadyForAnswer(true)
          hasSubmittedRef.current = false
        }
      }, 1000)
    }
  }, [currentQuestionIndex, isSpeaking, isAnswering, playQuestion, getCurrentQuestion])

  const skipQuestion = useCallback(() => {
    console.log(`⏭️ Skipping Q${currentQuestionIndex + 1}...`)
    stopListening()
    setIsAnswering(false)
    setIsTakingResponse(false)
    hasSubmittedRef.current = true

    // Record as skipped
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: '[SKIPPED]',
    }))

    // Update transcript
    setTranscript((prev) => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1].answer = '[SKIPPED]'
      }
      return updated
    })

    // Move to next question
    setTimeout(() => {
      if (currentQuestionIndex < interviewData?.questions?.length - 1) {
        console.log(`⏭️ Moving to Q${currentQuestionIndex + 2}`)
        resetTranscript()
        setReadyForAnswer(false)
        setCurrentQuestionIndex((prev) => prev + 1)
      }
    }, 500)
  }, [
    stopListening,
    currentQuestionIndex,
    interviewData?.questions?.length,
    resetTranscript,
  ])

  const getCurrentQuestionNumber = () => currentQuestionIndex + 1
  const getTotalQuestions = () => interviewData?.questions?.length || 0
  const isInterviewComplete = () => getCurrentQuestionNumber() > getTotalQuestions()

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < interviewData?.questions?.length - 1) {
      console.log(`📍 Moving from Q${currentQuestionIndex + 1} to Q${currentQuestionIndex + 2}`)
      resetTranscript()
      setReadyForAnswer(false)
      // Clear the spoken flag for the upcoming question
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      console.log('🎉 Interview complete!')
    }
  }, [currentQuestionIndex, interviewData?.questions?.length, resetTranscript])

  const replayQuestion = useCallback(() => {
    console.log(`🔁 User replaying Q${currentQuestionIndex + 1}`)
    // Clear the spoken flag to allow replayable
    questionPlayedRef.current[currentQuestionIndex] = false
    playQuestion(true) // Force replay
  }, [currentQuestionIndex, playQuestion])

  return {
    currentQuestionIndex,
    getCurrentQuestion,
    answers,
    transcript,
    isAnswering,
    isTakingResponse,
    isSpeaking,
    spokenText,
    timeElapsed,
    isListening,
    readyForAnswer,
    isQuestionSpeaking,
    answerSubmitError,
    playQuestion,
    replayQuestion,
    startAnswer,
    stopAnswer,
    submitAnswer,
    skipQuestion,
    nextQuestion,
    getCurrentQuestionNumber,
    getTotalQuestions,
    isInterviewComplete,
  }
}
