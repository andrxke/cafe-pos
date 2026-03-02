// c:\Coding\OpenCafe\cafe-pos\backend\src\controllers\inventoryController.ts
import type { Request, Response } from 'express';
import * as inventoryService from '../services/inventoryService';

export async function getInventory(_req: Request, res: Response) {
  const data = await inventoryService.listInventory();
  res.json({ success: true, data });
}

export async function patchInventory(req: Request, res: Response) {
  const data = await inventoryService.updateInventory(
    Number(req.params.id),
    Number(req.body.quantity_in_stock),
  );
  res.json({ success: true, data });
}

