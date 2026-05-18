import express from 'express';
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { closePool, verifyDatabaseConnection } from './db/postgres.js';
import { startOrderChangeListener, stopOrderChangeListener } from './listeners/orderNotifications.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { healthRouter } from './routes/health.js';
import { ordersRouter } from './routes/orders.js';
import { broadcastOrderChange, initializeSocketServer, stopSocketServer } from './sockets/socketServer.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);
let isShuttingDown = false;

app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));
app.use('/health', healthRouter);
app.use('/api/orders', ordersRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const closeHttpServer = async () => {
  await new Promise((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress', { signal });
    return;
  }

  isShuttingDown = true;
  logger.info('Shutdown signal received', { signal });

  try {
    await stopOrderChangeListener();
    await stopSocketServer();
    await closeHttpServer();
    await closePool();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Shutdown failed', { error: error.message });
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await verifyDatabaseConnection();
    initializeSocketServer(httpServer);
    await startOrderChangeListener({
      onOrderChange: broadcastOrderChange
    });

    httpServer.listen(env.port, () => {
      logger.info('Server listening', { port: env.port });
    });

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : reason
      });
    });
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message });
      shutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
