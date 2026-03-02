// c:\Coding\OpenCafe\cafe-pos\backend\src\routes\inventoryRoutes.ts
import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(inventoryController.getInventory));
router.patch('/:id', asyncHandler(inventoryController.patchInventory));

export default router;
