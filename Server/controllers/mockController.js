const MockInterview = require("../models/MockInterview");
const { buildError } = require("../utils/errorBuilder");
const {
  generateQuestions,
  evaluateAnswer,
  generateFinalEvaluation,
} = require("../services/groqService");
const crypto = require("crypto");

/**
 * Start a new mock interview for a student
 * POST /api/mock/start
 * No authentication required - students enter name, roll number, college
 */
const startMockInterview = async (req, res, next) => {
  try {
    const {
      studentName,
      rollNumber,
      collegeName,
      email,
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions,
    } = req.validatedBody;

    // Validate required fields
    if (!studentName || !rollNumber || !collegeName || !jobRole || !experienceLevel) {
      return res.status(400).json(
        buildError("Missing required student information", 400)
      );
    }

    // Check if student has attempted this before (for tracking)
    const previousAttempts = await MockInterview.countDocuments({
      rollNumber: rollNumber.toLowerCase(),
    });

    // Generate unique session ID
    const sessionId = crypto.randomUUID();

    // Generate questions using Groq
    const questionsData = await generateQuestions({
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions: numberOfQuestions || 5,
    });

    // Create mock interview record
    const mockInterview = new MockInterview({
      studentName,
      rollNumber: rollNumber.toLowerCase(),
      collegeName,
      email: email || null,
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions: numberOfQuestions || 5,
      questions: questionsData.questions,
      answers: Array(questionsData.questions.length).fill({
        content: "",
        format: "text",
      }),
      sessionId,
      type: "mock", // Explicitly mark as mock
      status: "in-progress",
      attemptNumber: previousAttempts + 1,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    await mockInterview.save();

    res.status(201).json({
      success: true,
      message: "Mock interview started successfully",
      data: {
        interviewId: mockInterview._id,
        sessionId: sessionId,
        questions: mockInterview.questions,
        numberOfQuestions: mockInterview.numberOfQuestions,
        studentName: mockInterview.studentName,
        rollNumber: mockInterview.rollNumber,
        jobRole: mockInterview.jobRole,
        experienceLevel: mockInterview.experienceLevel,
        interviewType: mockInterview.interviewType,
        difficultyLevel: mockInterview.difficultyLevel,
        attemptNumber: mockInterview.attemptNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit an answer for a specific question
 * POST /api/mock/answer
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionIndex, answer, format } = req.validatedBody;

    // Fetch mock interview
    const mockInterview = await MockInterview.findById(interviewId);

    if (!mockInterview) {
      return res.status(404).json(buildError("Mock interview not found", 404));
    }

    if (mockInterview.type !== "mock") {
      return res.status(403).json(
        buildError("Access denied: not a mock interview", 403)
      );
    }

    if (mockInterview.status === "completed") {
      return res.status(400).json(
        buildError("This interview has already been completed", 400)
      );
    }

    // Validate question index
    if (questionIndex < 0 || questionIndex >= mockInterview.questions.length) {
      return res.status(400).json(buildError("Invalid question index", 400));
    }

    // Save answer
    mockInterview.answers[questionIndex] = {
      content: answer,
      format: format || "text",
      submittedAt: new Date(),
    };

    // Auto-evaluate the answer using AI
    try {
      const evaluationResult = await evaluateAnswer({
        question: mockInterview.questions[questionIndex],
        answer: answer,
        jobRole: mockInterview.jobRole,
        experienceLevel: mockInterview.experienceLevel,
        difficultyLevel: mockInterview.difficultyLevel,
      });

      // Store individual evaluation
      const evaluation = {
        questionIndex,
        score: evaluationResult.score || 0,
        strengths: evaluationResult.strengths || "",
        weaknesses: evaluationResult.weaknesses || "",
        suggestions: evaluationResult.suggestions || "",
        modelAnswer: evaluationResult.modelAnswer || "",
        evaluatedAt: new Date(),
      };

      // Check if evaluation already exists for this question
      const existingEvalIndex = mockInterview.evaluations.findIndex(
        (e) => e.questionIndex === questionIndex
      );

      if (existingEvalIndex >= 0) {
        mockInterview.evaluations[existingEvalIndex] = evaluation;
      } else {
        mockInterview.evaluations.push(evaluation);
      }
    } catch (evalError) {
      console.error("Error evaluating answer:", evalError);
      // Continue without evaluation if it fails - graceful degradation
    }

    await mockInterview.save();

    // Return evaluation if available
    const evaluation = mockInterview.evaluations.find(
      (e) => e.questionIndex === questionIndex
    );

    res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        questionIndex,
        evaluation: evaluation || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete mock interview and calculate final score
 * POST /api/mock/complete/:interviewId
 */
const completeMockInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    const mockInterview = await MockInterview.findById(interviewId);

    if (!mockInterview) {
      return res.status(404).json(buildError("Mock interview not found", 404));
    }

    if (mockInterview.type !== "mock") {
      return res.status(403).json(
        buildError("Access denied: not a mock interview", 403)
      );
    }

    // Calculate overall score from evaluations
    let totalScore = 0;
    let evaluatedCount = mockInterview.evaluations.length;

    mockInterview.evaluations.forEach((eval) => {
      totalScore += eval.score || 0;
    });

    const overallScore =
      evaluatedCount > 0 ? (totalScore / evaluatedCount).toFixed(2) : 0;

    // Generate final feedback using AI
    try {
      const finalFeedback = await generateFinalEvaluation({
        jobRole: mockInterview.jobRole,
        experienceLevel: mockInterview.experienceLevel,
        interviewType: mockInterview.interviewType,
        evaluations: mockInterview.evaluations,
        overallScore: parseFloat(overallScore),
      });

      mockInterview.overallFeedback = {
        strengths: finalFeedback.strengths || "",
        weaknesses: finalFeedback.weaknesses || "",
        suggestions: finalFeedback.suggestions || "",
        interviewTips: finalFeedback.interviewTips || "",
      };
    } catch (feedbackError) {
      console.error("Error generating final feedback:", feedbackError);
      // Set default feedback if generation fails
      mockInterview.overallFeedback = {
        strengths: "Good attempt",
        weaknesses: "Keep practicing",
        suggestions: "Review the model answers",
        interviewTips: "Practice more mock interviews",
      };
    }

    // Update interview status
    mockInterview.status = "completed";
    mockInterview.overallScore = parseFloat(overallScore);
    mockInterview.completedAt = new Date();
    mockInterview.duration = Math.floor(
      (mockInterview.completedAt - mockInterview.startedAt) / 1000
    );

    await mockInterview.save();

    res.status(200).json({
      success: true,
      message: "Mock interview completed successfully",
      data: {
        interviewId: mockInterview._id,
        overallScore: mockInterview.overallScore,
        totalQuestions: mockInterview.questions.length,
        evaluatedQuestions: evaluatedCount,
        duration: mockInterview.duration,
        overallFeedback: mockInterview.overallFeedback,
        evaluations: mockInterview.evaluations,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get mock interview results
 * GET /api/mock/result/:interviewId
 */
const getMockInterviewResult = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    const mockInterview = await MockInterview.findById(interviewId);

    if (!mockInterview) {
      return res.status(404).json(buildError("Mock interview not found", 404));
    }

    if (mockInterview.type !== "mock") {
      return res.status(403).json(
        buildError("Access denied: not a mock interview", 403)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        interviewId: mockInterview._id,
        studentName: mockInterview.studentName,
        rollNumber: mockInterview.rollNumber,
        collegeName: mockInterview.collegeName,
        jobRole: mockInterview.jobRole,
        experienceLevel: mockInterview.experienceLevel,
        interviewType: mockInterview.interviewType,
        difficultyLevel: mockInterview.difficultyLevel,
        overallScore: mockInterview.overallScore,
        totalQuestions: mockInterview.questions.length,
        evaluatedQuestions: mockInterview.evaluations.length,
        duration: mockInterview.duration,
        status: mockInterview.status,
        completedAt: mockInterview.completedAt,
        overallFeedback: mockInterview.overallFeedback,
        evaluations: mockInterview.evaluations.map((eval, idx) => ({
          questionIndex: eval.questionIndex,
          question: mockInterview.questions[eval.questionIndex],
          answer:
            mockInterview.answers[eval.questionIndex]?.content ||
            "No answer provided",
          score: eval.score,
          strengths: eval.strengths,
          weaknesses: eval.weaknesses,
          suggestions: eval.suggestions,
          modelAnswer: eval.modelAnswer,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview history for a student
 * GET /api/mock/history/:rollNumber
 */
const getMockInterviewHistory = async (req, res, next) => {
  try {
    const { rollNumber } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Ensure isolation: only fetch mock interviews
    const interviews = await MockInterview.find({
      rollNumber: rollNumber.toLowerCase(),
      type: "mock",
    })
      .select(
        "studentName jobRole experienceLevel overallScore status completedAt duration attemptNumber numberOfQuestions interviewType difficultyLevel"
      )
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await MockInterview.countDocuments({
      rollNumber: rollNumber.toLowerCase(),
      type: "mock",
    });

    // Get latest completed interview
    const latestCompleted = await MockInterview.findOne({
      rollNumber: rollNumber.toLowerCase(),
      status: "completed",
      type: "mock",
    })
      .sort({ completedAt: -1 })
      .select("overallScore completedAt");

    res.status(200).json({
      success: true,
      data: {
        rollNumber,
        totalAttempts: total,
        currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
        interviews: interviews.map((interview) => ({
          _id: interview._id,
          interviewId: interview._id,
          jobRole: interview.jobRole,
          experienceLevel: interview.experienceLevel,
          score: interview.overallScore,
          status: interview.status,
          completedAt: interview.completedAt,
          createdAt: interview.createdAt,
          duration: interview.duration,
          attemptNumber: interview.attemptNumber,
          numberOfQuestions: interview.numberOfQuestions,
          interviewType: interview.interviewType,
          difficultyLevel: interview.difficultyLevel,
        })),
        latestScore: latestCompleted?.overallScore || null,
        latestAttempt: latestCompleted?.completedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student statistics
 * GET /api/mock/stats/:rollNumber
 */
const getMockInterviewStats = async (req, res, next) => {
  try {
    const { rollNumber } = req.params;

    // Isolate: only fetch mock interviews
    const interviews = await MockInterview.find({
      rollNumber: rollNumber.toLowerCase(),
      type: "mock",
      status: "completed",
    });

    if (interviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          rollNumber,
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          improveScore: 0,
          jobRoles: [],
          lastAttempt: null,
        },
      });
    }

    const scores = interviews.map((i) => i.overallScore);
    const averageScore = (
      scores.reduce((a, b) => a + b, 0) / scores.length
    ).toFixed(2);

    const jobRoles = [...new Set(interviews.map((i) => i.jobRole))];

    const firstAttemptScore = interviews[interviews.length - 1]?.overallScore || 0;
    const latestScore = interviews[0]?.overallScore || 0;
    const improvement = (latestScore - firstAttemptScore).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        rollNumber,
        totalAttempts: interviews.length,
        averageScore: parseFloat(averageScore),
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        improvement: parseFloat(improvement),
        jobRoles,
        lastAttempt: interviews[0]?.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startMockInterview,
  submitAnswer,
  completeMockInterview,
  getMockInterviewResult,
  getMockInterviewHistory,
  getMockInterviewStats,
};
