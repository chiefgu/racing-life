import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';

/**
 * POST /api/ambassadors/apply
 * Apply to become an ambassador
 */
export const applyAsAmbassador = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { name, bio, socialLinks } = req.body;

  // Validate input
  if (!name || !bio) {
    throw new AppError('Name and bio are required', 400);
  }

  // Check if user already has an ambassador profile
  const existingAmbassador = await db('ambassadors')
    .where('user_id', req.user.userId)
    .first();

  if (existingAmbassador) {
    throw new AppError('Ambassador application already exists', 409);
  }

  // Generate slug from name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Ensure slug is unique
  let slug = baseSlug;
  let counter = 1;
  while (await db('ambassadors').where('slug', slug).first()) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create ambassador profile
  const [ambassador] = await db('ambassadors')
    .insert({
      user_id: req.user.userId,
      name,
      slug,
      bio,
      commission_rate: 0.00,
      status: 'pending',
    })
    .returning('*');

  // Add social links if provided
  if (socialLinks && Array.isArray(socialLinks)) {
    const socialLinksData = socialLinks.map((link: any) => ({
      ambassador_id: ambassador.id,
      platform: link.platform,
      url: link.url,
    }));

    if (socialLinksData.length > 0) {
      await db('ambassador_social_links').insert(socialLinksData);
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      ambassador: {
        id: ambassador.id,
        name: ambassador.name,
        slug: ambassador.slug,
        bio: ambassador.bio,
        status: ambassador.status,
        created_at: ambassador.created_at,
      },
    },
  });
});

/**
 * GET /api/ambassadors/pending
 * Get all pending ambassador applications (admin only)
 */
export const getPendingApplications = asyncHandler(async (_req: Request, res: Response) => {
  const ambassadors = await db('ambassadors')
    .select(
      'ambassadors.*',
      'users.email',
      'users.name as user_name'
    )
    .leftJoin('users', 'ambassadors.user_id', 'users.id')
    .where('ambassadors.status', 'pending')
    .orderBy('ambassadors.created_at', 'desc');

  // Get social links for each ambassador
  const ambassadorIds = ambassadors.map((a) => a.id);
  const socialLinks = await db('ambassador_social_links')
    .whereIn('ambassador_id', ambassadorIds);

  const ambassadorsWithLinks = ambassadors.map((ambassador) => ({
    ...ambassador,
    socialLinks: socialLinks.filter((link) => link.ambassador_id === ambassador.id),
  }));

  res.json({
    status: 'success',
    data: {
      ambassadors: ambassadorsWithLinks,
      count: ambassadorsWithLinks.length,
    },
  });
});

/**
 * PUT /api/ambassadors/:id/approve
 * Approve an ambassador application (admin only)
 */
export const approveAmbassador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { commissionRate } = req.body;

  // Validate commission rate
  if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
    throw new AppError('Commission rate must be between 0 and 100', 400);
  }

  // Get ambassador
  const ambassador = await db('ambassadors')
    .where('id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  if (ambassador.status !== 'pending') {
    throw new AppError('Ambassador application is not pending', 400);
  }

  // Update ambassador status and commission rate
  const [updatedAmbassador] = await db('ambassadors')
    .where('id', id)
    .update({
      status: 'active',
      commission_rate: commissionRate || 10.00,
      updated_at: new Date(),
    })
    .returning('*');

  // Update user role to ambassador
  await db('users')
    .where('id', ambassador.user_id)
    .update({
      role: 'ambassador',
      updated_at: new Date(),
    });

  res.json({
    status: 'success',
    data: {
      ambassador: updatedAmbassador,
    },
  });
});

/**
 * PUT /api/ambassadors/:id/reject
 * Reject an ambassador application (admin only)
 */
export const rejectAmbassador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get ambassador
  const ambassador = await db('ambassadors')
    .where('id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  if (ambassador.status !== 'pending') {
    throw new AppError('Ambassador application is not pending', 400);
  }

  // Delete ambassador profile and related data
  await db('ambassador_social_links')
    .where('ambassador_id', id)
    .delete();

  await db('ambassadors')
    .where('id', id)
    .delete();

  res.json({
    status: 'success',
    message: 'Ambassador application rejected',
  });
});

