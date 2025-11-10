import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { db } from '../db/knex';
import { getBookmakerHealth } from '../services/bookmaker/init';

/**
 * GET /api/admin/dashboard/metrics
 * Get overview metrics for admin dashboard
 */
export const getDashboardMetrics = asyncHandler(async (_req: Request, res: Response) => {
  // Get user statistics
  const userStats = await db('users')
    .select(
      db.raw('COUNT(*) as total_users'),
      db.raw('COUNT(CASE WHEN subscription_tier = \'premium\' THEN 1 END) as premium_users'),
      db.raw('COUNT(CASE WHEN created_at >= NOW() - INTERVAL \'30 days\' THEN 1 END) as new_users_30d'),
      db.raw('COUNT(CASE WHEN created_at >= NOW() - INTERVAL \'7 days\' THEN 1 END) as new_users_7d')
    )
    .first();

  // Get ambassador statistics
  const ambassadorStats = await db('ambassadors')
    .select(
      db.raw('COUNT(*) as total_ambassadors'),
      db.raw('COUNT(CASE WHEN status = \'active\' THEN 1 END) as active_ambassadors'),
      db.raw('COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending_ambassadors'),
      db.raw('COUNT(CASE WHEN status = \'suspended\' THEN 1 END) as suspended_ambassadors')
    )
    .first();

  // Get article statistics
  const articleStats = await db('articles')
    .select(
      db.raw('COUNT(*) as total_articles'),
      db.raw('COUNT(CASE WHEN status = \'published\' THEN 1 END) as published_articles'),
      db.raw('COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending_articles'),
      db.raw('COUNT(CASE WHEN status = \'draft\' THEN 1 END) as draft_articles'),
      db.raw('SUM(views) as total_views'),
      db.raw('SUM(clicks) as total_clicks')
    )
    .first();

  // Get referral statistics
  const referralStats = await db('referrals')
    .select(
      db.raw('COUNT(*) as total_referrals'),
      db.raw('COUNT(CASE WHEN converted_at IS NOT NULL THEN 1 END) as total_conversions'),
      db.raw('SUM(commission) as total_revenue'),
      db.raw('COUNT(CASE WHEN clicked_at >= NOW() - INTERVAL \'30 days\' THEN 1 END) as referrals_30d'),
      db.raw('COUNT(CASE WHEN converted_at >= NOW() - INTERVAL \'30 days\' THEN 1 END) as conversions_30d'),
      db.raw('SUM(CASE WHEN converted_at >= NOW() - INTERVAL \'30 days\' THEN commission ELSE 0 END) as revenue_30d')
    )
    .first();

  // Calculate conversion rates
  const overallConversionRate = referralStats.total_referrals > 0
    ? (referralStats.total_conversions / referralStats.total_referrals) * 100
    : 0;

  const conversionRate30d = referralStats.referrals_30d > 0
    ? (referralStats.conversions_30d / referralStats.referrals_30d) * 100
    : 0;

  // Get news statistics
  const newsStats = await db('news_articles')
    .select(
      db.raw('COUNT(*) as total_articles'),
      db.raw('COUNT(CASE WHEN published_at >= NOW() - INTERVAL \'24 hours\' THEN 1 END) as articles_24h'),
      db.raw('COUNT(CASE WHEN sentiment_overall = \'positive\' THEN 1 END) as positive_sentiment'),
      db.raw('COUNT(CASE WHEN sentiment_overall = \'negative\' THEN 1 END) as negative_sentiment'),
      db.raw('COUNT(CASE WHEN sentiment_overall = \'neutral\' THEN 1 END) as neutral_sentiment')
    )
    .first();

  // Get race statistics
  const raceStats = await db('races')
    .select(
      db.raw('COUNT(*) as total_races'),
      db.raw('COUNT(CASE WHEN status = \'upcoming\' AND start_time >= NOW() THEN 1 END) as upcoming_races'),
      db.raw('COUNT(CASE WHEN status = \'resulted\' THEN 1 END) as completed_races')
    )
    .first();

  // Get odds snapshot count
  const oddsStats = await db('odds_snapshots')
    .select(
      db.raw('COUNT(*) as total_snapshots'),
      db.raw('COUNT(CASE WHEN timestamp >= NOW() - INTERVAL \'24 hours\' THEN 1 END) as snapshots_24h')
    )
    .first();

  res.json({
    status: 'success',
    data: {
      users: {
        total: parseInt(userStats.total_users) || 0,
        premium: parseInt(userStats.premium_users) || 0,
        new_30d: parseInt(userStats.new_users_30d) || 0,
        new_7d: parseInt(userStats.new_users_7d) || 0,
      },
      ambassadors: {
        total: parseInt(ambassadorStats.total_ambassadors) || 0,
        active: parseInt(ambassadorStats.active_ambassadors) || 0,
        pending: parseInt(ambassadorStats.pending_ambassadors) || 0,
        suspended: parseInt(ambassadorStats.suspended_ambassadors) || 0,
      },
      articles: {
        total: parseInt(articleStats.total_articles) || 0,
        published: parseInt(articleStats.published_articles) || 0,
        pending: parseInt(articleStats.pending_articles) || 0,
        draft: parseInt(articleStats.draft_articles) || 0,
        totalViews: parseInt(articleStats.total_views) || 0,
        totalClicks: parseInt(articleStats.total_clicks) || 0,
      },
      referrals: {
        total: parseInt(referralStats.total_referrals) || 0,
        conversions: parseInt(referralStats.total_conversions) || 0,
        revenue: parseFloat(referralStats.total_revenue) || 0,
        conversionRate: overallConversionRate.toFixed(2),
        last30Days: {
          referrals: parseInt(referralStats.referrals_30d) || 0,
          conversions: parseInt(referralStats.conversions_30d) || 0,
          revenue: parseFloat(referralStats.revenue_30d) || 0,
          conversionRate: conversionRate30d.toFixed(2),
        },
      },
      news: {
        total: parseInt(newsStats.total_articles) || 0,
        last24h: parseInt(newsStats.articles_24h) || 0,
        sentiment: {
          positive: parseInt(newsStats.positive_sentiment) || 0,
          negative: parseInt(newsStats.negative_sentiment) || 0,
          neutral: parseInt(newsStats.neutral_sentiment) || 0,
        },
      },
      races: {
        total: parseInt(raceStats.total_races) || 0,
        upcoming: parseInt(raceStats.upcoming_races) || 0,
        completed: parseInt(raceStats.completed_races) || 0,
      },
      odds: {
        totalSnapshots: parseInt(oddsStats.total_snapshots) || 0,
        snapshots24h: parseInt(oddsStats.snapshots_24h) || 0,
      },
    },
  });
});

