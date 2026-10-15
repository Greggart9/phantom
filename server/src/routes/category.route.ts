import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', getCategories);
router.post('/', requireAdmin, createCategory);

export default router;