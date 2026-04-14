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
  const timerRef = useRef(null)
  const hasSubmittedRef = useRef(false)

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

  // NEW: Play question (can be called multiple times)
  const playQuestion = useCallback(() => {
    const question = getCurrentQuestion()
    if (!question) {
      console.warn('No question available to play')
      return
    }

    console.log(`🔊 Playing Q${currentQuestionIndex + 1}: "${question.substring(0, 50)}..."`)

    // Make sure no listening is happening
    if (isListening) {
      console.log('Stopping active listening before replaying...')
      stopListening()
    }

    // Cancel any ongoing speech
    stopSpeaking()

    // Small delay to ensure previous speech is stopped
    setTimeout(() => {
      speak(question, { rate: 0.95 })
      setReadyForAnswer(false)
    }, 100)
  }, [getCurrentQuestion, currentQuestionIndex, speak, stopSpeaking, stopListening, isListening])

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
      })

      if (!success) {
        console.error('🚫 Failed to start listening - check microphone permissions!')
        setIsTakingResponse(false)
        setIsAnswering(false)
      }
    }, 100)
  }, [getCurrentQuestion, currentQuestionIndex, isSpeaking, stopSpeaking, startListening, resetTranscript])

  // NEW: Stop recording answer manually
  const stopAnswer = useCallback(() => {
    console.log(`⏹️ User stopping answer for Q${currentQuestionIndex + 1}`)

    stopListening()
    setIsAnswering(false)
    setIsTakingResponse(false)

    // Save the answer
    const question = getCurrentQuestion()
    if (!question) return

    const userAnswer = spokenText.trim() || '[NO RESPONSE]'
    console.log(`✅ Answer saved for Q${currentQuestionIndex + 1}: "${userAnswer.substring(0, 50)}..."`)

    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: userAnswer,
    }))

    // Update transcript
    setTranscript((prev) => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1].answer = userAnswer
      }
      return updated
    })

    hasSubmittedRef.current = true
  }, [stopListening, spokenText, currentQuestionIndex, getCurrentQuestion])

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
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      console.log('🎉 Interview complete!')
    }
  }, [currentQuestionIndex, interviewData?.questions?.length, resetTranscript])

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
    playQuestion,
    startAnswer,
    stopAnswer,
    skipQuestion,
    nextQuestion,
    getCurrentQuestionNumber,
    getTotalQuestions,
    isInterviewComplete,
  }
}
