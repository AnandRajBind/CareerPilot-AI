// Interview modes
const INTERVIEW_MODES = {
  TEXT: "text",
  VIDEO: "video",
  AUDIO: "audio",
};

// Interview status
const INTERVIEW_STATUS = {
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Difficulty levels
const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// Error messages
const ERROR_MESSAGES = {
  USER_EXISTS: "User with this email already exists",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  INTERVIEW_NOT_FOUND: "Interview not found",
  NOT_AUTHORIZED: "Not authorized to access this resource",
  INVALID_TOKEN: "Invalid or expired token",
  VALIDATION_FAILED: "Validation failed",
};

// Success messages
const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: "Registration successful",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PROFILE_UPDATED: "Profile updated successfully",
  INTERVIEW_CREATED: "Interview created successfully",
  INTERVIEW_UPDATED: "Interview updated successfully",
  INTERVIEW_DELETED: "Interview deleted successfully",
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Score ranges
const SCORE_CONFIG = {
  MIN: 0,
  MAX: 100,
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  INTERVIEW_MODES,
  INTERVIEW_STATUS,
  DIFFICULTY_LEVELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  SCORE_CONFIG,
  PAGINATION,
};
