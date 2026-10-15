import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional()
});

export const createCollectionSchema = z.object({
  name: z.string().min(2, 'Collection name must be at least 2 characters'),
  description: z.string().optional(),
  coverImage: z.string().min(1, 'Cover image path or URL is required').optional()
});

export const createProductSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().positive('Price must be greater than zero'),
  originalPrice: z.number().positive().optional().nullable(),
  badge: z.string().optional().nullable(),
  stockQuantity: z.number().int().nonnegative('Stock cannot be negative'),
  categoryId: z.string().uuid('Valid category ID is required'),
  collectionIds: z.array(z.string().uuid()).optional().default([]),
  images: z.array(z.string().min(1, 'Image path or URL is required')).min(1, 'At least one image is required'),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
    inStock: z.boolean().optional().default(true)
  })).optional().nullable(),
  sizes: z.array(z.string()).optional().default([]),
  materials: z.string().optional().nullable(),
  care: z.string().optional().nullable(),
  shippingInfo: z.string().optional().nullable(),
  storyParagraphs: z.array(z.string()).optional().default([]),
  specifications: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional().nullable(),
  isPublished: z.boolean().optional().default(true)
});

export const updateProductSchema = createProductSchema.partial();

export const updateStockSchema = z.object({
  stockQuantity: z.number().int().nonnegative('Stock quantity must be 0 or greater')
});