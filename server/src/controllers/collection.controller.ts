import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { createCollectionSchema } from '../validators/product.validator';

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch collections' });
  }
};

export const getCollectionBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!collection) {
      res.status(404).json({ success: false, message: 'Collection not found' });
      return;
    }

    // Flatten products array
    const formatted = {
      ...collection,
      products: collection.products.map((p) => p.product)
    };

    res.json({ success: true, collection: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch collection' });
  }
};

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createCollectionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { name, description, coverImage } = parsed.data;
    const slug = slugify(name);

    const existing = await prisma.collection.findFirst({
      where: { OR: [{ name }, { slug }] }
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'Collection already exists' });
      return;
    }

    const collection = await prisma.collection.create({
      data: { name, slug, description, coverImage }
    });

    res.status(201).json({ success: true, message: 'Collection created', collection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create collection' });
  }
};