/**
 * GET /api/admin/dashboard/activity
 * Get recent activity feed
 */
export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const { limit = '20' } = req.query;
  const limitNum = parseInt(limit as string);

  // Get recent user registrations
  const recentUsers = await db('users')
    .select('id', 'name', 'email', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(5);

  // Get recent ambassador applications
  const recentAmbassadors = await db('ambassadors')
    .select('id', 'name', 'status', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(5);

  // Get recent articles
  const recentArticles = await db('articles')
    .select(
      'articles.id',
      'articles.title',
      'articles.status',
      'articles.created_at',
      'ambassadors.name as ambassador_name'
    )
    .leftJoin('ambassadors', 'articles.ambassador_id', 'ambassadors.id')
    .orderBy('articles.created_at', 'desc')
    .limit(5);

  // Get recent conversions
  const recentConversions = await db('referrals')
    .select(
      'referrals.id',
      'referrals.converted_at',
      'referrals.commission',
      'bookmakers.name as bookmaker_name',
      'ambassadors.name as ambassador_name'
    )
    .leftJoin('bookmakers', 'referrals.bookmaker_id', 'bookmakers.id')
    .leftJoin('ambassadors', 'referrals.ambassador_id', 'ambassadors.id')
    .whereNotNull('referrals.converted_at')
    .orderBy('referrals.converted_at', 'desc')
    .limit(5);

  // Combine and sort all activities
  const activities: any[] = [];

  recentUsers.forEach((user) => {
    activities.push({
      type: 'user_registration',
      timestamp: user.created_at,
      data: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      },
    });
  });

  recentAmbassadors.forEach((ambassador) => {
    activities.push({
      type: 'ambassador_application',
      timestamp: ambassador.created_at,
      data: {
        ambassadorId: ambassador.id,
        ambassadorName: ambassador.name,
        status: ambassador.status,
      },
    });
  });

  recentArticles.forEach((article) => {
    activities.push({
      type: 'article_submission',
      timestamp: article.created_at,
      data: {
        articleId: article.id,
        articleTitle: article.title,
        status: article.status,
        ambassadorName: article.ambassador_name,
      },
    });
  });

  recentConversions.forEach((conversion) => {
    activities.push({
      type: 'referral_conversion',
      timestamp: conversion.converted_at,
      data: {
        referralId: conversion.id,
        bookmakerName: conversion.bookmaker_name,
        ambassadorName: conversion.ambassador_name,
        commission: parseFloat(conversion.commission) || 0,
      },
    });
  });

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Limit results
  const limitedActivities = activities.slice(0, limitNum);

  res.json({
    status: 'success',
    data: {
      activities: limitedActivities,
      count: limitedActivities.length,
    },
  });
});

