import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import {
  getAdminOverview,
  getAdminOrders,
  updateAdminOrderStatus,
  deleteAdminOrder,
  getAdminReviews,
  toggleReviewApproval,
  deleteReview,
  getAdminJournal,
  createAdminJournal,
  updateAdminJournal,
  deleteAdminJournal,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminCollections,
  createAdminCollection,
  updateAdminCollection,
  deleteAdminCollection,
  getAdminUsers,
  deleteAdminUser
} from '../controllers/admin.controller';

const router = Router();

// Protect ALL admin routes with requireAdmin middleware
router.use(requireAdmin);

// Overview / Analytics
router.get('/overview', getAdminOverview);

// Users Management
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);

// Orders & Fulfillment
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateAdminOrderStatus);
router.delete('/orders/:id', deleteAdminOrder);

// Reviews Moderation
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/approval', toggleReviewApproval);
router.delete('/reviews/:id', deleteReview);

// Journal / Chronicles CRUD
router.get('/journal', getAdminJournal);
router.post('/journal', createAdminJournal);
router.put('/journal/:id', updateAdminJournal);
router.delete('/journal/:id', deleteAdminJournal);

// Categories CRUD
router.get('/categories', getAdminCategories);
router.post('/categories', createAdminCategory);
router.put('/categories/:id', updateAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

// Collections CRUD
router.get('/collections', getAdminCollections);
router.post('/collections', createAdminCollection);
router.put('/collections/:id', updateAdminCollection);
router.delete('/collections/:id', deleteAdminCollection);

export default router;
