import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Check if Cloudinary is configured with valid credentials
export const isCloudinaryConfigured = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    return true;
  }

  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes('your_') &&
    !apiKey.includes('your_')
  );
};

// Initialize configuration if available
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  isMock?: boolean;
}

/**
 * Uploads an image buffer to Cloudinary with maximum performance optimizations:
 * - f_auto (auto WebP/AVIF format based on browser)
 * - q_auto (auto perceptual quality compression)
 * - responsive limits (max width 1800px with aspect preservation)
 */
export const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'phantom/products'
): Promise<UploadResult> => {
  // If Cloudinary credentials are not configured yet, provide a graceful development preview
  if (!isCloudinaryConfigured()) {
    console.warn(
      '[Cloudinary] Credentials not provided in .env — returning base64 development preview. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET when ready.'
    );

    const mimeType = filename.endsWith('.png')
      ? 'image/png'
      : filename.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

    const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    return {
      url: base64,
      publicId: `dev_${Date.now()}`,
      format: mimeType.split('/')[1],
      bytes: fileBuffer.length,
      isMock: true
    };
  }

  // Ensure config is fresh
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1800, crop: 'limit' },
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error('[Cloudinary Upload Error]', error);
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }

        // Return high-performance optimized secure URL
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          isMock: false
        });
      }
    );

    // Stream file buffer to Cloudinary
    uploadStream.end(fileBuffer);
  });
};
