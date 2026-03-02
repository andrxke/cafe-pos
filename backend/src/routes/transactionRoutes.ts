// c:\Coding\OpenCafe\cafe-pos\backend\src\routes\transactionRoutes.ts
import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(transactionController.getTransactions));

export default router;
