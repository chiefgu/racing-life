import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';
import crypto from 'crypto';

/**
 * POST /api/referrals/click
 * Track bookmaker link clicks
 */
export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const {
    bookmaker_id,
    race_id,
    article_id,
    ambassador_id,
  } = req.body;

  if (!bookmaker_id) {
    throw new AppError('bookmaker_id is required', 400);
  }

  // Verify bookmaker exists
  const bookmaker = await db('bookmakers')
    .select('id', 'affiliate_link')
    .where('id', bookmaker_id)
    .first();

  if (!bookmaker) {
    throw new AppError('Bookmaker not found', 404);
  }

  // Get user ID from auth if available
  const user_id = req.user?.userId || null;

  // Get IP address and user agent
  const ip_address = req.ip || req.socket.remoteAddress || null;
  const user_agent = req.headers['user-agent'] || null;

  // Generate unique referral code
  const referral_code = crypto.randomBytes(16).toString('hex');

  // Create referral record
  const [referral] = await db('referrals')
    .insert({
      user_id,
      ambassador_id: ambassador_id || null,
      bookmaker_id,
      race_id: race_id || null,
      article_id: article_id || null,
      ip_address,
      user_agent,
      referral_code,
      clicked_at: new Date(),
    })
    .returning('*');

  // Build affiliate link with tracking parameters
  const affiliateUrl = new URL(bookmaker.affiliate_link);
  affiliateUrl.searchParams.set('ref', referral_code);
  if (race_id) {
    affiliateUrl.searchParams.set('race', race_id);
  }

  res.json({
    status: 'success',
    data: {
      referral_id: referral.id,
      referral_code,
      affiliate_url: affiliateUrl.toString(),
    },
  });
});

/**
 * POST /api/referrals/conversion
 * Track conversions (when user signs up with bookmaker)
 */
export const trackConversion = asyncHandler(async (req: Request, res: Response) => {
  const { referral_code, commission } = req.body;

  if (!referral_code) {
    throw new AppError('referral_code is required', 400);
  }

  // Find referral by code
  const referral = await db('referrals')
    .select('*')
    .where('referral_code', referral_code)
    .whereNull('converted_at')
    .first();

  if (!referral) {
    throw new AppError('Referral not found or already converted', 404);
  }

  // Update referral with conversion data
  const [updatedReferral] = await db('referrals')
    .where('id', referral.id)
    .update({
      converted_at: new Date(),
      commission: commission || null,
    })
    .returning('*');

  res.json({
    status: 'success',
    data: {
      referral: updatedReferral,
    },
  });
});

/**
 * GET /api/referrals/stats
 * Get referral statistics
 */
export const getReferralStats = asyncHandler(async (req: Request, res: Response) => {
  const {
    ambassador_id,
    bookmaker_id,
    start_date,
    end_date,
  } = req.query;

  // Build base query
  let clicksQuery = db('referrals').count('* as count');
  let conversionsQuery = db('referrals')
    .count('* as count')
    .sum('commission as total_commission')
    .whereNotNull('converted_at');

  // Apply filters
  if (ambassador_id) {
    clicksQuery = clicksQuery.where('ambassador_id', ambassador_id as string);
    conversionsQuery = conversionsQuery.where('ambassador_id', ambassador_id as string);
  }

  if (bookmaker_id) {
    clicksQuery = clicksQuery.where('bookmaker_id', bookmaker_id as string);
    conversionsQuery = conversionsQuery.where('bookmaker_id', bookmaker_id as string);
  }

  if (start_date) {
    clicksQuery = clicksQuery.where('clicked_at', '>=', start_date as string);
    conversionsQuery = conversionsQuery.where('clicked_at', '>=', start_date as string);
  }

  if (end_date) {
    clicksQuery = clicksQuery.where('clicked_at', '<=', end_date as string);
    conversionsQuery = conversionsQuery.where('clicked_at', '<=', end_date as string);
  }

  const [clicks, conversions] = await Promise.all([
    clicksQuery.first(),
    conversionsQuery.first(),
  ]);

  const totalClicks = parseInt(clicks?.count as string || '0');
  const totalConversions = parseInt(conversions?.count as string || '0');
  const totalCommission = parseFloat(conversions?.total_commission as string || '0');
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  // Get breakdown by bookmaker
  let bookmakerBreakdown = db('referrals')
    .select(
      'bookmaker_id',
      'bookmakers.name as bookmaker_name',
      db.raw('COUNT(*) as clicks'),
      db.raw('COUNT(converted_at) as conversions'),
      db.raw('SUM(commission) as total_commission')
    )
    .join('bookmakers', 'referrals.bookmaker_id', 'bookmakers.id')
    .groupBy('bookmaker_id', 'bookmakers.name')
    .orderBy('clicks', 'desc');

  if (ambassador_id) {
    bookmakerBreakdown = bookmakerBreakdown.where('ambassador_id', ambassador_id as string);
  }

  if (start_date) {
    bookmakerBreakdown = bookmakerBreakdown.where('clicked_at', '>=', start_date as string);
  }

  if (end_date) {
    bookmakerBreakdown = bookmakerBreakdown.where('clicked_at', '<=', end_date as string);
  }

  const breakdown = await bookmakerBreakdown;

  res.json({
    status: 'success',
    data: {
      summary: {
        total_clicks: totalClicks,
        total_conversions: totalConversions,
        conversion_rate: conversionRate.toFixed(2) + '%',
        total_commission: totalCommission.toFixed(2),
      },
      breakdown: breakdown.map((b: any) => ({
        bookmaker_id: b.bookmaker_id,
        bookmaker_name: b.bookmaker_name,
        clicks: parseInt(b.clicks),
        conversions: parseInt(b.conversions),
        conversion_rate: parseInt(b.clicks) > 0 
          ? ((parseInt(b.conversions) / parseInt(b.clicks)) * 100).toFixed(2) + '%'
          : '0%',
        total_commission: parseFloat(b.total_commission || '0').toFixed(2),
      })),
    },
  });
});
