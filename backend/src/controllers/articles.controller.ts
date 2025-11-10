import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';

/**
 * POST /api/articles
 * Create a new article
 */
export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { title, content, excerpt, featuredImageUrl, tags, relatedRaces, status } = req.body;

  // Validate input
  if (!title || !content) {
    throw new AppError('Title and content are required', 400);
  }

  // Get ambassador profile
  const ambassador = await db('ambassadors')
    .where('user_id', req.user.userId)
    .where('status', 'active')
    .first();

  if (!ambassador) {
    throw new AppError('Active ambassador profile required', 403);
  }

  // Generate slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Ensure slug is unique
  let slug = baseSlug;
  let counter = 1;
  while (await db('articles').where('slug', slug).first()) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create article
  const articleData: any = {
    ambassador_id: ambassador.id,
    title,
    slug,
    content,
    excerpt: excerpt || content.substring(0, 200),
    featured_image_url: featuredImageUrl,
    status: status || 'draft',
  };

  // Set published_at if status is published
  if (articleData.status === 'published') {
    articleData.published_at = new Date();
  }

  const [article] = await db('articles')
    .insert(articleData)
    .returning('*');

  // Add tags if provided
  if (tags && Array.isArray(tags) && tags.length > 0) {
    const tagData = tags.map((tag: string) => ({
      article_id: article.id,
      tag: tag.toLowerCase(),
    }));
    await db('article_tags').insert(tagData);
  }

  // Add related races if provided
  if (relatedRaces && Array.isArray(relatedRaces) && relatedRaces.length > 0) {
    const raceData = relatedRaces.map((raceId: string) => ({
      article_id: article.id,
      race_id: raceId,
    }));
    await db('article_related_races').insert(raceData);
  }

  res.status(201).json({
    status: 'success',
    data: {
      article,
    },
  });
});

/**
 * GET /api/articles/:id
 * Get article by ID
 */
export const getArticleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const article = await db('articles')
    .select(
      'articles.*',
      'ambassadors.name as ambassador_name',
      'ambassadors.slug as ambassador_slug',
      'ambassadors.profile_image_url as ambassador_image'
    )
    .leftJoin('ambassadors', 'articles.ambassador_id', 'ambassadors.id')
    .where('articles.id', id)
    .first();

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Check if user can view this article
  if (article.status !== 'published') {
    if (!req.user) {
      throw new AppError('Article not found', 404);
    }

    // Only allow viewing unpublished articles if user is the author or admin
    const ambassador = await db('ambassadors')
      .where('user_id', req.user.userId)
      .first();

    if (article.ambassador_id !== ambassador?.id && req.user.role !== 'admin') {
      throw new AppError('Article not found', 404);
    }
  }

  // Get tags
  const tags = await db('article_tags')
    .select('tag')
    .where('article_id', id);

  // Get related races
  const relatedRaces = await db('article_related_races')
    .select('races.*')
    .leftJoin('races', 'article_related_races.race_id', 'races.id')
    .where('article_related_races.article_id', id);

  // Increment view count if article is published
  if (article.status === 'published') {
    await db('articles')
      .where('id', id)
      .increment('views', 1);
  }

  res.json({
    status: 'success',
    data: {
      article: {
        ...article,
        tags: tags.map((t) => t.tag),
        relatedRaces,
      },
    },
  });
});

/**
 * PUT /api/articles/:id
 * Update article
 */
