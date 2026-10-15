import { Router } from 'express';
import {
  uploadMiddleware,
  uploadSingleImage,
  uploadMultipleImages
} from '../controllers/upload.controller';

const router = Router();

// Single image upload (Field name: 'image')
router.post('/image', uploadMiddleware.single('image'), uploadSingleImage);

// Multiple images upload (Field name: 'images', max 10 files)
router.post('/images', uploadMiddleware.array('images', 10), uploadMultipleImages);

export default router;
