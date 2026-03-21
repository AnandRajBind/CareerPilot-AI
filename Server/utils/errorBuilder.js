class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const buildError = (message, statusCode = 400) => {
  return new AppError(message, statusCode);
};

module.exports = { AppError, buildError };
