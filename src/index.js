import express from 'express';
import { env } from './config/env.js';
import { closePool, verifyDatabaseConnection } from './db/postgres.js';
import { healthRouter } from './routes/health.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(express.json());
app.use('/health', healthRouter);

const startServer = async () => {
  try {
    await verifyDatabaseConnection();

    const server = app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down server...`);

      server.close(async () => {
        await closePool();
        logger.info('Shutdown complete.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
