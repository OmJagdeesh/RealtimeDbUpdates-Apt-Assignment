import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let io;

export const initializeSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    serveClient: true
  });

  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', {
      socketId: socket.id,
      connectedClients: io.engine.clientsCount
    });

    socket.emit('connection:ready', {
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', {
        socketId: socket.id,
        reason,
        connectedClients: io.engine.clientsCount
      });
    });

    socket.on('error', (error) => {
      logger.error('WebSocket client error', {
        socketId: socket.id,
        error: error.message
      });
    });
  });

  io.engine.on('connection_error', (error) => {
    logger.error('WebSocket connection error', {
      code: error.code,
      message: error.message
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
};

export const broadcastOrderChange = (payload) => {
  if (!io) {
    logger.warn('Skipped websocket broadcast because Socket.IO is not initialized', {
      operation: payload?.operation,
      orderId: payload?.order?.id
    });
    return;
  }

  io.emit('orders:change', payload);

  logger.info('Broadcasted order change to websocket clients', {
    operation: payload.operation,
    orderId: payload.order?.id,
    connectedClients: io.engine.clientsCount
  });
};

export const stopSocketServer = async () => {
  if (!io) {
    return;
  }

  await new Promise((resolve) => {
    io.close(resolve);
  });

  io = undefined;
  logger.info('Socket.IO server stopped');
};
