import { Request, Response } from 'express';
import { prisma } from '../prisma';

// GET /api/reviews/recent (Public: Top 3 most recent testimonials for Landing Page)
export const getRecentReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string) || 3));

    const reviews = await prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            country: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials'
    });
  }
};

// GET /api/reviews/product/:productId (Public: Reviews for a product detail page)
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.productId as string;

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            country: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// POST /api/reviews (Protected: Requires Authenticated Customer)
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'You must be logged in to leave a review'
      });
      return;
    }

    const { content, rating, productId } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Review content cannot be empty'
      });
      return;
    }

    const parsedRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

    // Verify user profile (fullName & country are automatically pulled from user profile)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User account not found'
      });
      return;
    }

    const newReview = await prisma.review.create({
      data: {
        content: content.trim(),
        rating: parsedRating,
        userId: user.id,
        productId: productId || null
      },
      include: {
        user: {
          select: {
            fullName: true,
            country: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully',
      data: {
        review: newReview
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
};
