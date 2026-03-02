// c:\Coding\OpenCafe\cafe-pos\backend\src\routes\analyticsRoutes.ts
import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/summary', asyncHandler(analyticsController.getSummary));
router.get('/low-stock', asyncHandler(analyticsController.getLowStock));

export default router;