export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const { title, content, excerpt, featuredImageUrl, tags, relatedRaces, status } = req.body;

  // Get article
  const article = await db('articles')
    .where('id', id)
    .first();

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Check if user owns this article or is admin
  const ambassador = await db('ambassadors')
    .where('user_id', req.user.userId)
    .first();

  if (article.ambassador_id !== ambassador?.id && req.user.role !== 'admin') {
    throw new AppError('Insufficient permissions', 403);
  }

  // Prepare update data
  const updateData: any = {
    updated_at: new Date(),
  };

  if (title) {
    updateData.title = title;
    
    // Regenerate slug if title changed
    if (title !== article.title) {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      let slug = baseSlug;
      let counter = 1;
      while (await db('articles').where('slug', slug).whereNot('id', id).first()) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }
  }

  if (content) updateData.content = content;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (featuredImageUrl !== undefined) updateData.featured_image_url = featuredImageUrl;
  
  if (status) {
    updateData.status = status;
    
    // Set published_at when publishing for the first time
    if (status === 'published' && !article.published_at) {
      updateData.published_at = new Date();
    }
  }

  // Update article
  const [updatedArticle] = await db('articles')
    .where('id', id)
    .update(updateData)
    .returning('*');

  // Update tags if provided
  if (tags && Array.isArray(tags)) {
    await db('article_tags').where('article_id', id).delete();
    
    if (tags.length > 0) {
      const tagData = tags.map((tag: string) => ({
        article_id: id,
        tag: tag.toLowerCase(),
      }));
      await db('article_tags').insert(tagData);
    }
  }

  // Update related races if provided
  if (relatedRaces && Array.isArray(relatedRaces)) {
    await db('article_related_races').where('article_id', id).delete();
    
    if (relatedRaces.length > 0) {
      const raceData = relatedRaces.map((raceId: string) => ({
        article_id: id,
        race_id: raceId,
      }));
      await db('article_related_races').insert(raceData);
    }
  }

  res.json({
    status: 'success',
    data: {
      article: updatedArticle,
    },
  });
});

/**
 * DELETE /api/articles/:id
 * Delete article
 */
export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  // Get article
  const article = await db('articles')
    .where('id', id)
    .first();

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Check if user owns this article or is admin
  const ambassador = await db('ambassadors')
    .where('user_id', req.user.userId)
    .first();

  if (article.ambassador_id !== ambassador?.id && req.user.role !== 'admin') {
    throw new AppError('Insufficient permissions', 403);
  }

  // Delete article (cascade will handle related records)
  await db('articles')
    .where('id', id)
    .delete();

  res.json({
    status: 'success',
    message: 'Article deleted successfully',
  });
});

/**
 * GET /api/articles
 * Get all articles with filters
 */
export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const { status, ambassadorId, tag, limit = '20', offset = '0' } = req.query;

  let query = db('articles')
    .select(
      'articles.*',
      'ambassadors.name as ambassador_name',
      'ambassadors.slug as ambassador_slug',
      'ambassadors.profile_image_url as ambassador_image'
    )
    .leftJoin('ambassadors', 'articles.ambassador_id', 'ambassadors.id');

  // Filter by status
  if (status) {
    query = query.where('articles.status', status as string);
  } else {
    // Default to published articles for public
    query = query.where('articles.status', 'published');
  }

  // Filter by ambassador
  if (ambassadorId) {
    query = query.where('articles.ambassador_id', ambassadorId as string);
  }

  // Filter by tag
  if (tag) {
    const articleIds = await db('article_tags')
      .select('article_id')
      .where('tag', (tag as string).toLowerCase());
    
    const ids = articleIds.map((row) => row.article_id);
    if (ids.length > 0) {
      query = query.whereIn('articles.id', ids);
    } else {
      // No articles with this tag
      return res.json({
        status: 'success',
        data: {
          articles: [],
          count: 0,
        },
      });
    }
  }

  // Get total count
  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('* as count');

  // Apply pagination
  query = query
    .orderBy('articles.published_at', 'desc')
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  const articles = await query;

  // Get tags for each article
  const articleIds = articles.map((a) => a.id);
  const tags = await db('article_tags')
    .select('article_id', 'tag')
    .whereIn('article_id', articleIds);

  const articlesWithTags = articles.map((article) => ({
    ...article,
    tags: tags.filter((t) => t.article_id === article.id).map((t) => t.tag),
  }));

  return res.json({
    status: 'success',
    data: {
      articles: articlesWithTags,
      count: parseInt(count as string),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    },
  });
});

