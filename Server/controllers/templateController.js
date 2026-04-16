const crypto = require("crypto");
const InterviewTemplate = require("../models/InterviewTemplate");
const Interview = require("../models/Interview");
const { buildError } = require("../utils/errorBuilder");
const { generateQuestions, evaluateAnswer, generateFinalEvaluation } = require("../services/groqService");

/**
 * Create a new interview template
 * POST /api/company/interviews/template
 */
const createTemplate = async (req, res, next) => {
  try {
    const {
      templateName,
      templateDescription,
      jobRole,
      interviewType,
      experienceLevel,
      difficultyLevel,
      numberOfQuestions,
    } = req.validatedBody || req.body;

    // Validate required fields
    if (!templateName || !jobRole || !interviewType || !experienceLevel || !difficultyLevel || !numberOfQuestions) {
      throw buildError("All required fields must be provided: templateName, jobRole, interviewType, experienceLevel, difficultyLevel, numberOfQuestions", 400);
    }

    // Normalize enum values to lowercase for consistency
    // Values come from Joi validation which already applies .lowercase() transformation
    const normalizedTemplate = {
      companyId: req.company._id,
      templateName,
      templateDescription: templateDescription || "",
      jobRole: jobRole?.toLowerCase(),
      interviewType: interviewType?.toLowerCase(),
      experienceLevel: experienceLevel?.toLowerCase(),
      difficultyLevel: difficultyLevel?.toLowerCase(),
      numberOfQuestions,
    };

    // Create new template
    const template = new InterviewTemplate(normalizedTemplate);

    await template.save();

    res.status(201).json({
      success: true,
      message: "Interview template created successfully",
      data: {
        templateId: template._id,
        templateName: template.templateName,
        jobRole: template.jobRole,
        interviewLink: template.interviewLink,
        uniqueToken: template.uniqueToken,
        createdAt: template.createdAt,
      },
    });
  } catch (error) {
    // Handle validation errors with user-friendly message
    if (error.name === 'ValidationError' || error.message?.includes('must be one of')) {
      return res.status(400).json({
        success: false,
        message: "Invalid template configuration. Please check your input values.",
      });
    }
    next(error);
  }
};

/**
 * Get all templates for a company
 * GET /api/company/interviews/templates
 */
