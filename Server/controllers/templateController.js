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

    // Create new template
    const template = new InterviewTemplate({
      companyId: req.company._id,
      templateName,
      templateDescription: templateDescription || "",
      jobRole,
      interviewType,
      experienceLevel,
      difficultyLevel,
      numberOfQuestions,
    });

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

    // Update fields
    if (templateName) template.templateName = templateName;
    if (templateDescription !== undefined) template.templateDescription = templateDescription;
    if (jobRole) template.jobRole = jobRole;
    if (interviewType) template.interviewType = interviewType;
    if (experienceLevel) template.experienceLevel = experienceLevel;
    if (difficultyLevel) template.difficultyLevel = difficultyLevel;
    if (numberOfQuestions) template.numberOfQuestions = numberOfQuestions;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    res.status(200).json({
      success: true,
      message: "Interview template updated successfully",
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start interview from template (no auth required)
 * POST /api/interview/session/:token
 */
const startInterviewFromTemplate = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { candidateEmail, candidateName } = req.body || {};

    // Find template by unique token
    const template = await InterviewTemplate.findOne({
      uniqueToken: token,
      isActive: true,
    });

    if (!template) {
      throw buildError("Interview session not found or has expired", 404);
    }

    // Generate questions using the template configuration
    const questionsData = await generateQuestions({
      jobRole: template.jobRole,
      experienceLevel: template.experienceLevel,
      interviewType: template.interviewType,
      difficultyLevel: template.difficultyLevel,
      numberOfQuestions: template.numberOfQuestions,
    });

    // Create interview record (linked to company)
    const interview = new Interview({
      companyId: template.companyId,
      jobRole: template.jobRole,
      experienceLevel: template.experienceLevel,
      interviewType: template.interviewType,
      difficultyLevel: template.difficultyLevel,
      numberOfQuestions: template.numberOfQuestions,
      questions: questionsData.questions,
      answers: Array(questionsData.questions.length).fill(""),
      status: "in-progress",
      templateId: template._id,
      candidateEmail: candidateEmail || "anonymous@candidate.local",
      candidateName: candidateName || "Candidate",
      isTemplateBasedInterview: true,
    });

    await interview.save();

    // Increment template usage
    template.usageCount += 1;
    await template.save();

    res.status(201).json({
      success: true,
      message: "Interview session started",
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
 * POST /api/interview/evaluate
 */
const evaluateTemplateInterview = async (req, res, next) => {
  try {
    const {
      interviewId,
      jobRole,
      experienceLevel,
      questions,
      interviewType,
      difficultyLevel,
      candidateEmail,
      candidateName,
    } = req.body;

    if (!interviewId || !jobRole || !questions || !Array.isArray(questions)) {
      throw buildError("Invalid request parameters", 400);
    }

    // Find the interview record
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw buildError("Interview not found", 404);
    }

    // Evaluate each answer
    const evaluations = [];
    const scores = [];

    for (const qa of questions) {
      const evaluation = await evaluateAnswer({
        question: qa.question,
        answer: qa.answer,
        jobRole: jobRole,
        experienceLevel: experienceLevel,
        difficultyLevel: difficultyLevel,
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
      jobRole: jobRole,
      experienceLevel: experienceLevel,
      interviewType: interviewType,
      questionsAndAnswers: questions,
      scores: scores,
    });

    // Calculate overall score
    const overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) || 0);

    // Determine performance level
    let performanceLevel = "Poor";
    if (overallScore >= 80) performanceLevel = "Excellent";
    else if (overallScore >= 70) performanceLevel = "Very Good";
    else if (overallScore >= 60) performanceLevel = "Good";
    else if (overallScore >= 50) performanceLevel = "Fair";

    // Update interview record with evaluation
    interview.answers = questions.map((q) => q.answer);
    interview.status = "completed";
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
};
