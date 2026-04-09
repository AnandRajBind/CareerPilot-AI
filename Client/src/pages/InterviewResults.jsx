import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import { useAuth } from '../hooks/useAuth';

export default function InterviewResults() {
  const navigate = useNavigate();
  const { results, currentInterview, resetInterview, loading } = useInterview();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (!results) {k
      navigate('/interview-mode');
    }
  }, [results, navigate]);

  if (!results || !currentInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleNewInterview = () => {
    resetInterview();
    navigate('/interview-mode');
  };

  const handleDashboard = () => {
    resetInterview();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Complete! 🎉</h1>
          <p className="text-lg text-gray-600">Here's how you performed</p>
        </div>

        {/* Score Card */}
        <div className={`${getScoreBgColor(results.evaluation?.score || 0)} rounded-lg shadow-xl p-8 mb-8 border-2`}>
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">Your Score</p>
            <div className={`text-6xl font-bold ${getScoreColor(results.evaluation?.score || 0)} mb-4`}>
              {results.evaluation?.score || 0}/100
            </div>
            <p className="text-gray-700 text-lg">
              {results.evaluation?.score >= 80
                ? '🌟 Excellent Performance!'
                : results.evaluation?.score >= 60
                ? '👍 Good Performance'
                : '💪 Keep Practicing'}
            </p>
          </div>
        </div>

        {/* Interview Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">Role</p>
            <p className="text-gray-900 font-bold capitalize">{results.jobRole}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">Experience</p>
            <p className="text-gray-900 font-bold capitalize">{results.experienceLevel}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">Difficulty</p>
            <p className="text-gray-900 font-bold capitalize">{results.difficultyLevel}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">Questions</p>
            <p className="text-gray-900 font-bold">{results.numberOfQuestions}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
          {['overview', 'strengths', 'weaknesses', 'suggestions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-3 font-bold capitalize border-b-4 transition-all ${
                selectedTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-indigo-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Interview Overview</h3>
                <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">
                    Thank you for participating! You completed an interview for the{' '}
                    <span className="font-bold capitalize">{results.jobRole}</span> position with{' '}
                    <span className="font-bold capitalize">{results.difficultyLevel}</span> difficulty level.
                  </p>
                </div>
                {results.evaluation?.interviewTips && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="font-bold text-blue-900 mb-2">💡 Interview Tips:</p>
                    <p className="text-blue-800 whitespace-pre-wrap">{results.evaluation.interviewTips}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'strengths' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-green-600">💪 Your Strengths</h3>
              {results.evaluation?.strengths ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {results.evaluation.strengths}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">No strengths data available</p>
              )}
            </div>
          )}

          {selectedTab === 'weaknesses' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-yellow-600">⚠️ Areas for Improvement</h3>
              {results.evaluation?.weaknesses ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {results.evaluation.weaknesses}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">No weaknesses data available</p>
              )}
            </div>
          )}

          {selectedTab === 'suggestions' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-indigo-600">📝 Suggestions for Improvement</h3>
              {results.evaluation?.suggestions ? (
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {results.evaluation.suggestions}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">No suggestions available</p>
              )}
            </div>
          )}
        </div>

        {/* Model Answers Section */}
        {results.evaluation?.modelAnswer && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Model Answer Examples</h3>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {results.evaluation.modelAnswer}
              </p>
            </div>
          </div>
        )}

        {/* Questions and Answers Review */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">❓ Questions & Your Answers</h3>
          <div className="space-y-6">
            {currentInterview.questions.map((question, idx) => (
              <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                <p className="text-lg font-bold text-gray-900 mb-2">Q{idx + 1}: {question}</p>
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Your Answer:</span><br />
                    {results.answers?.[idx] || 'No answer provided'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleNewInterview}
            disabled={loading}
            className="px-6 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all hover:shadow-lg disabled:bg-gray-400"
          >
            {loading ? 'Starting...' : 'Take Another Interview'}
          </button>
          <button
            onClick={handleDashboard}
            className="px-6 py-4 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all hover:shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
