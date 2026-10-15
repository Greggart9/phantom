import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
} from '../controllers/product.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public catalog routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin-only mutation routes
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.patch('/:id/stock', requireAdmin, updateStock);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;