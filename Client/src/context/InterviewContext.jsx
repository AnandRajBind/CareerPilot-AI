import React, { createContext, useState, useCallback } from 'react';
import { interviewService } from '../services/interviewService';

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [currentInterview, setCurrentInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [audioStream, setAudioStream] = useState(null); // To store individual question evaluations

  const startInterview = useCallback(async (jobRole, experienceLevel, interviewType, difficultyLevel, numberOfQuestions) => {
    setLoading(true);
    setError(null);
    try {
      const interview = await interviewService.startInterview(
        jobRole,
        experienceLevel,
        interviewType,
        difficultyLevel,
        numberOfQuestions
      );
      setCurrentInterview(interview);
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setAnswers(Array(interview.questions.length).fill(''));
      setQuestionAnswers({});
      return interview;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to start interview';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answer) => {
    if (!currentInterview || answer.trim().length === 0) {
      setError('Please enter an answer');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      // Save answer to local state
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = answer;
      setAnswers(updatedAnswers);

      // Evaluate answer with backend
      const evaluation = await interviewService.evaluateAnswer(
        currentInterview.interviewId,
        currentQuestionIndex,
        answer
      );

      // Store evaluation for this question
      const updatedQuestionAnswers = { ...questionAnswers };
      updatedQuestionAnswers[currentQuestionIndex] = evaluation;
      setQuestionAnswers(updatedQuestionAnswers);

      return evaluation;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to evaluate answer';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentInterview, currentQuestionIndex, answers, questionAnswers]);

  const goToQuestion = useCallback((index) => {
    if (currentInterview && index >= 0 && index < currentInterview.questions.length) {
      setCurrentQuestionIndex(index);
      setCurrentAnswer(answers[index] || '');
    }
  }, [currentInterview, answers]);

  const completeInterview = useCallback(async () => {
    if (!currentInterview) {
      setError('No active interview');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await interviewService.completeInterview(currentInterview.interviewId, answers);
      setResults(result);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to complete interview';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentInterview, answers]);

  const resetInterview = useCallback(() => {
    setCurrentInterview(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setAnswers([]);
    setResults(null);
    setError(null);
    setQuestionAnswers({});
    setIsListening(false);
    setSpokenText('');
    setAudioStream(null);
  }, []);

  const value = {
    // State
    currentInterview,
    currentQuestionIndex,
    currentAnswer,
    setCurrentAnswer,
    answers,
    results,
    loading,
    error,
    questionAnswers,
    isListening,
    setIsListening,
    spokenText,
    setSpokenText,
    audioStream,
    setAudioStream,

    // Methods
    startInterview,
    submitAnswer,
    goToQuestion,
    completeInterview,
    resetInterview,

    // Computed
    hasCurrentAnswer: currentAnswer.trim().length > 0,
    isLastQuestion: currentInterview && currentQuestionIndex === currentInterview.questions.length - 1,
    progressPercentage: currentInterview ? ((currentQuestionIndex + 1) / currentInterview.questions.length) * 100 : 0,
    answeredCount: answers.filter(a => a.trim().length > 0).length,
  };

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
};
