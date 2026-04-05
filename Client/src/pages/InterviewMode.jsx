import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InterviewModeSelection() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const jobRoles = [
    { value: 'frontend', label: 'Frontend Developer', icon: '🎨' },
    { value: 'backend', label: 'Backend Developer', icon: '⚙️' },
    { value: 'fullstack', label: 'Full Stack', icon: '🔄' },
    { value: 'java', label: 'Java Developer', icon: '☕' },
    { value: 'python', label: 'Python Developer', icon: '🐍' },
    { value: 'hr', label: 'HR Round', icon: '👥' },
  ];

  const interviewModes = [
    { value: 'technical', label: 'Technical Interview', description: 'Focus on technical knowledge and problem-solving' },
    { value: 'behavioral', label: 'Behavioral Interview', description: 'Focus on past experiences and soft skills' },
    { value: 'all', label: 'Combined', description: 'Mix of technical and behavioral questions' },
  ];

  const experienceLevels = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid', label: 'Mid-level (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
  ];

  const handleStartInterview = async () => {
    if (!jobRole || !experienceLevel || !selectedMode || !difficultyLevel) {
      alert('Please fill in all fields');
      return;
    }

    try {
      navigate('/system-check', {
        state: {
          jobRole,
          experienceLevel,
          interviewType: selectedMode,
          difficultyLevel,
          numberOfQuestions,
        },
      });
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Start Your Interview</h1>
          <p className="text-lg text-gray-600">Configure your interview settings and get ready to ace it!</p>
        </div>

        <div className="space-y-8">
          {/* Job Role Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Select Your Role</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {jobRoles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setJobRole(role.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    jobRole === role.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-2">{role.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{role.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Mode Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Interview Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setSelectedMode(mode.value)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedMode === mode.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{mode.label}</h3>
                  <p className="text-sm text-gray-600">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experience Level */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Experience Level</h2>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-indigo-50 border-gray-200 hover:border-indigo-300"
                  >
                    <input
                      type="radio"
                      name="experience"
                      value={level.value}
                      checked={experienceLevel === level.value}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-gray-900 font-medium">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Difficulty Level</h2>
              <div className="space-y-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <label
                    key={level}
                    className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-indigo-50 border-gray-200 hover:border-indigo-300"
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficultyLevel === level}
                      onChange={(e) => setDifficultyLevel(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-gray-900 font-medium capitalize">
                      {level} {level === 'easy' && '⭐'} {level === 'medium' && '⭐⭐'} {level === 'hard' && '⭐⭐⭐'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Number of Questions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Number of Questions</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="text-xl font-bold text-indigo-600 w-12 text-center">{numberOfQuestions}</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">You'll be asked {numberOfQuestions} questions</p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartInterview}
            disabled={!jobRole || !selectedMode || !experienceLevel || !difficultyLevel}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              !jobRole || !selectedMode || !experienceLevel || !difficultyLevel
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}
