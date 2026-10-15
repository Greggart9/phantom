import { Request, Response } from 'express';
import multer from 'multer';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '../services/cloudinary.service';

// In-memory storage for direct Cloudinary streaming (no local disk clutter)
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024 // 12 MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only valid image files (JPG, PNG, WEBP, AVIF, SVG) are permitted'));
    }
  }
});

// POST /api/upload/image (Single image upload)
export const uploadSingleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided for upload.' });
      return;
    }

    const folder = (req.body.folder as string) || 'phantom/products';
    const result = await uploadImageToCloudinary(
      req.file.buffer,
      req.file.originalname,
      folder
    );

    res.json({
      success: true,
      message: result.isMock
        ? 'Image processed in development preview mode.'
        : 'Image optimized and stored on Cloudinary.',
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      isConfigured: isCloudinaryConfigured()
    });
  } catch (error: any) {
    console.error('[Upload Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to Cloudinary.'
    });
  }
};

// POST /api/upload/images (Batch multi-image upload, e.g. for product sets)
export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No image files provided for upload.' });
      return;
    }

    const folder = (req.body.folder as string) || 'phantom/products';

    // Upload all in parallel
    const uploadPromises = files.map((file) =>
      uploadImageToCloudinary(file.buffer, file.originalname, folder)
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `${results.length} images successfully uploaded and optimized.`,
      images: results.map((r) => ({
        url: r.url,
        publicId: r.publicId,
        width: r.width,
        height: r.height,
        format: r.format,
        bytes: r.bytes
      })),
      urls: results.map((r) => r.url),
      isConfigured: isCloudinaryConfigured()
    });
  } catch (error: any) {
    console.error('[Batch Upload Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images to Cloudinary.'
    });
  }
};
