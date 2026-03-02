// c:\Coding\OpenCafe\cafe-pos\backend\src\controllers\menuController.ts
import type { Request, Response } from 'express';
import * as menuService from '../services/menuService';

export async function getMenu(_req: Request, res: Response) {
  const data = await menuService.listMenuItems();
  res.json({ success: true, data });
}

export async function createMenu(req: Request, res: Response) {
  const data = await menuService.createMenuItem(req.body);
  res.status(201).json({ success: true, data });
}

export async function patchMenu(req: Request, res: Response) {
  const data = await menuService.updateMenuItem(Number(req.params.id), req.body);
  res.json({ success: true, data });
}