/**
 * GET /api/admin/dashboard/system-health
 * Get system health indicators
 */
export const getSystemHealth = asyncHandler(async (_req: Request, res: Response) => {
  // Get bookmaker health from service
  const bookmakerHealth = getBookmakerHealth();

  // Get scraper source health
  const scraperSources = await db('scraper_sources')
    .select('id', 'name', 'is_active', 'last_scraped_at', 'last_success_at', 'failure_count')
    .orderBy('name', 'asc');

  const scraperHealth = scraperSources.map((source) => {
    const isHealthy = source.is_active && source.failure_count < 5;
    const lastScrapedMinutesAgo = source.last_scraped_at
      ? Math.floor((Date.now() - new Date(source.last_scraped_at).getTime()) / 60000)
      : null;

    return {
      id: source.id,
      name: source.name,
      status: isHealthy ? 'healthy' : 'degraded',
      isActive: source.is_active,
      lastScraped: source.last_scraped_at,
      lastSuccess: source.last_success_at,
      failureCount: source.failure_count,
      minutesSinceLastScrape: lastScrapedMinutesAgo,
    };
  });

  // Get recent scraper metrics
  const scraperMetrics = await db('scraper_metrics')
    .select(
      'source_id',
      db.raw('COUNT(*) as total_attempts'),
      db.raw('COUNT(CASE WHEN success = true THEN 1 END) as successful_attempts'),
      db.raw('AVG(duration_ms) as avg_duration_ms')
    )
    .where('timestamp', '>=', db.raw("NOW() - INTERVAL '24 hours'"))
    .groupBy('source_id');

  const metricsMap = new Map(scraperMetrics.map((m) => [m.source_id, m]));

  // Add metrics to scraper health
  const scrapersWithMetrics = scraperHealth.map((scraper) => {
    const metrics = metricsMap.get(scraper.id);
    if (metrics) {
      const successRate = metrics.total_attempts > 0
        ? (metrics.successful_attempts / metrics.total_attempts) * 100
        : 0;

      return {
        ...scraper,
        last24h: {
          attempts: parseInt(metrics.total_attempts),
          successful: parseInt(metrics.successful_attempts),
          successRate: successRate.toFixed(2),
          avgDuration: Math.round(parseFloat(metrics.avg_duration_ms) || 0),
        },
      };
    }
    return scraper;
  });

  // Database health check
  const dbHealthy = await db.raw('SELECT 1').then(() => true).catch(() => false);

  res.json({
    status: 'success',
    data: {
      database: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
      },
      bookmakers: Object.fromEntries(bookmakerHealth),
      scrapers: scrapersWithMetrics,
    },
  });
});
