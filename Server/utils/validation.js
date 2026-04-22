const Joi = require("joi");

const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string()
      .email()
      .lowercase()
      .required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    companyName: Joi.string().trim().min(2).max(150).required(),
    industry: Joi.string()
      .valid("technology", "finance", "healthcare", "retail", "manufacturing", "education", "other")
      .required(),
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .required(),
    password: Joi.string().required(),
  }),

  startInterview: Joi.object({
    jobRole: Joi.string()
      .valid("frontend", "backend", "fullstack", "java", "python", "hr")
      .required(),
    experienceLevel: Joi.string()
      .valid("junior", "mid", "senior")
      .required(),
    interviewType: Joi.string()
      .valid("technical", "behavioral", "all")
      .required(),
    difficultyLevel: Joi.string()
      .valid("easy", "medium", "hard")
      .required(),
    numberOfQuestions: Joi.number()
      .min(1)
      .max(20)
      .default(5),
  }),

  generateQuestions: Joi.object({
    jobRole: Joi.string()
      .valid("frontend", "backend", "fullstack", "java", "python", "hr")
      .required(),
    experienceLevel: Joi.string()
      .valid("junior", "mid", "senior")
      .required(),
    interviewType: Joi.string()
      .valid("technical", "behavioral", "all")
      .required(),
    difficultyLevel: Joi.string()
      .valid("easy", "medium", "hard")
      .required(),
    numberOfQuestions: Joi.number()
      .min(1)
      .max(20)
      .default(5),
  }),

  submitAnswer: Joi.object({
    answer: Joi.string().required().min(5).max(5000),
    questionIndex: Joi.number().min(0).required(),
  }),

  completeInterview: Joi.object({
    answers: Joi.array()
      .items(Joi.string().required())
      .required()
      .min(1),
  }),

  createInterview: Joi.object({
    jobRole: Joi.string()
      .valid("frontend", "backend", "fullstack", "java", "python", "hr")
      .required(),
    experienceLevel: Joi.string()
      .valid("junior", "mid", "senior")
      .required(),
    interviewType: Joi.string()
      .valid("technical", "behavioral", "all")
      .required(),
    difficultyLevel: Joi.string()
      .valid("easy", "medium", "hard")
      .required(),
    numberOfQuestions: Joi.number()
      .min(1)
      .max(20)
      .default(5),
    questions: Joi.array().items(Joi.string()),
  }),

  updateInterview: Joi.object({
    answers: Joi.array().items(Joi.string()),
    status: Joi.string().valid("in-progress", "completed", "failed"),
  }),

  createTemplate: Joi.object({
    templateName: Joi.string().trim().min(3).max(100).required(),
    templateDescription: Joi.string().trim().max(500).allow(""),
    jobRole: Joi.string()
      .lowercase()
      .valid("frontend", "backend", "fullstack", "java", "python", "hr")
      .required(),
    experienceLevel: Joi.string()
      .lowercase()
      .valid("junior", "mid", "senior")
      .required(),
    interviewType: Joi.string()
      .lowercase()
      .valid("technical", "behavioral", "all")
      .required(),
    difficultyLevel: Joi.string()
      .lowercase()
      .valid("easy", "medium", "hard")
      .required(),
    numberOfQuestions: Joi.number()
      .min(1)
      .max(20)
      .required(),
  }),

  updateTemplate: Joi.object({
    templateName: Joi.string().trim().min(3).max(100),
    templateDescription: Joi.string().trim().max(500).allow(""),
    jobRole: Joi.string()
      .lowercase()
      .valid("frontend", "backend", "fullstack", "java", "python", "hr"),
    experienceLevel: Joi.string()
      .lowercase()
      .valid("junior", "mid", "senior"),
    interviewType: Joi.string()
      .lowercase()
      .valid("technical", "behavioral", "all"),
    difficultyLevel: Joi.string()
      .lowercase()
      .valid("easy", "medium", "hard"),
    numberOfQuestions: Joi.number()
      .min(1)
      .max(20),
    isActive: Joi.boolean(),
  }),

  // Mock Interview Validation Schemas (No Authentication Required)
  startMockInterview: Joi.object({
    studentName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),
    rollNumber: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required(),
    collegeName: Joi.string()
      .trim()
      .min(2)
      .max(150)
      .required(),
    email: Joi.string()
      .email()
      .lowercase()
      .optional()
      .allow(""),
    jobRole: Joi.string()
      .lowercase()
      .valid("frontend", "backend", "fullstack", "java", "python", "hr", "data-science")
      .required(),
    experienceLevel: Joi.string()
      .lowercase()
      .valid("junior", "mid", "senior")
      .required(),
    interviewType: Joi.string()
      .lowercase()
      .valid("technical", "behavioral", "all")
      .required(),
    difficultyLevel: Joi.string()
      .lowercase()
      .valid("easy", "medium", "hard")
      .required(),
    numberOfQuestions: Joi.number()
      .min(1)
      .max(20)
      .default(5),
  }),

  submitMockAnswer: Joi.object({
    interviewId: Joi.string()
      .required(),
    questionIndex: Joi.number()
      .min(0)
      .required(),
    answer: Joi.string()
      .required()
      .min(5)
      .max(5000),
    format: Joi.string()
      .valid("text", "voice")
      .default("text"),
  }),
};

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: messages,
      },
    });
  }

  req.validatedBody = value;
  next();
};

module.exports = {
  schemas,
  validate,
};