const getCompanyTemplates = async (req, res, next) => {
  try {
    const templates = await InterviewTemplate.find({
      companyId: req.company._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        templates,
        total: templates.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get template by ID
 * GET /api/company/interviews/template/:templateId
 */
const getTemplateById = async (req, res, next) => {
  try {
    const { templateId } = req.params;

    const template = await InterviewTemplate.findById(templateId);

    if (!template) {
      throw buildError("Interview template not found", 404);
    }

    // Verify ownership
    if (template.companyId.toString() !== req.company._id.toString()) {
      throw buildError("You don't have access to this template", 403);
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete template
 * DELETE /api/company/interviews/template/:templateId
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;

    const template = await InterviewTemplate.findById(templateId);

    if (!template) {
      throw buildError("Interview template not found", 404);
    }

    // Verify ownership
    if (template.companyId.toString() !== req.company._id.toString()) {
      throw buildError("You don't have access to this template", 403);
    }

    await InterviewTemplate.findByIdAndDelete(templateId);

    res.status(200).json({
      success: true,
      message: "Interview template deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update template
 * PUT /api/company/interviews/template/:templateId
 */
const updateTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const {
      templateName,
      templateDescription,
      jobRole,
      interviewType,
      experienceLevel,
      difficultyLevel,
      numberOfQuestions,
      isActive,
    } = req.validatedBody;

    const template = await InterviewTemplate.findById(templateId);

    if (!template) {
      throw buildError("Interview template not found", 404);
    }

    // Verify ownership
    if (template.companyId.toString() !== req.company._id.toString()) {
      throw buildError("You don't have access to this template", 403);
    }

    // Update fields with normalized values
    if (templateName) template.templateName = templateName;
    if (templateDescription !== undefined) template.templateDescription = templateDescription;
    if (jobRole) template.jobRole = jobRole?.toLowerCase();
    if (interviewType) template.interviewType = interviewType?.toLowerCase();
    if (experienceLevel) template.experienceLevel = experienceLevel?.toLowerCase();
    if (difficultyLevel) template.difficultyLevel = difficultyLevel?.toLowerCase();
    if (numberOfQuestions) template.numberOfQuestions = numberOfQuestions;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    res.status(200).json({
      success: true,
      message: "Interview template updated successfully",
      data: template,
    });
  } catch (error) {
    // Handle validation errors with user-friendly message
    if (error.name === 'ValidationError' || error.message?.includes('must be one of')) {
      return res.status(400).json({
        success: false,
        message: "Invalid template configuration. Please check your input values.",
      });
    }
    next(error);
  }
};

/**
 * Start interview from template (no auth required)
 * POST /api/interview/session/:token/start
 * 
 * PRODUCTION FEATURES:
 * - Session locking: prevents concurrent users
 * - Timeout protection: auto-expires old sessions
 * - Resume capability: stores current state
 * - Security: validates via sessionLockId (no JWT)
 */
const startInterviewFromTemplate = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { candidateEmail, candidateName, sessionFingerprint } = req.body || {};

    // Validate sessionFingerprint for resuming existing session
    let existingInterview = null;
    if (sessionFingerprint) {
      existingInterview = await Interview.findOne({
        templateToken: token,
        sessionLockedBy: sessionFingerprint,
        sessionStatus: { $in: ["locked", "in_progress"] },
        isTemplateBasedInterview: true,
      });

      // Check if existing session is expired
      if (existingInterview && existingInterview.sessionLastActivity) {
        const sessionTimeoutMs = (existingInterview.sessionTimeoutMinutes || 30) * 60 * 1000;
        const timeSinceLastActivity = Date.now() - existingInterview.sessionLastActivity.getTime();

        if (timeSinceLastActivity > sessionTimeoutMs) {
          // Session has expired - mark it
          existingInterview.sessionStatus = "expired";
          existingInterview.status = "failed";
          await existingInterview.save();
          existingInterview = null; // Treat as no existing session
        }
      }

      // If existing session found and not expired, resume it
      if (existingInterview) {
        return res.status(200).json({
          success: true,
          message: "Resuming interview session",
          data: {
            sessionId: existingInterview._id,
            interviewId: existingInterview._id,
            sessionLockId: existingInterview.sessionLockedBy,
            questions: existingInterview.questions,
            numberOfQuestions: existingInterview.numberOfQuestions,
            jobRole: existingInterview.jobRole,
            experienceLevel: existingInterview.experienceLevel,
            interviewType: existingInterview.interviewType,
            difficultyLevel: existingInterview.difficultyLevel,
            currentQuestionIndex: existingInterview.currentQuestionIndex,
            resuming: true,
          },
        });
      }
    }

    // ===== NEW SESSION: Check for existing locked sessions =====
    const lockedSession = await Interview.findOne({
      templateToken: token,
      sessionStatus: "locked",
      isTemplateBasedInterview: true,
    });

    if (lockedSession && !sessionFingerprint) {
      // Another candidate is already using this session
      const timeSinceStart = Date.now() - lockedSession.sessionStartedAt.getTime();
      const sessionTimeoutMs = (lockedSession.sessionTimeoutMinutes || 30) * 60 * 1000;

      // If lock is still active (not timed out), reject
      if (timeSinceStart < sessionTimeoutMs) {
        return res.status(409).json({
          success: false,
          message: "This interview session is already in progress by another candidate. Please wait or contact support.",
          code: "SESSION_LOCKED",
        });
      }

      // Lock is expired - release it and proceed with new session
      await Interview.updateOne(
        { _id: lockedSession._id },
        {
          sessionStatus: "expired",
          status: "failed",
        }
      );
    }

    // Find template by unique token
    const template = await InterviewTemplate.findOne({
      uniqueToken: token,
      isActive: true,
    });

    if (!template) {
      throw buildError("Interview session not found or has expired", 404);
    }

    // Define allowed values for validation
    const allowedRoles = ["frontend", "backend", "fullstack", "java", "python", "hr"];
    const allowedExperienceLevels = ["junior", "mid", "senior"];
    const allowedInterviewTypes = ["technical", "behavioral", "all"];
    const allowedDifficultyLevels = ["easy", "medium", "hard"];

    // Normalize template values to lowercase for validation compatibility
    // This ensures existing database records with any case variation work correctly
    const jobRole = (template.jobRole || "").toLowerCase().trim();
    const experienceLevel = (template.experienceLevel || "").toLowerCase().trim();
    const interviewType = (template.interviewType || "").toLowerCase().trim();
    const difficultyLevel = (template.difficultyLevel || "").toLowerCase().trim();

    // Validate normalized values against allowed values
    if (!jobRole || !allowedRoles.includes(jobRole)) {
      throw buildError(
        `Invalid job role: "${template.jobRole}". Allowed values: ${allowedRoles.join(", ")}`,
        400
      );
    }

    if (!experienceLevel || !allowedExperienceLevels.includes(experienceLevel)) {
      throw buildError(
        `Invalid experience level: "${template.experienceLevel}". Allowed values: ${allowedExperienceLevels.join(", ")}`,
        400
      );
    }

    if (!interviewType || !allowedInterviewTypes.includes(interviewType)) {
      throw buildError(
        `Invalid interview type: "${template.interviewType}". Allowed values: ${allowedInterviewTypes.join(", ")}`,
        400
      );
    }

    if (!difficultyLevel || !allowedDifficultyLevels.includes(difficultyLevel)) {
      throw buildError(
        `Invalid difficulty level: "${template.difficultyLevel}". Allowed values: ${allowedDifficultyLevels.join(", ")}`,
        400
      );
    }

    // Generate questions using the validated, normalized template configuration
    const questionsData = await generateQuestions({
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions: template.numberOfQuestions,
    });

    // Generate session lock ID (unique per session per candidate)
    const sessionLockId = crypto.randomUUID();

    // Create interview record with PRODUCTION-READY fields
    const interview = new Interview({
      companyId: template.companyId,
      jobRole,
      experienceLevel,
      interviewType,
      difficultyLevel,
      numberOfQuestions: template.numberOfQuestions,
      questions: questionsData.questions,
      answers: Array(questionsData.questions.length).fill(""),
      status: "in-progress",
      templateId: template._id,
      candidateEmail: candidateEmail || "anonymous@candidate.local",
      candidateName: candidateName || "Candidate",
      isTemplateBasedInterview: true,

      // ===== PRODUCTION READINESS FIELDS =====
      templateToken: token, // Link back to template for session management
      sessionStatus: "locked", // Lock the session for this candidate
      sessionLockedBy: sessionLockId, // Unique ID for this candidate's session
      sessionStartedAt: new Date(),
      sessionLastActivity: new Date(),
      sessionTimeoutMinutes: 30, // Configurable timeout
      currentQuestionIndex: 0, // For resume capability
      answersSnapshot: new Map(), // For resume capability
      transcriptSnapshot: "", // For resume capability
      // =========================================
    });

    await interview.save();

    // Increment template usage
    template.usageCount += 1;
    await template.save();

    res.status(201).json({
      success: true,
      message: "Interview session started",
      data: {
        sessionId: interview._id,
        interviewId: interview._id,
        sessionLockId: sessionLockId, // Return lock ID for frontend to store
        questions: interview.questions,
        numberOfQuestions: interview.numberOfQuestions,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        interviewType: interview.interviewType,
        difficultyLevel: interview.difficultyLevel,
      },
    });
  } catch (error) {
    // Handle validation and configuration errors with detailed message
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      // AppError or validation error - return as is
      return next(error);
    }

    if (error.name === 'ValidationError') {
      // MongoDB validation error
      const errorDetails = Object.values(error.errors)
        .map((e) => e.message)
        .join("; ");

      return res.status(400).json({
        success: false,
        message: "Invalid interview configuration",
        details: errorDetails,
      });
    }

    // Unexpected error
    next(error);
  }
};

/**
 * Get template by token (public - no auth)
 * GET /api/interview/session/:token/info
 */
const getTemplateInfoByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const template = await InterviewTemplate.findOne({
      uniqueToken: token,
      isActive: true,
    }).select("-uniqueToken -companyId -usageCount");

    if (!template) {
      throw buildError("Interview template not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        templateName: template.templateName,
        jobRole: template.jobRole,
        interviewType: template.interviewType,
        experienceLevel: template.experienceLevel,
        difficultyLevel: template.difficultyLevel,
        numberOfQuestions: template.numberOfQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluate template-based interview (public - no auth required)
 * POST /api/interview/session/:interviewId/submit
 * 
 * PRODUCTION FEATURES:
 * - No JWT required (public candidates only)
 * - Validates sessionLockId for security
 * - Duplicate submission protection
 * - Timeout expiration check
 * - Idempotent: same submission returns same result
 */
const evaluateTemplateInterview = async (req, res, next) => {
  try {
    const {
      interviewId,
      sessionLockId,
      jobRole,
      experienceLevel,
      questions,
      interviewType,
      difficultyLevel,
      candidateEmail,
      candidateName,
      answers, // Direct answers array (alternative to questions array)
    } = req.body;

    // ===== SECURITY VALIDATION =====
    if (!interviewId || !sessionLockId) {
      throw buildError(
        "Invalid session. Please start interview again.",
        401
      );
    }

    // Find the interview record
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw buildError("Interview not found", 404);
    }

    // Validate that interview is locked by this session
    if (interview.sessionLockedBy !== sessionLockId) {
      throw buildError(
        "Invalid session. This interview session does not match.",
        401
      );
    }

    // Check if session is expired
    const sessionTimeoutMs = (interview.sessionTimeoutMinutes || 30) * 60 * 1000;
    const timeSinceStart = Date.now() - interview.sessionStartedAt.getTime();

    if (timeSinceStart > sessionTimeoutMs) {
      // Mark as expired
      interview.sessionStatus = "expired";
      interview.status = "failed";
      await interview.save();

      throw buildError(
        "Interview session has expired. Please start a new session.",
        410
      );
    }

    // ===== DUPLICATE SUBMISSION PROTECTION =====
    // If interview already has a submissionId, it's already submitted
    if (interview.submissionId) {
      // Return the previous evaluation (idempotent)
      return res.status(200).json({
        success: true,
        message: "Interview already submitted",
        data: {
          overallScore: interview.evaluation?.score || 0,
          performanceLevel: calculatePerformanceLevel(interview.evaluation?.score || 0),
          summary: interview.evaluation?.strengths || "",
          feedback: {
            strengths: interview.evaluation?.strengths || "",
            areasForImprovement: interview.evaluation?.weaknesses || "",
          },
          questions: [],
        },
        alreadySubmitted: true,
      });
    }

    // ===== PROCESS NEW SUBMISSION =====
    // Generate unique submission ID for idempotency
    const submissionId = crypto.randomUUID();

    // Use either questions array or answers array
    const questionsToEvaluate = questions || interview.questions.map((q, idx) => ({
      question: q,
      answer: answers?.[idx] || interview.answers?.[idx] || "",
    }));

    // Validate we have questions to evaluate
    if (!questionsToEvaluate || questionsToEvaluate.length === 0) {
      throw buildError("No questions found to evaluate", 400);
    }

    // Evaluate each answer
    const evaluations = [];
    const scores = [];

    for (const qa of questionsToEvaluate) {
      const evaluation = await evaluateAnswer({
        question: qa.question,
        answer: qa.answer,
        jobRole: jobRole || interview.jobRole,
        experienceLevel: experienceLevel || interview.experienceLevel,
        difficultyLevel: difficultyLevel || interview.difficultyLevel,
      });

      evaluations.push({
        question: qa.question,
        answer: qa.answer,
        score: evaluation.score * 10, // Convert from 0-10 to 0-100
        feedback: evaluation.suggestions,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
      });

      scores.push(evaluation.score * 10);
    }

    // Generate final evaluation
    const finalEval = await generateFinalEvaluation({
      jobRole: jobRole || interview.jobRole,
      experienceLevel: experienceLevel || interview.experienceLevel,
      interviewType: interviewType || interview.interviewType,
      questionsAndAnswers: questionsToEvaluate,
      scores: scores,
    });

    // Calculate overall score
    const overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) || 0);

    // Determine performance level
    const performanceLevel = calculatePerformanceLevel(overallScore);

    // Update interview record with evaluation and mark as completed
    interview.answers = questionsToEvaluate.map((q) => q.answer);
    interview.status = "completed";
    interview.sessionStatus = "completed";
    interview.submissionId = submissionId; // Mark as submitted
    interview.evaluation = {
      score: overallScore,
      performanceLevel: performanceLevel,
      summary: finalEval.strengths,
      detailedFeedback: {
        strengths: finalEval.strengths,
        weaknesses: finalEval.weaknesses,
        suggestions: finalEval.suggestions,
      },
      interviewTips: finalEval.interviewTips,
    };
    interview.completedAt = new Date();

    // Update activity timestamp
    interview.sessionLastActivity = new Date();

    await interview.save();

    // Prepare response
    const response = {
      overallScore: overallScore,
      performanceLevel: performanceLevel,
      summary: finalEval.strengths,
      scores: {
        technicalKnowledge: Math.round(scores[0] || 0),
        communication: Math.round(scores.length > 1 ? scores[1] : 0),
        problemSolving: Math.round(scores.length > 2 ? scores[2] : 0),
        overallFit: overallScore,
      },
      feedback: {
        strengths: finalEval.strengths,
        areasForImprovement: finalEval.weaknesses,
      },
      questions: evaluations,
    };

    res.status(200).json({
      success: true,
      message: "Interview evaluated successfully",
      data: response,
      submissionId: submissionId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to calculate performance level
 */
const calculatePerformanceLevel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
};

/**
 * Resume interview session (for refresh recovery)
 * GET /api/interview/session/:interviewId/resume
 * 
 * PRODUCTION FEATURE:
 * - Resume from last answered question
 * - Restore state (answers, transcript, current index)
 * - Validate session lock
 * - Check timeout
 */
const resumeInterviewSession = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { sessionLockId } = req.query;

    if (!sessionLockId) {
      throw buildError("Invalid session", 401);
    }

    // Find interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw buildError("Interview not found", 404);
    }

    // Validate session lock
    if (interview.sessionLockedBy !== sessionLockId) {
      throw buildError("Invalid session", 401);
    }

    // Check if session is expired
    const sessionTimeoutMs = (interview.sessionTimeoutMinutes || 30) * 60 * 1000;
    const timeSinceStart = Date.now() - interview.sessionStartedAt.getTime();

    if (timeSinceStart > sessionTimeoutMs) {
      return res.status(410).json({
        success: false,
        message: "Interview session has expired",
        code: "SESSION_EXPIRED",
      });
    }

    // Check if already completed
    if (interview.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Interview already completed",
        code: "INTERVIEW_COMPLETED",
      });
    }

    // Update last activity
    interview.sessionLastActivity = new Date();
    await interview.save();

    // Return resume data
    res.status(200).json({
      success: true,
      message: "Interview session resumed",
      data: {
        sessionId: interview._id,
        currentQuestionIndex: interview.currentQuestionIndex || 0,
        answers: interview.answersSnapshot ? Object.fromEntries(interview.answersSnapshot) : {},
        transcript: interview.transcriptSnapshot || "",
        questions: interview.questions,
        status: interview.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update interview session progress (for resume capability)
 * PUT /api/interview/session/:interviewId/progress
 * 
 * PRODUCTION FEATURE:
 * - Save current question index
 * - Save answer snapshots
 * - Save transcript
 * - Update last activity
 */
const updateInterviewProgress = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { sessionLockId, currentQuestionIndex, answers, transcript } = req.body;

    if (!sessionLockId) {
      throw buildError("Invalid session", 401);
    }

    // Find interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw buildError("Interview not found", 404);
    }

    // Validate session lock
    if (interview.sessionLockedBy !== sessionLockId) {
      throw buildError("Invalid session", 401);
    }

    // Check if already completed
    if (interview.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update completed interview",
      });
    }

    // Update progress
    interview.currentQuestionIndex = currentQuestionIndex || 0;
    if (answers) interview.answersSnapshot = new Map(Object.entries(answers));
    if (transcript) interview.transcriptSnapshot = transcript;
    interview.sessionLastActivity = new Date();

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview progress saved",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTemplate,
  getCompanyTemplates,
  getTemplateById,
  deleteTemplate,
  updateTemplate,
  startInterviewFromTemplate,
  getTemplateInfoByToken,
  evaluateTemplateInterview,
  resumeInterviewSession,
  updateInterviewProgress,
};
