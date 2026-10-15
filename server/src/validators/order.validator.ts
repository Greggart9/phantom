import { z } from 'zod';

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Valid product ID required'),
        quantity: z.number().int().positive('Quantity must be at least 1')
      })
    )
    .min(1, 'At least one item is required to checkout'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Recipient full name is required'),
    addressLine1: z.string().min(3, 'Street address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    postalCode: z.string().min(2, 'Postal/ZIP code is required'),
    country: z.string().min(2, 'Country is required'),
    phone: z.string().optional()
  })
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'])
});
