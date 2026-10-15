import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  getCart,
  syncCart,
  addOrUpdateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/sync', syncCart);
router.post('/items', addOrUpdateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);

export default router;