/**
 * PUT /api/ambassadors/:id/suspend
 * Suspend an ambassador (admin only)
 */
export const suspendAmbassador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const ambassador = await db('ambassadors')
    .where('id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  if (ambassador.status !== 'active') {
    throw new AppError('Only active ambassadors can be suspended', 400);
  }

  // Update ambassador status
  const [updatedAmbassador] = await db('ambassadors')
    .where('id', id)
    .update({
      status: 'suspended',
      updated_at: new Date(),
    })
    .returning('*');

  res.json({
    status: 'success',
    data: {
      ambassador: updatedAmbassador,
    },
  });
});

/**
 * PUT /api/ambassadors/:id/activate
 * Reactivate a suspended ambassador (admin only)
 */
export const activateAmbassador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const ambassador = await db('ambassadors')
    .where('id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  if (ambassador.status !== 'suspended') {
    throw new AppError('Only suspended ambassadors can be activated', 400);
  }

  // Update ambassador status
  const [updatedAmbassador] = await db('ambassadors')
    .where('id', id)
    .update({
      status: 'active',
      updated_at: new Date(),
    })
    .returning('*');

  res.json({
    status: 'success',
    data: {
      ambassador: updatedAmbassador,
    },
  });
});

/**
 * GET /api/ambassadors/:id
 * Get ambassador profile by ID
 */
export const getAmbassadorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const ambassador = await db('ambassadors')
    .select('ambassadors.*')
    .where('ambassadors.id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  // Get social links
  const socialLinks = await db('ambassador_social_links')
    .where('ambassador_id', id);

  res.json({
    status: 'success',
    data: {
      ambassador: {
        ...ambassador,
        socialLinks,
      },
    },
  });
});

/**
 * PUT /api/ambassadors/:id
 * Update ambassador profile
 */
export const updateAmbassadorProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const { name, bio, profileImageUrl, socialLinks } = req.body;

  // Get ambassador
  const ambassador = await db('ambassadors')
    .where('id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  // Check if user owns this ambassador profile or is admin
  if (ambassador.user_id !== req.user.userId && req.user.role !== 'admin') {
    throw new AppError('Insufficient permissions', 403);
  }

  // Update ambassador profile
  const updateData: any = {
    updated_at: new Date(),
  };

  if (name) updateData.name = name;
  if (bio) updateData.bio = bio;
  if (profileImageUrl !== undefined) updateData.profile_image_url = profileImageUrl;

  const [updatedAmbassador] = await db('ambassadors')
    .where('id', id)
    .update(updateData)
    .returning('*');

  // Update social links if provided
  if (socialLinks && Array.isArray(socialLinks)) {
    // Delete existing social links
    await db('ambassador_social_links')
      .where('ambassador_id', id)
      .delete();

    // Insert new social links
    if (socialLinks.length > 0) {
      const socialLinksData = socialLinks.map((link: any) => ({
        ambassador_id: id,
        platform: link.platform,
        url: link.url,
      }));

      await db('ambassador_social_links').insert(socialLinksData);
    }
  }

  // Get updated social links
  const updatedSocialLinks = await db('ambassador_social_links')
    .where('ambassador_id', id);

  res.json({
    status: 'success',
    data: {
      ambassador: {
        ...updatedAmbassador,
        socialLinks: updatedSocialLinks,
      },
    },
  });
});

/**
 * GET /api/ambassadors
 * Get all active ambassadors
 */
export const getAllAmbassadors = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;

  let query = db('ambassadors')
    .select('ambassadors.*')
    .orderBy('ambassadors.name', 'asc');

  // Filter by status if provided (admin only)
  if (status && req.user?.role === 'admin') {
    query = query.where('ambassadors.status', status as string);
  } else {
    // Public endpoint only shows active ambassadors
    query = query.where('ambassadors.status', 'active');
  }

  const ambassadors = await query;

  // Get social links for all ambassadors
  const ambassadorIds = ambassadors.map((a) => a.id);
  const socialLinks = await db('ambassador_social_links')
    .whereIn('ambassador_id', ambassadorIds);

  const ambassadorsWithLinks = ambassadors.map((ambassador) => ({
    ...ambassador,
    socialLinks: socialLinks.filter((link) => link.ambassador_id === ambassador.id),
  }));

  res.json({
    status: 'success',
    data: {
      ambassadors: ambassadorsWithLinks,
      count: ambassadorsWithLinks.length,
    },
  });
});

