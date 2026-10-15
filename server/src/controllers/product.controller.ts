import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema
} from '../validators/product.validator';

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

// GET /api/products (Public with Search, Category filter, Pagination)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const { search, category, collection, sort, badge } = req.query;

    // Build Prisma query filter with safe AND array to avoid OR collisions
    const conditions: any[] = [{ isPublished: true }];

    if (search && typeof search === 'string' && search.trim()) {
      conditions.push({
        OR: [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } }
        ]
      });
    }

    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      const catVal = category.trim();
      conditions.push({
        OR: [
          { category: { slug: { equals: catVal, mode: 'insensitive' } } },
          { category: { name: { equals: catVal, mode: 'insensitive' } } },
          {
            collections: {
              some: {
                collection: {
                  OR: [
                    { slug: { equals: catVal, mode: 'insensitive' } },
                    { name: { equals: catVal, mode: 'insensitive' } }
                  ]
                }
              }
            }
          }
        ]
      });
    }

    if (collection && typeof collection === 'string' && collection.toLowerCase() !== 'all') {
      const colVal = collection.trim();
      conditions.push({
        collections: {
          some: {
            collection: {
              OR: [
                { slug: { equals: colVal, mode: 'insensitive' } },
                { name: { equals: colVal, mode: 'insensitive' } }
              ]
            }
          }
        }
      });
    }

    if (badge && typeof badge === 'string' && badge.toLowerCase() !== 'all') {
      if (badge.toUpperCase() === 'LIMITED') {
        conditions.push({
          OR: [
            { badge: { equals: 'LIMITED', mode: 'insensitive' } },
            { AND: [{ stockQuantity: { gt: 0, lt: 10 } }, { badge: null }] }
          ]
        });
      } else if (badge.toUpperCase() === 'SOLD OUT') {
        conditions.push({
          OR: [
            { badge: { equals: 'SOLD OUT', mode: 'insensitive' } },
            { stockQuantity: { lte: 0 } }
          ]
        });
      } else {
        conditions.push({ badge: { equals: badge, mode: 'insensitive' } });
      }
    }

    const where: any = conditions.length === 1 ? conditions[0] : { AND: conditions };

    // Sort options
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'bestsellers') orderBy = { orderItems: { _count: 'desc' } };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          collections: {
            include: { collection: { select: { id: true, name: true, slug: true } } }
          }
        }
      })
    ]);

    // Format products with explicit stock indicators and dynamic attributes
    const formatted = products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      badge: p.badge,
      stockQuantity: p.stockQuantity,
      isSoldOut: p.stockQuantity <= 0,
      isPublished: p.isPublished,
      images: p.images,
      colors: p.colors,
      sizes: p.sizes,
      materials: p.materials,
      care: p.care,
      shippingInfo: p.shippingInfo,
      storyParagraphs: p.storyParagraphs,
      specifications: p.specifications,
      category: p.category,
      collections: p.collections.map((c) => c.collection),
      createdAt: p.createdAt
    }));

    res.json({
      success: true,
      products: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('getProducts Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// GET /api/products/:slug (Public - Single Product Details)
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ]
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collections: {
          include: { collection: { select: { id: true, name: true, slug: true } } }
        }
      }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({
      success: true,
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        badge: product.badge,
        stockQuantity: product.stockQuantity,
        isSoldOut: product.stockQuantity <= 0,
        isPublished: product.isPublished,
        images: product.images,
        colors: product.colors,
        sizes: product.sizes,
        materials: product.materials,
        care: product.care,
        shippingInfo: product.shippingInfo,
        storyParagraphs: product.storyParagraphs,
        specifications: product.specifications,
        category: product.category,
        collections: product.collections.map((c) => c.collection),
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// POST /api/products (Admin Only - Create Product)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { collectionIds, ...data } = parsed.data;

    let baseSlug = slugify(data.title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const productData: any = {
      ...data,
      ...(data.colors !== undefined && {
        colors: data.colors === null ? Prisma.JsonNull : data.colors
      }),
      ...(data.specifications !== undefined && {
        specifications: data.specifications === null ? Prisma.JsonNull : data.specifications
      })
    };

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        collections: {
          create: collectionIds?.map((id) => ({
            collection: { connect: { id } }
          }))
        }
      },
      include: {
        category: true,
        collections: { include: { collection: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error: any) {
    console.error('createProduct Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// PUT /api/products/:id (Admin Only - Edit Product)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { collectionIds, ...data } = parsed.data;

    // If title changed, update slug
    let slugUpdate: any = {};
    if (data.title) {
      const baseSlug = slugify(data.title);
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.product.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      slugUpdate.slug = slug;
    }

    // Handle collection relations update if provided
    if (collectionIds !== undefined) {
      await prisma.productCollection.deleteMany({ where: { productId: id } });
    }

    const updateData: any = {
      ...data,
      ...slugUpdate,
      ...(data.colors !== undefined && {
        colors: data.colors === null ? Prisma.JsonNull : data.colors
      }),
      ...(data.specifications !== undefined && {
        specifications: data.specifications === null ? Prisma.JsonNull : data.specifications
      }),
      ...(collectionIds !== undefined && {
        collections: {
          create: collectionIds.map((colId) => ({
            collection: { connect: { id: colId } }
          }))
        }
      })
    };

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        collections: { include: { collection: true } }
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// PATCH /api/products/:id/stock (Admin Only - Quick Stock Update)
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const parsed = updateStockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stockQuantity: parsed.data.stockQuantity },
      select: { id: true, title: true, stockQuantity: true }
    });

    res.json({
      success: true,
      message: `Stock updated to ${product.stockQuantity}`,
      product: {
        ...product,
        isSoldOut: product.stockQuantity <= 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
};

// DELETE /api/products/:id (Admin Only - Delete Product)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Use transaction to clean up related cart, wishlist, review, collection and order items
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.productCollection.deleteMany({ where: { productId: id } }),
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } })
    ]);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};