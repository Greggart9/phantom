import { Router } from 'express';
import {
  getJournalPosts,
  getJournalPostBySlug,
  createJournalPost,
  updateJournalPost,
  deleteJournalPost
} from '../controllers/journal.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes for reading
router.get('/', getJournalPosts);
router.get('/:slug', getJournalPostBySlug);

// Admin-only routes for authoring
router.post('/', requireAdmin, createJournalPost);
router.put('/:id', requireAdmin, updateJournalPost);
router.delete('/:id', requireAdmin, deleteJournalPost);

export default router;
