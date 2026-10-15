import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Helper to get or create cart for user safely
const getOrCreateUserCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true }
  });

  if (!cart) {
    try {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      });
    } catch {
      // Gracefully handle race condition if cart was created concurrently
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true }
      });
    }
  }

  return cart!;
};

// GET /api/cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const cart = await getOrCreateUserCart(userId);
    res.json({ success: true, cart: cart?.items || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch cart' });
  }
};

// POST /api/cart/sync - Merge client-side localStorage cart with database
export const syncCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { items } = req.body; // Array of cart items from client
    const cart = await getOrCreateUserCart(userId);

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const prod = item.product || item;
        const rawId = prod.id || item.productId;
        const slug = prod.slug || item.productSlug;

        // Verify product in database before inserting to avoid FK violation
        const dbProd = await prisma.product.findFirst({
          where: {
            OR: [
              ...(rawId && !rawId.startsWith('prod-') ? [{ id: rawId }] : []),
              ...(slug ? [{ slug }] : [])
            ]
          },
          select: { id: true, title: true, price: true, images: true, slug: true, category: { select: { name: true } } }
        });

        if (!dbProd) {
          // If piece is not in live database (e.g. stale client mock), omit to preserve DB integrity
          continue;
        }

        const resolvedProductId = dbProd.id;
        const title = dbProd.title;
        const price = Number(dbProd.price);
        const image = (dbProd.images && dbProd.images[0]) || '';
        const category = dbProd.category?.name || 'Phantom';
        const size = item.selectedSize || null;
        const color = item.selectedColor || null;
        const qty = item.quantity || 1;

        // Check if item already exists in cart with same size & color
        const existing = cart.items.find(
          (ci) =>
            ci.productId === resolvedProductId &&
            ci.selectedSize === size &&
            ci.selectedColor === color
        );

        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: Math.max(existing.quantity, qty) }
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: resolvedProductId,
              productSlug: dbProd.slug,
              productTitle: title,
              productPrice: price,
              productImage: image,
              category,
              selectedSize: size,
              selectedColor: color,
              quantity: qty
            }
          });
        }
      }
    }

    // Return updated cart
    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });

    res.json({ success: true, cart: updated?.items || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to sync cart' });
  }
};

// POST /api/cart/items - Add or update a single item in cart
export const addOrUpdateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { product, quantity = 1, selectedSize, selectedColor } = req.body;
    if (!product) {
      res.status(400).json({ success: false, message: 'Product is required' });
      return;
    }

    const cart = await getOrCreateUserCart(userId);
    const rawId = product.id || req.body.productId;
    const slug = product.slug;

    // Verify product exists in DB
    const dbProd = await prisma.product.findFirst({
      where: {
        OR: [
          ...(rawId && !rawId.startsWith('prod-') ? [{ id: rawId }] : []),
          ...(slug ? [{ slug }] : [])
        ]
      },
      select: { id: true, title: true, price: true, images: true, slug: true, category: { select: { name: true } } }
    });

    if (!dbProd) {
      res.status(404).json({ success: false, message: 'Garment not found in catalog' });
      return;
    }

    const resolvedProductId = dbProd.id;
    const title = dbProd.title;
    const price = Number(dbProd.price);
    const image = (dbProd.images && dbProd.images[0]) || '';
    const category = dbProd.category?.name || 'Phantom';
    const size = selectedSize || null;
    const color = selectedColor || null;

    const existing = cart.items.find(
      (ci) =>
        ci.productId === resolvedProductId &&
        ci.selectedSize === size &&
        ci.selectedColor === color
    );

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: resolvedProductId,
          productSlug: dbProd.slug,
          productTitle: title,
          productPrice: price,
          productImage: image,
          category,
          selectedSize: size,
          selectedColor: color,
          quantity
        }
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });

    res.json({ success: true, cart: updated?.items || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update cart' });
  }
};

// DELETE /api/cart/items/:id - Remove item
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = String(req.params.id);
    const cart = await getOrCreateUserCart(userId);

    // Delete by item id or by productId
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        OR: [{ id }, { productId: id }]
      }
    });

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });

    res.json({ success: true, cart: updated?.items || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to remove cart item' });
  }
};

// DELETE /api/cart - Clear cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const cart = await getOrCreateUserCart(userId);
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    res.json({ success: true, message: 'Cart cleared', cart: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to clear cart' });
  }
};
