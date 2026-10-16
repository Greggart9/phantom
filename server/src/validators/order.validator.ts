import { z } from 'zod';

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Valid product ID required'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
        selectedSize: z.string().optional(),
        selectedColor: z.string().optional()
      })
    )
    .min(1, 'At least one item is required to checkout'),
  shippingAddress: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    fullName: z.string().optional(),
    address: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postcode: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional()
  }),
  deliveryMethod: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional()
});
