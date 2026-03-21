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
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .required(),
    password: Joi.string().required(),
  }),

  createInterview: Joi.object({
    role: Joi.string().trim().min(2).max(100).required(),
    mode: Joi.string().valid("text", "video", "audio").required(),
    questions: Joi.array().items(
      Joi.object({
        question: Joi.string().required(),
        difficulty: Joi.string().valid("easy", "medium", "hard"),
      })
    ),
  }),

  updateInterview: Joi.object({
    answers: Joi.array().items(
      Joi.object({
        questionId: Joi.string().required(),
        answer: Joi.string().required(),
      })
    ),
    scores: Joi.object({
      technical: Joi.number().min(0).max(100),
      communication: Joi.number().min(0).max(100),
      confidence: Joi.number().min(0).max(100),
    }),
    feedback: Joi.string().max(5000),
    status: Joi.string().valid("in-progress", "completed", "failed"),
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
