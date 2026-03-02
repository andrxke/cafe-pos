// c:\Coding\OpenCafe\cafe-pos\backend\src\routes\menuRoutes.ts
import { Router } from 'express';
import * as menuController from '../controllers/menuController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(menuController.getMenu));
router.post('/', asyncHandler(menuController.createMenu));
router.patch('/:id', asyncHandler(menuController.patchMenu));

export default router;
