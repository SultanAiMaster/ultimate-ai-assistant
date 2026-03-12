import express, { Router, Request, Response, NextFunction } from 'express';
import { Skill } from '../../models/Skill';
import { z } from 'zod';

const router = Router();

// Query params schema
const ListSkillsQuerySchema = z.object({
  category: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
  search: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

/**
 * GET /api/v1/skills - List skills with filters
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = ListSkillsQuerySchema.parse(req.query);

    // Build filter
    const filter: any = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (query.riskLevel) {
      filter.riskLevel = query.riskLevel;
    }

    if (query.tags && query.tags.length > 0) {
      filter.tags = { $in: query.tags };
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Get skills with pagination
    const skills = await Skill.find(filter)
      .sort({ name: 1 })
      .skip(query.offset)
      .limit(Math.min(query.limit, 100))
      .lean();

    // Get total count
    const total = await Skill.countDocuments(filter);

    res.json({
      success: true,
      data: {
        skills,
        pagination: {
          total,
          limit: Math.min(query.limit, 100),
          offset: query.offset,
          hasMore: query.offset + skills.length < total
        }
      },
      query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/skills/categories - Get all categories
 */
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Skill.distinct('category').sort();
    const counts = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        all: categories,
        withCounts: counts
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/skills/risk-levels - Get all risk levels
 */
router.get('/risk-levels', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const counts = await Skill.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: counts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/skills/tags - Get popular tags
 */
router.get('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const tags = await Skill.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit }
    ]);

    res.json({
      success: true,
      data: tags,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/skills/:id - Get skill by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skill = await Skill.findOne({ id: req.params.id }).lean();

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SKILL_NOT_FOUND',
          message: `Skill with ID '${req.params.id}' not found`
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: skill,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/skills/stats/metadata
 */
router.get('/stats/metadata', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await Skill.countDocuments();
    const categories = await Skill.distinct('category');
    const riskLevels = await Skill.distinct('riskLevel');
    const totalTags = await Skill.distinct('tags');

    res.json({
      success: true,
      data: {
        totalSkills: total,
        totalCategories: categories.length,
        totalRiskLevels: riskLevels.length,
        totalTags: totalTags.length,
        categories,
        riskLevels
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
