import api from './api';

export const interviewService = {
  /**
   * Start a new interview
   */
  startInterview: async (jobRole, experienceLevel, interviewType, difficultyLevel, numberOfQuestions = 5) => {
    const response = await api.post('/interviews/start', {
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions,
    });
    return response.data.data;
  },

  /**
   * Generate questions for preview (without creating interview)
   */
  generateQuestions: async (jobRole, experienceLevel, interviewType, difficultyLevel, numberOfQuestions = 5) => {
    const response = await api.post('/interviews/generate-questions', {
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions,
    });
    return response.data.data;
  },

  /**
   * Submit answer and get evaluation for that question
   */
  evaluateAnswer: async (interviewId, questionIndex, answer) => {
    const response = await api.post(`/interviews/${interviewId}/evaluate-answer`, {
      answer,
      questionIndex,
    });
    return response.data.data;
  },

  /**
   * Complete interview and get final evaluation
   */
  completeInterview: async (interviewId, answers) => {
    const response = await api.post(`/interviews/${interviewId}/complete`, {
      answers,
    });
    return response.data.data;
  },

  /**
   * Get interview result/evaluation
   */
  getInterviewResult: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}/result`);
    return response.data.data;
  },

  /**
   * Get all interviews
   */
  getInterviews: async () => {
    const response = await api.get('/interviews');
    return response.data.data.interviews || [];
  },

  /**
   * Delete interview
   */
  deleteInterview: async (interviewId) => {
    await api.delete(`/interviews/${interviewId}`);
  },
};
