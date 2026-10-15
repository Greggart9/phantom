import { Router } from 'express';
import {
  getCollections,
  getCollectionBySlug,
  createCollection
} from '../controllers/collection.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', getCollections);
router.get('/:slug', getCollectionBySlug);
router.post('/', requireAdmin, createCollection);

export default router;