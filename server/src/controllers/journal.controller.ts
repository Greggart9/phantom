import { Request, Response } from 'express';
import { prisma } from '../prisma';
import {
  createJournalSchema,
  updateJournalSchema
} from '../validators/journal.validator';

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

// GET /api/journal (Public - List journal articles with pagination)
export const getJournalPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 9));
    const skip = (page - 1) * limit;

    const where = { isPublished: true };

    const [total, posts] = await Promise.all([
      prisma.journalPost.count({ where }),
      prisma.journalPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      posts,
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
    console.error('getJournalPosts Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch journal posts' });
  }
};

// GET /api/journal/:slug (Public - Read a single article)
export const getJournalPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

    const post = await prisma.journalPost.findUnique({
      where: { slug }
    });

    if (!post) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch article' });
  }
};

// POST /api/journal (Admin Only - Publish new article)
export const createJournalPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createJournalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { title, content, excerpt, coverImage, isPublished } = parsed.data;

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
        content,
        excerpt,
        coverImage,
        isPublished: isPublished ?? true,
        publishedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Article published successfully',
      post
    });
  } catch (error) {
    console.error('createJournalPost Error:', error);
    res.status(500).json({ success: false, message: 'Failed to publish article' });
  }
};

// PUT /api/journal/:id (Admin Only - Edit article)
export const updateJournalPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const parsed = updateJournalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const data = parsed.data;

    let slugUpdate: any = {};
    if (data.title) {
      const baseSlug = slugify(data.title);
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.journalPost.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      slugUpdate.slug = slug;
    }

    const post = await prisma.journalPost.update({
      where: { id },
      data: {
        ...data,
        ...slugUpdate
      }
    });

    res.json({
      success: true,
      message: 'Article updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update article' });
  }
};

// DELETE /api/journal/:id (Admin Only - Delete article)
export const deleteJournalPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.journalPost.delete({ where: { id } });
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete article' });
  }
};
