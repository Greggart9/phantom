import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { OrderStatus } from '@prisma/client';

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

/**
 * GET /api/admin/overview
 * High-level business analytics, catalog health, low-stock alerts, and recent activities.
 */
export const getAdminOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalProducts,
      soldOutProducts,
      lowStockProducts,
      totalOrders,
      ordersByStatus,
      paidOrders,
      recentOrders,
      recentReviews,
      totalUsers
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: { lte: 0 } } }),
      prisma.product.count({ where: { stockQuantity: { gt: 0, lt: 5 } } }),
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.order.findMany({
        where: { status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } },
        select: { totalAmount: true }
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          orderItems: {
            take: 2,
            include: { product: { select: { title: true, images: true } } }
          }
        }
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true } },
          product: { select: { title: true, slug: true } }
        }
      }),
      prisma.user.count()
    ]);

    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    const statusCounts: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };

    ordersByStatus.forEach((item) => {
      statusCounts[item.status] = item._count._all;
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        soldOutProducts,
        lowStockProducts,
        totalUsers,
        ordersByStatus: statusCounts
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user.fullName,
        customerEmail: o.user.email,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        itemCount: o.orderItems.length,
        itemsPreview: o.orderItems.map((item) => item.product?.title).filter(Boolean),
        createdAt: o.createdAt
      })),
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        author: r.user.fullName,
        email: r.user.email,
        productTitle: r.product?.title || 'Unknown Product',
        productSlug: r.product?.slug || '',
        rating: r.rating,
        content: r.content,
        isApproved: r.isApproved,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('getAdminOverview Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load admin overview metrics' });
  }
};

/**
 * GET /api/admin/orders
 * Comprehensive order log with filtering.
 */
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as OrderStatus;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true, country: true } },
        orderItems: {
          include: {
            product: { select: { id: true, title: true, slug: true, images: true } }
          }
        }
      }
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      user: o.user,
      totalAmount: Number(o.totalAmount),
      status: o.status,
      paymentIntentId: o.paymentIntentId,
      trackingNumber: o.trackingNumber,
      carrier: o.carrier,
      shippingAddress: o.shippingAddress,
      orderItems: o.orderItems.map((i) => ({
        id: i.id,
        product: i.product,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice)
      })),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt
    }));

    res.json({ success: true, orders: formatted });
  } catch (error) {
    console.error('getAdminOrders Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
};

/**
 * PUT /api/admin/orders/:id/status
 * Update fulfillment stage and assign DHL tracking number.
 */
export const updateAdminOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, trackingNumber, carrier } = req.body;

    const data: any = {};
    if (status) data.status = status as OrderStatus;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber?.trim() || null;
    if (carrier !== undefined) data.carrier = carrier?.trim() || 'DHL Express';

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: { select: { fullName: true, email: true } }
      }
    });

    res.json({
      success: true,
      message: `Order #${updated.orderNumber} status updated to ${updated.status}`,
      order: {
        id: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        trackingNumber: updated.trackingNumber,
        carrier: updated.carrier
      }
    });
  } catch (error) {
    console.error('updateAdminOrderStatus Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

/**
 * GET /api/admin/reviews
 * Full moderation list.
 */
export const getAdminReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, title: true, slug: true, images: true } }
      }
    });

    res.json({
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        isApproved: r.isApproved,
        author: r.user.fullName,
        email: r.user.email,
        product: r.product,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('getAdminReviews Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load reviews' });
  }
};

/**
 * PATCH /api/admin/reviews/:id/approval
 * Toggle or set approval state.
 */
export const toggleReviewApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isApproved } = req.body;

    const current = await prisma.review.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: isApproved !== undefined ? Boolean(isApproved) : !current.isApproved }
    });

    res.json({
      success: true,
      message: updated.isApproved ? 'Review approved for publication' : 'Review unapproved',
      review: updated
    });
  } catch (error) {
    console.error('toggleReviewApproval Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review approval' });
  }
};

/**
 * DELETE /api/admin/reviews/:id
 * Remove inappropriate or spam review.
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('deleteReview Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};

/**
 * GET /api/admin/journal
 * List all journal articles.
 */
export const getAdminJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.journalPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, posts });
  } catch (error) {
    console.error('getAdminJournal Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load journal posts' });
  }
};

/**
 * POST /api/admin/journal
 * Create chronicle story.
 */
