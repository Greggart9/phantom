import { Request, Response } from 'express';
import { prisma } from '../prisma';

// GET /api/wishlist
export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, wishlist: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch wishlist' });
  }
};

// POST /api/wishlist/sync - Merge client wishlist with database
export const syncWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { items } = req.body; // Array of product items
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const rawId = item.id || item.productId;
        const slug = item.slug || item.productSlug;

        const dbProd = await prisma.product.findFirst({
          where: {
            OR: [
              ...(rawId && !rawId.startsWith('prod-') ? [{ id: rawId }] : []),
              ...(slug ? [{ slug }] : [])
            ]
          },
          select: { id: true, title: true, price: true, images: true, slug: true, category: { select: { name: true } } }
        });

        if (!dbProd) continue;

        const productId = dbProd.id;
        const title = dbProd.title;
        const price = Number(dbProd.price);
        const image = (dbProd.images && dbProd.images[0]) || '';
        const category = dbProd.category?.name || 'Phantom';

        await prisma.wishlistItem.upsert({
          where: {
            userId_productId: {
              userId,
              productId
            }
          },
          update: {},
          create: {
            userId,
            productId,
            productSlug: dbProd.slug,
            productTitle: title,
            productPrice: price,
            productImage: image,
            category
          }
        });
      }
    }

    const allItems = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, wishlist: allItems });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to sync wishlist' });
  }
};

// POST /api/wishlist/toggle - Toggle product in wishlist
export const toggleWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { product } = req.body;
    if (!product) {
      res.status(400).json({ success: false, message: 'Product is required' });
      return;
    }

    const rawId = product.id || req.body.productId;
    const slug = product.slug;

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

    const productId = dbProd.id;
    const title = dbProd.title;
    const price = Number(dbProd.price);
    const image = (dbProd.images && dbProd.images[0]) || '';
    const category = dbProd.category?.name || 'Phantom';

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      });
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
          productSlug: dbProd.slug,
          productTitle: title,
          productPrice: price,
          productImage: image,
          category
        }
      });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, inWishlist: !existing, wishlist: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to toggle wishlist' });
  }
};

// DELETE /api/wishlist/:productId - Remove from wishlist
export const removeWishlistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const productId = String(req.params.productId);
    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        OR: [{ productId }, { id: productId }]
      }
    });

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, wishlist: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to remove from wishlist' });
  }
};

// DELETE /api/wishlist - Clear wishlist
export const clearWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await prisma.wishlistItem.deleteMany({
      where: { userId }
    });

    res.json({ success: true, message: 'Wishlist cleared', wishlist: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to clear wishlist' });
  }
};
