import { logger } from '../utils/logger.js';

export const requestLogger = (request, response, next) => {
  const startedAt = process.hrtime.bigint();

  response.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info('HTTP request completed', {
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    });
  });

  next();
};
