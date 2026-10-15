import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  getWishlist,
  syncWishlist,
  toggleWishlist,
  removeWishlistItem,
  clearWishlist
} from '../controllers/wishlist.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getWishlist);
router.post('/sync', syncWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/:productId', removeWishlistItem);
router.delete('/', clearWishlist);

export default router;
