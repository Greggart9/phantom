import { Router } from 'express';
import {
  getRecentReviews,
  getProductReviews,
  createReview
} from '../controllers/review.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public: Get top recent reviews for landing page
router.get('/recent', getRecentReviews);

// Public: Get reviews for a specific product
router.get('/product/:productId', getProductReviews);

// Protected: Post a new review (user must be authenticated; name & country pulled automatically)
router.post('/', requireAuth, createReview);

export default router;
