import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { stripe, isStripeConfigured } from '../config/stripe';
import { checkoutSchema, updateOrderStatusSchema } from '../validators/order.validator';

const generateOrderNumber = () =>
  `PH-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

// POST /api/orders/checkout (Authenticated users only)
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { items, shippingAddress } = parsed.data;

    // 1. Fetch products & verify stock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isPublished: true }
    });

    if (products.length !== items.length) {
      res.status(404).json({ success: false, message: 'One or more selected items are unavailable' });
      return;
    }

    // 2. Validate inventory count
    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;
    const orderItemsData: Array<{ productId: string; quantity: number; unitPrice: number }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (product.stockQuantity < item.quantity || product.stockQuantity <= 0) {
        res.status(400).json({
          success: false,
          message: `"${product.title}" is sold out or does not have enough remaining stock.`
        });
        return;
      }
      const price = Number(product.price);
      totalAmount += price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: price
      });
    }

    // 3. Create Order in Database (PENDING)
    const orderNumber = generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount,
        status: 'PENDING',
        shippingAddress: shippingAddress as any,
        orderItems: {
          create: orderItemsData.map((oi) => ({
            productId: oi.productId,
            quantity: oi.quantity,
            unitPrice: oi.unitPrice
          }))
        }
      },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 4. Create Stripe Checkout Session (if configured) or simulated checkout
    if (isStripeConfigured && stripe) {
      const line_items = order.orderItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.title,
            description: item.product.description.slice(0, 100),
            images: item.product.images.slice(0, 1).map((img) =>
              img.startsWith('http') ? img : `${process.env.SERVER_URL || 'http://localhost:5000'}${img}`
            )
          },
          unit_amount: Math.round(Number(item.unitPrice) * 100)
        },
        quantity: item.quantity
      }));

      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: `${clientUrl}/checkout/success?orderId=${order.id}`,
        cancel_url: `${clientUrl}/checkout/cancel?orderId=${order.id}`,
        client_reference_id: order.id,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber
        }
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: session.id }
      });

      res.status(201).json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutUrl: session.url
      });
    } else {
      // Development mode / Simulated checkout fallback
      res.status(201).json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        isSimulated: true,
        checkoutUrl: `${clientUrl}/checkout/success?orderId=${order.id}`
      });
    }
  } catch (error) {
    console.error('createCheckoutSession Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate checkout' });
  }
};

// POST /api/orders/:id/confirm (Confirm payment & deduct inventory)
export const confirmOrderPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.userId !== userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (order.status === 'PAID') {
      res.json({ success: true, message: 'Order already paid', order });
      return;
    }

    // Atomic transaction: Mark as PAID and decrement inventory for each item
    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
        include: {
          orderItems: {
            include: { product: true }
          }
        }
      });
    });

    res.json({
      success: true,
      message: 'Payment confirmed and inventory updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('confirmOrderPayment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm order' });
  }
};

// GET /api/orders/my-orders (Customer's order history)
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// GET /api/orders/:id (Get single order by ID)
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true }
        },
        user: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.userId !== userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// GET /api/orders/admin/all (Admin only - List all orders)
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch all orders' });
  }
};

// PATCH /api/orders/admin/:id/status (Admin only - Update order status)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: parsed.data.status },
      include: {
        orderItems: { include: { product: true } },
        user: { select: { id: true, fullName: true, email: true } }
      }
    });

    res.json({
      success: true,
      message: `Order status updated to ${order.status}`,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};