/**
 * GET /api/articles/ambassador/:ambassadorId
 * Get articles by ambassador
 */
export const getArticlesByAmbassador = asyncHandler(async (req: Request, res: Response) => {
  const { ambassadorId } = req.params;
  const { limit = '20', offset = '0' } = req.query;

  // Check if ambassador exists
  const ambassador = await db('ambassadors')
    .where('id', ambassadorId)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  let query = db('articles')
    .select('articles.*')
    .where('articles.ambassador_id', ambassadorId);

  // Only show published articles unless user is the ambassador or admin
  if (req.user) {
    const userAmbassador = await db('ambassadors')
      .where('user_id', req.user.userId)
      .first();

    if (userAmbassador?.id !== ambassadorId && req.user.role !== 'admin') {
      query = query.where('articles.status', 'published');
    }
  } else {
    query = query.where('articles.status', 'published');
  }

  // Get total count
  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('* as count');

  // Apply pagination
  query = query
    .orderBy('articles.published_at', 'desc')
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  const articles = await query;

  // Get tags for each article
  const articleIds = articles.map((a) => a.id);
  const tags = await db('article_tags')
    .select('article_id', 'tag')
    .whereIn('article_id', articleIds);

  const articlesWithTags = articles.map((article) => ({
    ...article,
    tags: tags.filter((t) => t.article_id === article.id).map((t) => t.tag),
  }));

  res.json({
    status: 'success',
    data: {
      articles: articlesWithTags,
      ambassador,
      count: parseInt(count as string),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    },
  });
});

/**
 * GET /api/articles/admin/pending
 * Get all pending articles for moderation (admin only)
 */
export const getPendingArticles = asyncHandler(async (_req: Request, res: Response) => {
  const articles = await db('articles')
    .select(
      'articles.*',
      'ambassadors.name as ambassador_name',
      'ambassadors.slug as ambassador_slug',
      'users.email as ambassador_email'
    )
    .leftJoin('ambassadors', 'articles.ambassador_id', 'ambassadors.id')
    .leftJoin('users', 'ambassadors.user_id', 'users.id')
    .where('articles.status', 'pending')
    .orderBy('articles.created_at', 'asc');

  // Get tags for each article
  const articleIds = articles.map((a) => a.id);
  const tags = await db('article_tags')
    .select('article_id', 'tag')
    .whereIn('article_id', articleIds);

  const articlesWithTags = articles.map((article) => ({
    ...article,
    tags: tags.filter((t) => t.article_id === article.id).map((t) => t.tag),
  }));

  res.json({
    status: 'success',
    data: {
      articles: articlesWithTags,
      count: articlesWithTags.length,
    },
  });
});

/**
 * PUT /api/articles/:id/publish
 * Publish an article (admin only)
 */
export const publishArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { scheduledAt } = req.body;

  const article = await db('articles')
    .where('id', id)
    .first();

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  const updateData: any = {
    status: 'published',
    updated_at: new Date(),
  };

  // Set published_at if not already set
  if (!article.published_at) {
    updateData.published_at = scheduledAt ? new Date(scheduledAt) : new Date();
  }

  const [updatedArticle] = await db('articles')
    .where('id', id)
    .update(updateData)
    .returning('*');

  res.json({
    status: 'success',
    data: {
      article: updatedArticle,
    },
  });
});

/**
 * PUT /api/articles/:id/reject
 * Reject an article (admin only)
 */
export const rejectArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const article = await db('articles')
    .where('id', id)
    .first();

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Set status back to draft
  const [updatedArticle] = await db('articles')
    .where('id', id)
    .update({
      status: 'draft',
      updated_at: new Date(),
    })
    .returning('*');

  // TODO: Send notification to ambassador with rejection reason

  res.json({
    status: 'success',
    data: {
      article: updatedArticle,
    },
    message: reason || 'Article rejected',
  });
});

