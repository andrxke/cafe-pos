// c:\Coding\OpenCafe\cafe-pos\backend\src\routes\orderRoutes.ts
import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/queue', asyncHandler(orderController.getOrderQueue));
router.get('/', asyncHandler(orderController.getOrders));
router.post('/', asyncHandler(orderController.createOrder));
router.patch('/:id/status', asyncHandler(orderController.patchOrderStatus));
router.post('/:id/comments', asyncHandler(orderController.addOrderComment));

export default router;
