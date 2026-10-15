import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { createCategorySchema } from '../validators/product.validator';

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { name, description } = parsed.data;
    const slug = slugify(name);

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] }
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'Category already exists' });
      return;
    }

    const category = await prisma.category.create({
      data: { name, slug, description }
    });

    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};