/**
 * GET /api/articles/admin/analytics
 * Get content analytics (admin only)
 */
export const getContentAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  // Get article statistics by status
  const statusStats = await db('articles')
    .select(
      'status',
      db.raw('COUNT(*) as count'),
      db.raw('SUM(views) as total_views'),
      db.raw('SUM(clicks) as total_clicks')
    )
    .groupBy('status');

  // Get top performing articles
  const topArticles = await db('articles')
    .select(
      'articles.id',
      'articles.title',
      'articles.views',
      'articles.clicks',
      'articles.published_at',
      'ambassadors.name as ambassador_name'
    )
    .leftJoin('ambassadors', 'articles.ambassador_id', 'ambassadors.id')
    .where('articles.status', 'published')
    .orderBy('articles.views', 'desc')
    .limit(10);

  // Get ambassador performance
  const ambassadorPerformance = await db('articles')
    .select(
      'ambassadors.id',
      'ambassadors.name',
      db.raw('COUNT(articles.id) as article_count'),
      db.raw('SUM(articles.views) as total_views'),
      db.raw('SUM(articles.clicks) as total_clicks'),
      db.raw('AVG(articles.views) as avg_views')
    )
    .leftJoin('ambassadors', 'articles.ambassador_id', 'ambassadors.id')
    .where('articles.status', 'published')
    .groupBy('ambassadors.id', 'ambassadors.name')
    .orderBy('total_views', 'desc')
    .limit(10);

  // Get recent activity
  const recentActivity = await db('articles')
    .select(
      'articles.id',
      'articles.title',
      'articles.status',
      'articles.created_at',
      'articles.published_at',
      'ambassadors.name as ambassador_name'
    )
    .leftJoin('ambassadors', 'articles.ambassador_id', 'ambassadors.id')
    .orderBy('articles.created_at', 'desc')
    .limit(20);

  // Get tag usage
  const tagStats = await db('article_tags')
    .select(
      'tag',
      db.raw('COUNT(*) as usage_count')
    )
    .groupBy('tag')
    .orderBy('usage_count', 'desc')
    .limit(20);

  res.json({
    status: 'success',
    data: {
      statusStats: statusStats.map((stat) => ({
        status: stat.status,
        count: parseInt(stat.count),
        totalViews: parseInt(stat.total_views) || 0,
        totalClicks: parseInt(stat.total_clicks) || 0,
      })),
      topArticles: topArticles.map((article) => ({
        ...article,
        views: parseInt(article.views) || 0,
        clicks: parseInt(article.clicks) || 0,
      })),
      ambassadorPerformance: ambassadorPerformance.map((amb) => ({
        id: amb.id,
        name: amb.name,
        articleCount: parseInt(amb.article_count),
        totalViews: parseInt(amb.total_views) || 0,
        totalClicks: parseInt(amb.total_clicks) || 0,
        avgViews: Math.round(parseFloat(amb.avg_views) || 0),
      })),
      recentActivity,
      tagStats: tagStats.map((tag) => ({
        tag: tag.tag,
        usageCount: parseInt(tag.usage_count),
      })),
    },
  });
});

/**
 * PUT /api/articles/:id/archive
 * Archive an article (admin or author)
 */
export const archiveArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  const article = await db('articles')
    .where('id', id)
    .first();

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Check if user owns this article or is admin
  const ambassador = await db('ambassadors')
    .where('user_id', req.user.userId)
    .first();

  if (article.ambassador_id !== ambassador?.id && req.user.role !== 'admin') {
    throw new AppError('Insufficient permissions', 403);
  }

  const [updatedArticle] = await db('articles')
    .where('id', id)
    .update({
      status: 'archived',
      updated_at: new Date(),
    })
    .returning('*');

  res.json({
    status: 'success',
    data: {
      article: updatedArticle,
    },
  });
});
