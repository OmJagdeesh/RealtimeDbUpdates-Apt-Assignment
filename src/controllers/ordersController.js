import {
  createOrder,
  deleteOrder,
  getOrders,
  updateOrder
} from '../services/orderService.js';

export const listOrders = async (_request, response) => {
  const orders = await getOrders();
  response.status(200).json({ data: orders });
};

export const createOrderHandler = async (request, response) => {
  const order = await createOrder(request.body);
  response.status(201).json({ data: order });
};

export const updateOrderHandler = async (request, response) => {
  const order = await updateOrder(request.params.id, request.body);
  response.status(200).json({ data: order });
};

export const deleteOrderHandler = async (request, response) => {
  const deletedOrder = await deleteOrder(request.params.id);
  response.status(200).json({ data: deletedOrder });
};
