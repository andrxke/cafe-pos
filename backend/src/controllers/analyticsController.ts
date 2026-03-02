// c:\Coding\OpenCafe\cafe-pos\backend\src\controllers\analyticsController.ts
import type { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';

export async function getSummary(_req: Request, res: Response) {
  const data = await analyticsService.getAnalyticsSummary();
  res.json({ success: true, data });
}

export async function getLowStock(_req: Request, res: Response) {
  const data = await analyticsService.listLowStockItems();
  res.json({ success: true, data });
}

