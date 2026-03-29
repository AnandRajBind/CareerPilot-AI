import React, { useState, useEffect } from 'react';
import { useInterview } from '../hooks/useInterview';
import { useNavigate } from 'react-router-dom';

export default function InterviewScreen() {
  const navigate = useNavigate();
  const { currentInterview, currentQuestionIndex, currentAnswer, submitAnswer, loading, error, isLastQuestion, progressPercentage, goToQuestion, completeInterview } = useInterview();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per question
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Update local answer text when question changes
  useEffect(() => {
    setAnswerText(currentAnswer || '');
    setTimeLeft(300);
    setAnswerSubmitted(false);
    setLocalError('');
  }, [currentQuestionIndex, currentAnswer]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || answerSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, answerSubmitted]);

  if (!currentInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No active interview. Please start one first.</p>
        </div>
      </div>
    );
  }

  const question = currentInterview.questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      setLocalError('Please enter an answer before submitting');
      return;
    }

    if (answerText.trim().length < 10) {
      setLocalError('Answer must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setLocalError('');
    try {
      await submitAnswer(answerText);
      setAnswerSubmitted(true);
    } catch (err) {
      setLocalError(err.response?.data?.error?.message || 'Failed to submit answer');
      console.error('Failed to submit answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (answerSubmitted) {
      if (isLastQuestion) {
        setSubmitting(true);
        try {
          await completeInterview();
          navigate('/interview-results');
        } catch (err) {
          setLocalError('Failed to complete interview');
          console.error('Failed to complete interview:', err);
          setSubmitting(false);
        }
      } else {
        goToQuestion(currentQuestionIndex + 1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Progress */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview in Progress</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {currentInterview.numberOfQuestions}</p>
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

        {/* Main Content */}
        <div className="mt-32 space-y-6">
          {(error || localError) && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {localError || error}
            </div>
          )}

          {/* Question Display */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Question {currentQuestionIndex + 1}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{question}</p>
            </div>

            {/* Answer Textarea */}
            {!answerSubmitted ? (
              <div className="space-y-4">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here... (minimum 10 characters)"
                  className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  disabled={submitting}
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{answerText.length} characters</span>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || answerText.trim().length < 10}
                    className={`px-8 py-3 rounded-lg font-bold transition-all ${
                      submitting || answerText.trim().length < 10
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✅</span>
                  <p className="text-lg font-bold text-green-700">Answer Submitted Successfully!</p>
                </div>
                <p className="text-gray-700 mb-4 p-4 bg-white rounded">
                  <strong>Your answer:</strong><br /> {answerText}
                </p>

                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
                    submitting
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : isLastQuestion
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {submitting ? 'Processing...' : isLastQuestion ? 'Complete Interview' : 'Next Question'}
                </button>
              </div>
            )}
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {currentInterview.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToQuestion(idx)}
                  disabled={loading || answerSubmitted}
                  className={`aspect-square rounded-lg font-bold transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-indigo-600 text-white shadow-lg scale-110'
                      : idx < currentQuestionIndex
                      ? 'bg-green-200 text-green-800 hover:bg-green-300'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