/**
 * PUT /api/ambassadors/:id/commission
 * Update ambassador commission rate (admin only)
 */
export const updateCommissionRate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { commissionRate } = req.body;

  // Validate commission rate
  if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
    throw new AppError('Commission rate must be between 0 and 100', 400);
  }

  const ambassador = await db('ambassadors')
    .where('id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  // Update commission rate
  const [updatedAmbassador] = await db('ambassadors')
    .where('id', id)
    .update({
      commission_rate: commissionRate,
      updated_at: new Date(),
    })
    .returning('*');

  res.json({
    status: 'success',
    data: {
      ambassador: updatedAmbassador,
    },
  });
});

/**
 * GET /api/ambassadors/:id/stats
 * Get ambassador statistics
 */
export const getAmbassadorStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  // Get ambassador
  const ambassador = await db('ambassadors')
    .where('id', id)
    .first();

  if (!ambassador) {
    throw new AppError('Ambassador not found', 404);
  }

  // Check if user owns this ambassador profile or is admin
  if (ambassador.user_id !== req.user.userId && req.user.role !== 'admin') {
    throw new AppError('Insufficient permissions', 403);
  }

  // Get article statistics
  const articleStats = await db('articles')
    .where('ambassador_id', id)
    .select(
      db.raw('COUNT(*) as total_articles'),
      db.raw('COUNT(CASE WHEN status = \'published\' THEN 1 END) as published_articles'),
      db.raw('COUNT(CASE WHEN status = \'draft\' THEN 1 END) as draft_articles'),
      db.raw('COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending_articles'),
      db.raw('SUM(views) as total_views'),
      db.raw('SUM(clicks) as total_clicks')
    )
    .first();

  // Get referral statistics
  const referralStats = await db('referrals')
    .where('ambassador_id', id)
    .select(
      db.raw('COUNT(*) as total_referrals'),
      db.raw('COUNT(CASE WHEN converted_at IS NOT NULL THEN 1 END) as conversions'),
      db.raw('SUM(commission) as total_earnings')
    )
    .first();

  // Get top performing articles
  const topArticles = await db('articles')
    .where('ambassador_id', id)
    .where('status', 'published')
    .select('id', 'title', 'views', 'clicks', 'published_at')
    .orderBy('views', 'desc')
    .limit(5);

  // Get recent referrals
  const recentReferrals = await db('referrals')
    .where('ambassador_id', id)
    .select(
      'referrals.*',
      'bookmakers.name as bookmaker_name',
      'articles.title as article_title'
    )
    .leftJoin('bookmakers', 'referrals.bookmaker_id', 'bookmakers.id')
    .leftJoin('articles', 'referrals.article_id', 'articles.id')
    .orderBy('referrals.clicked_at', 'desc')
    .limit(10);

  // Calculate conversion rate
  const conversionRate = referralStats.total_referrals > 0
    ? (referralStats.conversions / referralStats.total_referrals) * 100
    : 0;

  res.json({
    status: 'success',
    data: {
      ambassador,
      stats: {
        articles: {
          total: parseInt(articleStats.total_articles) || 0,
          published: parseInt(articleStats.published_articles) || 0,
          draft: parseInt(articleStats.draft_articles) || 0,
          pending: parseInt(articleStats.pending_articles) || 0,
          totalViews: parseInt(articleStats.total_views) || 0,
          totalClicks: parseInt(articleStats.total_clicks) || 0,
        },
        referrals: {
          total: parseInt(referralStats.total_referrals) || 0,
          conversions: parseInt(referralStats.conversions) || 0,
          conversionRate: conversionRate.toFixed(2),
          totalEarnings: parseFloat(referralStats.total_earnings) || 0,
        },
        topArticles,
        recentReferrals,
      },
    },
  });
});
