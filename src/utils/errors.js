export class AppError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}
