// c:\Coding\OpenCafe\cafe-pos\backend\src\controllers\orderController.ts
import type { Request, Response } from 'express';
import * as orderService from '../services/orderService';

export async function getOrders(_req: Request, res: Response) {
  const data = await orderService.listOrders();
  res.json({ success: true, data });
}

export async function createOrder(req: Request, res: Response) {
  const data = await orderService.createOrder(req.body);
  res.status(201).json({ success: true, data });
}

export async function patchOrderStatus(req: Request, res: Response) {
  const data = await orderService.updateOrderStatus(Number(req.params.id), req.body.status);
  res.json({ success: true, data });
}

export async function addOrderComment(req: Request, res: Response) {
  const data = await orderService.addOrderComment(Number(req.params.id), req.body);
  res.status(201).json({ success: true, data });
}

export async function getOrderQueue(_req: Request, res: Response) {
  const data = await orderService.getOrderQueue();
  res.json({ success: true, data });
}

