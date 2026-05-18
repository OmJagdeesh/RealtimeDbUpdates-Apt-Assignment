import express from 'express';
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { closePool, verifyDatabaseConnection } from './db/postgres.js';
import { startOrderChangeListener, stopOrderChangeListener } from './listeners/orderNotifications.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { ordersRouter } from './routes/orders.js';
import { broadcastOrderChange, initializeSocketServer, stopSocketServer } from './sockets/socketServer.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));
app.use('/health', healthRouter);
app.use('/api/orders', ordersRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    initializeSocketServer(httpServer);
    await verifyDatabaseConnection();
    await startOrderChangeListener({
      onOrderChange: broadcastOrderChange
    });

    httpServer.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down server...`);

      await stopOrderChangeListener();
      await stopSocketServer();

      httpServer.close(async () => {
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
