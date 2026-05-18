import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (request, response) => {
  response.status(404).json({
    error: {
      message: `Route not found: ${request.method} ${request.originalUrl}`
    }
  });
};

export const errorHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  if (error.type === 'entity.parse.failed') {
    response.status(400).json({
      error: {
        message: 'Malformed JSON request body'
      }
    });
    return;
  }

  logger.error('Unhandled request error', {
    error: error.message,
    stack: error.stack
  });

  response.status(500).json({
    error: {
      message: 'Internal server error'
    }
  });
};
