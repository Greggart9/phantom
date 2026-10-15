import { Router } from 'express';
import {
  createCheckoutSession,
  confirmOrderPayment,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus
} from '../controllers/order.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Customer authenticated routes
router.post('/checkout', requireAuth, createCheckoutSession);
router.post('/:id/confirm', requireAuth, confirmOrderPayment);
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);

// Admin-only order management routes
router.get('/admin/all', requireAdmin, getAdminOrders);
router.patch('/admin/:id/status', requireAdmin, updateOrderStatus);

export default router;