export const createAdminJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, excerpt, content, coverImage, author, readTime, category, isPublished } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.journalPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const post = await prisma.journalPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        author: author || 'Phantom',
        readTime: readTime || '5 min read',
        category: category || 'EXHIBITION',
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true
      }
    });

    res.status(201).json({ success: true, message: 'Chronicle created successfully', post });
  } catch (error) {
    console.error('createAdminJournal Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create journal post' });
  }
};

/**
 * PUT /api/admin/journal/:id
 * Update chronicle story.
 */
export const updateAdminJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, excerpt, content, coverImage, author, readTime, category, isPublished } = req.body;

    const current = await prisma.journalPost.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ success: false, message: 'Journal post not found' });
      return;
    }

    let slug = current.slug;
    if (title && title !== current.title) {
      const baseSlug = slugify(title);
      slug = baseSlug;
      let counter = 1;
      while (await prisma.journalPost.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    const post = await prisma.journalPost.update({
      where: { id },
      data: {
        ...(title && { title }),
        slug,
        ...(excerpt !== undefined && { excerpt: excerpt || null }),
        ...(content && { content }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(author !== undefined && { author }),
        ...(readTime !== undefined && { readTime }),
        ...(category !== undefined && { category }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) })
      }
    });

    res.json({ success: true, message: 'Chronicle updated successfully', post });
  } catch (error) {
    console.error('updateAdminJournal Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update journal post' });
  }
};

/**
 * DELETE /api/admin/journal/:id
 */
export const deleteAdminJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.journalPost.delete({ where: { id } });
    res.json({ success: true, message: 'Journal post deleted' });
  } catch (error) {
    console.error('deleteAdminJournal Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete journal post' });
  }
};

/**
 * Categories CRUD
 */
export const getAdminCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });
    res.json({
      success: true,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        productCount: c._count.products,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error('getAdminCategories Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
};

export const createAdminCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const slug = slugify(name);
    const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing) {
      res.status(409).json({ success: false, message: 'A category with this name or slug already exists' });
      return;
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug, description: description?.trim() || null }
    });

    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    console.error('createAdminCategory Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateAdminCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const data: any = {};
    if (name) {
      data.name = name.trim();
      data.slug = slugify(name);
    }
    if (description !== undefined) {
      data.description = description?.trim() || null;
    }

    const category = await prisma.category.update({
      where: { id },
      data
    });

    res.json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    console.error('updateAdminCategory Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteAdminCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category: it is assigned to ${count} product(s). Please reassign them first.`
      });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('deleteAdminCategory Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

/**
 * Collections CRUD
 */
export const getAdminCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { name: 'asc' },
      include: {
        products: {
          include: {
            product: { select: { id: true, title: true, slug: true, images: true, price: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      collections: collections.map((col) => ({
        id: col.id,
        name: col.name,
        slug: col.slug,
        description: col.description,
        coverImage: col.coverImage,
        productCount: col.products.length,
        products: col.products.map((p) => p.product),
        createdAt: col.createdAt
      }))
    });
  } catch (error) {
    console.error('getAdminCollections Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load collections' });
  }
};

export const createAdminCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, coverImage, productIds } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ success: false, message: 'Collection name is required' });
      return;
    }

    const slug = slugify(name);
    const existing = await prisma.collection.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing) {
      res.status(409).json({ success: false, message: 'A collection with this name or slug already exists' });
      return;
    }

    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        coverImage: coverImage?.trim() || null,
        products: {
          create: (productIds || []).map((pId: string) => ({
            product: { connect: { id: pId } }
          }))
        }
      },
      include: {
        products: { include: { product: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Collection created successfully', collection });
  } catch (error) {
    console.error('createAdminCollection Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create collection' });
  }
};

export const updateAdminCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, description, coverImage, productIds } = req.body;

    const data: any = {};
    if (name) {
      data.name = name.trim();
      data.slug = slugify(name);
    }
    if (description !== undefined) data.description = description?.trim() || null;
    if (coverImage !== undefined) data.coverImage = coverImage?.trim() || null;

    if (productIds !== undefined) {
      await prisma.productCollection.deleteMany({ where: { collectionId: id } });
      data.products = {
        create: productIds.map((pId: string) => ({
          product: { connect: { id: pId } }
        }))
      };
    }

    const collection = await prisma.collection.update({
      where: { id },
      data,
      include: {
        products: { include: { product: true } }
      }
    });

    res.json({ success: true, message: 'Collection updated successfully', collection });
  } catch (error) {
    console.error('updateAdminCollection Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update collection' });
  }
};

export const deleteAdminCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.collection.delete({ where: { id } });
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('deleteAdminCollection Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete collection' });
  }
};
