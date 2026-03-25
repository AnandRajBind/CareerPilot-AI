const Interview = require("../models/Interview");
const { buildError } = require("../utils/errorBuilder");
const {
  generateQuestions,
  evaluateAnswer,
  generateFinalEvaluation,
  getAdaptiveDifficulty,
} = require("../services/groqService");

/**
 * Start a new interview with AI-generated questions
 * POST /api/interviews/start
 */
const startInterview = async (req, res, next) => {
  try {
    const {
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions,
    } = req.validatedBody;

    // Generate questions using Groq
    const questionsData = await generateQuestions({
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions: numberOfQuestions || 5,
    });

    // Create interview record
    const interview = new Interview({
      userId: req.user._id,
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions: numberOfQuestions || 5,
      questions: questionsData.questions,
      answers: Array(questionsData.questions.length).fill(""),
      status: "in-progress",
    });

    await interview.save();

    res.status(201).json({
      success: true,
      message: "Interview started successfully",
      data: {
        interviewId: interview._id,
        questions: interview.questions,
        numberOfQuestions: interview.numberOfQuestions,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        interviewType: interview.interviewType,
        difficultyLevel: interview.difficultyLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate questions standalone (without creating interview)
 * POST /api/interviews/generate-questions
 */
const generateQuestionsOnly = async (req, res, next) => {
  try {
    const {
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions,
    } = req.validatedBody;

    const questionsData = await generateQuestions({
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions: numberOfQuestions || 5,
    });

    res.status(200).json({
      success: true,
      message: "Questions generated successfully",
      data: questionsData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit answer and get feedback for that specific answer
 * POST /api/interviews/:id/evaluate-answer
 */
const evaluateAnswerSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer, questionIndex } = req.validatedBody;

    // Validate interview exists and belongs to user
    const interview = await Interview.findById(id);

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return next(
        buildError("Not authorized to access this interview", 403)
      );
    }

    // Validate question index
    if (
      questionIndex < 0 ||
      questionIndex >= interview.questions.length ||
      !Number.isInteger(questionIndex)
    ) {
      return next(
        buildError(
          `Invalid question index. Must be between 0 and ${
            interview.questions.length - 1
          }`,
          400
        )
      );
    }

    // Validate answer
    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return next(buildError("Answer must be a non-empty string", 400));
    }

    // Store the answer
    interview.answers[questionIndex] = answer.trim();

    // Get evaluation for this answer
    const evaluation = await evaluateAnswer({
      question: interview.questions[questionIndex],
      answer: answer.trim(),
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      difficultyLevel: interview.difficultyLevel,
    });

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Answer evaluated successfully",
      data: {
        questionIndex,
        feedback: {
          score: evaluation.score,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          suggestions: evaluation.suggestions,
          modelAnswer: evaluation.modelAnswer,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete interview and get final evaluation
 * POST /api/interviews/:id/complete
 */
const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.validatedBody;

    // Validate interview exists and belongs to user
    const interview = await Interview.findById(id);

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return next(
        buildError("Not authorized to access this interview", 403)
      );
    }

    // Validate answers count
    if (answers.length !== interview.numberOfQuestions) {
      return next(
        buildError(
          `Expected ${interview.numberOfQuestions} answers, got ${answers.length}`,
          400
        )
      );
    }

    // Validate all answers have content
    if (answers.some((ans) => !ans || ans.trim().length === 0)) {
      return next(buildError("All answers must be non-empty", 400));
    }

    // Store all answers
    interview.answers = answers.map((ans) => ans.trim());

    // Prepare Q&A for final evaluation
    const questionsAndAnswers = interview.questions.map((q, i) => ({
      question: q,
      answer: interview.answers[i],
    }));

    // Calculate score for adaptive difficulty (estimate before final evaluation)
    // Use simple heuristic: score based on answer length and structure
    const scores = interview.answers.map((ans) => {
      // Basic scoring: longer, more detailed answers get higher provisional scores
      const length = ans.length;
      if (length < 50) return 3;
      if (length < 100) return 4;
      if (length < 200) return 6;
      if (length < 500) return 7;
      return 8;
    });

    // Generate comprehensive final evaluation
    const finalEvaluation = await generateFinalEvaluation({
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      interviewType: interview.interviewType,
      questionsAndAnswers,
      scores,
    });

    // Store evaluation in interview
    interview.evaluation = {
      score: finalEvaluation.score,
      strengths: finalEvaluation.strengths,
      weaknesses: finalEvaluation.weaknesses,
      suggestions: finalEvaluation.suggestions,
      modelAnswer: "", // Not applicable for final evaluation
      interviewTips: finalEvaluation.interviewTips,
    };

    interview.status = "completed";
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      data: {
        interviewId: interview._id,
        evaluation: interview.evaluation,
        adaptiveDifficulty: getAdaptiveDifficulty(
          finalEvaluation.score,
          interview.difficultyLevel
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview results/evaluation
 * GET /api/interviews/:id/result
 */
const getInterviewResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id).populate(
      "userId",
      "name email"
    );

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId._id.toString() !== req.user._id.toString()) {
      return next(
        buildError("Not authorized to access this interview", 403)
      );
    }

    // Check if interview is completed
    if (interview.status !== "completed") {
      return next(
        buildError(
          `Interview is ${interview.status}. Please complete it first.`,
          400
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {
        interviewId: interview._id,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        interviewType: interview.interviewType,
        difficultyLevel: interview.difficultyLevel,
        numberOfQuestions: interview.numberOfQuestions,
        questionsAndAnswers: interview.questions.map((q, i) => ({
          question: q,
          answer: interview.answers[i],
        })),
        evaluation: interview.evaluation,
        createdAt: interview.createdAt,
        completedAt: interview.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all interviews for current user
 * GET /api/interviews
 */
const getInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, jobRole } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (jobRole) filter.jobRole = jobRole;

    const skip = (page - 1) * limit;

    const interviews = await Interview.find(filter)
      .select("-answers") // Don't include answers in list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single interview by ID
 * GET /api/interviews/:id
 */
const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id).populate(
      "userId",
      "name email"
    );

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId._id.toString() !== req.user._id.toString()) {
      return next(
        buildError("Not authorized to access this interview", 403)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete interview
 * DELETE /api/interviews/:id
 */
const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return next(buildError("Not authorized to delete this interview", 403));
    }

    await Interview.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  generateQuestionsOnly,
  evaluateAnswerSubmission,
  completeInterview,
  getInterviewResult,
  getInterviews,
  getInterviewById,
  deleteInterview,
};
