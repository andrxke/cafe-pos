// c:\Coding\OpenCafe\cafe-pos\backend\src\controllers\transactionController.ts
import type { Request, Response } from 'express';
import * as transactionService from '../services/transactionService';

export async function getTransactions(_req: Request, res: Response) {
  const data = await transactionService.listTransactions();
  res.json({ success: true, data });
}

