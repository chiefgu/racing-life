import { Request, Response } from 'express';
import { db } from '../db';

// Levenshtein distance for typo tolerance
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }

  return dp[m][n];
}

// Calculate relevance score
function calculateRelevance(
  title: string,
  query: string,
  clickCount: number = 0,
  type: string
): number {
  const titleLower = title.toLowerCase();
  const queryLower = query.toLowerCase();

  let score = 0;

  // Exact match: highest score
  if (titleLower === queryLower) {
    score += 100;
  }

  // Starts with query: high score
  if (titleLower.startsWith(queryLower)) {
    score += 50;
  }

  // Contains query: medium score
  if (titleLower.includes(queryLower)) {
    score += 25;
  }

  // Fuzzy match: score based on similarity (handle typos)
  const distance = levenshteinDistance(titleLower, queryLower);
  const maxLength = Math.max(titleLower.length, queryLower.length);
  const similarity = 1 - distance / maxLength;
  score += similarity * 20;

  // Boost based on user clicks (learning from behavior)
  score += Math.log(clickCount + 1) * 5;

  // Type boosting (news is slightly less relevant than entities)
  if (type === 'horse' || type === 'jockey' || type === 'trainer') {
    score += 5;
  }

  return score;
}

export const search = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = q.toLowerCase();

    // Search across multiple tables with fuzzy matching
    const [newsResults, horsesResults, jockeysResults, trainersResults] = await Promise.all([
      // Search news articles
      db('news_articles')
        .select('id', 'title', 'excerpt as subtitle', 'category', 'published_at')
        .where('title', 'ilike', `%${query}%`)
        .orWhere('content', 'ilike', `%${query}%`)
        .orWhere('excerpt', 'ilike', `%${query}%`)
        .limit(20),

      // Search horses
      db('horses')
        .select('id', 'name as title', 'trainer as subtitle')
        .where('name', 'ilike', `%${query}%`)
        .limit(20),

      // Search jockeys
      db('jockeys')
        .select('id', 'name as title', 'wins as subtitle')
        .where('name', 'ilike', `%${query}%`)
        .limit(20),

      // Search trainers
      db('trainers')
        .select('id', 'name as title', 'stable as subtitle')
        .where('name', 'ilike', `%${query}%`)
        .limit(20),
    ]);

    // Get click counts for behavioral learning
    const searchClicks = await db('search_clicks')
      .select('result_id', 'result_type', db.raw('COUNT(*) as click_count'))
      .groupBy('result_id', 'result_type');

    const clickMap = new Map(
      searchClicks.map((item: any) => [`${item.result_type}-${item.result_id}`, parseInt(item.click_count)])
    );

    // Format results with type and click counts
    const results = [
      ...newsResults.map((item: any) => ({
        ...item,
        type: 'news',
        clickCount: clickMap.get(`news-${item.id}`) || 0,
      })),
      ...horsesResults.map((item: any) => ({
        ...item,
        type: 'horse',
        clickCount: clickMap.get(`horse-${item.id}`) || 0,
      })),
      ...jockeysResults.map((item: any) => ({
        ...item,
        type: 'jockey',
        clickCount: clickMap.get(`jockey-${item.id}`) || 0,
      })),
      ...trainersResults.map((item: any) => ({
        ...item,
        type: 'trainer',
        clickCount: clickMap.get(`trainer-${item.id}`) || 0,
      })),
    ];

    // Calculate relevance scores and sort
    results.forEach((result) => {
      result.relevanceScore = calculateRelevance(result.title, query, result.clickCount, result.type);
    });

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Remove click count and score from response
    const cleanResults = results.slice(0, 20).map(({ clickCount, relevanceScore, ...rest }) => rest);

    res.json(cleanResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
};

// Track search result clicks for learning
export const trackClick = async (req: Request, res: Response) => {
  try {
    const { resultId, resultType, query } = req.body;

    if (!resultId || !resultType || !query) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db('search_clicks').insert({
      result_id: resultId,
      result_type: resultType,
      query,
      clicked_at: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
};
