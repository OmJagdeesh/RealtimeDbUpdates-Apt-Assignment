import { Router } from 'express';
import {
  createOrderHandler,
  deleteOrderHandler,
  listOrders,
  updateOrderHandler
} from '../controllers/ordersController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const ordersRouter = Router();

ordersRouter.get('/', asyncHandler(listOrders));
ordersRouter.post('/', asyncHandler(createOrderHandler));
ordersRouter.put('/:id', asyncHandler(updateOrderHandler));
ordersRouter.delete('/:id', asyncHandler(deleteOrderHandler));
