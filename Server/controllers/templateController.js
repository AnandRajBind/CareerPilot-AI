const InterviewTemplate = require("../models/InterviewTemplate");
const Interview = require("../models/Interview");
const { buildError } = require("../utils/errorBuilder");
const { generateQuestions } = require("../services/groqService");

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
    } = req.validatedBody;

    // Validate required fields
    if (!templateName || !jobRole || !interviewType || !experienceLevel || !difficultyLevel || !numberOfQuestions) {
      throw buildError("All required fields must be provided", 400);
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
    const { candidateEmail, candidateName } = req.validatedBody || {};

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

module.exports = {
  createTemplate,
  getCompanyTemplates,
  getTemplateById,
  deleteTemplate,
  updateTemplate,
  startInterviewFromTemplate,
  getTemplateInfoByToken,
};
