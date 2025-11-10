/**
 * Sentiment analyzer service - uses OpenAI to analyze news sentiment
 */

import Bottleneck from 'bottleneck';
import logger, { logSentimentAnalysis } from '../../config/logger';
import {
  openaiClient,
  isOpenAIEnabled,
  openaiConfig,
  SENTIMENT_ANALYSIS_PROMPT,
  CONTENT_REWRITE_PROMPT,
  KEY_INSIGHTS_PROMPT,
} from '../../config/openai';
import type {
  NewsArticle,
  SentimentScore,
} from '../../types/news.types';

export class SentimentAnalyzerService {
  private rateLimiter: Bottleneck;
  private costTracker: {
    totalTokens: number;
    totalRequests: number;
    estimatedCost: number;
  };

  constructor() {
    // Rate limiter: max requests per minute from config
    this.rateLimiter = new Bottleneck({
      reservoir: openaiConfig.rateLimit,
      reservoirRefreshAmount: openaiConfig.rateLimit,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
      maxConcurrent: 5,
    });

    // Cost tracking
    this.costTracker = {
      totalTokens: 0,
      totalRequests: 0,
      estimatedCost: 0,
    };

    // Log cost stats every hour
    setInterval(() => {
      this.logCostStats();
    }, 60 * 60 * 1000);
  }

  /**
   * Analyze sentiment of a news article
   */
  async analyzeSentiment(article: NewsArticle): Promise<SentimentScore | null> {
    if (!isOpenAIEnabled()) {
      logger.warn('OpenAI not enabled, skipping sentiment analysis');
      return null;
    }

    const startTime = Date.now();
    
    try {
      const prompt = this.buildPrompt(SENTIMENT_ANALYSIS_PROMPT, {
        title: article.title,
        content: this.truncateContent(article.content, 3000),
      });

      const response = await this.rateLimiter.schedule(() =>
        this.callOpenAI(prompt, 'sentiment-analysis')
      );

      if (!response) {
        return null;
      }

      // Parse JSON response
      const sentiment = this.parseSentimentResponse(response);
      
      const duration = Date.now() - startTime;
      
      // Log structured sentiment analysis
      logSentimentAnalysis(
        article.id || 'unknown',
        sentiment.overall,
        sentiment.confidence,
        duration
      );
      
      logger.info(
        {
          articleId: article.id,
          overall: sentiment.overall,
          confidence: sentiment.confidence,
          entityCount: sentiment.entitySentiments?.length || 0,
        },
        'Sentiment analysis completed'
      );

      return sentiment;
    } catch (error) {
      logger.error(
        {
          articleId: article.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to analyze sentiment'
      );
      return null;
    }
  }

  /**
   * Rewrite article content for clarity and engagement
   */
  async rewriteContent(article: NewsArticle): Promise<string | null> {
    if (!isOpenAIEnabled()) {
      logger.warn('OpenAI not enabled, skipping content rewriting');
      return null;
    }

    try {
      const prompt = this.buildPrompt(CONTENT_REWRITE_PROMPT, {
        title: article.title,
        content: this.truncateContent(article.content, 2000),
      });

      const response = await this.rateLimiter.schedule(() =>
        this.callOpenAI(prompt, 'content-rewrite')
      );

      if (!response) {
        return null;
      }

      logger.info(
        {
          articleId: article.id,
          originalLength: article.content.length,
          rewrittenLength: response.length,
        },
        'Content rewriting completed'
      );

      return response.trim();
    } catch (error) {
      logger.error(
        {
          articleId: article.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to rewrite content'
      );
      return null;
    }
  }

  /**
   * Extract key insights from article
   */
  async extractInsights(article: NewsArticle): Promise<string[]> {
    if (!isOpenAIEnabled()) {
      logger.warn('OpenAI not enabled, skipping insights extraction');
      return [];
    }

    try {
      const prompt = this.buildPrompt(KEY_INSIGHTS_PROMPT, {
        title: article.title,
        content: this.truncateContent(article.content, 2000),
      });

      const response = await this.rateLimiter.schedule(() =>
        this.callOpenAI(prompt, 'insights-extraction')
      );

      if (!response) {
        return [];
      }

      // Parse JSON array response
      const insights = this.parseInsightsResponse(response);
      
      logger.info(
        {
          articleId: article.id,
          insightCount: insights.length,
        },
        'Insights extraction completed'
      );

      return insights;
    } catch (error) {
      logger.error(
        {
          articleId: article.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to extract insights'
      );
      return [];
    }
  }

  /**
   * Call OpenAI API with error handling and cost tracking
   */
  private async callOpenAI(
    prompt: string,
    operation: string
  ): Promise<string | null> {
    if (!openaiClient) {
      return null;
    }

    try {
      const completion = await openaiClient.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional horse racing analyst and journalist.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: openaiConfig.maxTokens,
        temperature: openaiConfig.temperature,
      });

      // Track usage
      const usage = completion.usage;
      if (usage) {
        this.costTracker.totalTokens += usage.total_tokens;
        this.costTracker.totalRequests += 1;
        
        // Estimate cost (approximate pricing for GPT-4o-mini)
        // Input: $0.15 per 1M tokens, Output: $0.60 per 1M tokens
        const inputCost = (usage.prompt_tokens / 1_000_000) * 0.15;
        const outputCost = (usage.completion_tokens / 1_000_000) * 0.60;
        this.costTracker.estimatedCost += inputCost + outputCost;
      }

      const content = completion.choices[0]?.message?.content;
      return content || null;
    } catch (error) {
      logger.error(
        {
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'OpenAI API call failed'
      );
      throw error;
    }
  }

  /**
   * Build prompt by replacing placeholders
   */
  private buildPrompt(
    template: string,
    variables: Record<string, string>
  ): string {
    let prompt = template;
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(`{${key}}`, value);
    }
    return prompt;
  }

  /**
   * Truncate content to fit within token limits
   */
  private truncateContent(content: string, maxChars: number): string {
    if (content.length <= maxChars) {
      return content;
    }
    return content.substring(0, maxChars) + '...';
  }

  /**
   * Parse sentiment analysis response
   */
  private parseSentimentResponse(response: string): SentimentScore {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        overall: parsed.overall || 'neutral',
        confidence: parsed.confidence || 0.5,
        entitySentiments: parsed.entitySentiments || [],
      };
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to parse sentiment response'
      );
      
      // Return default neutral sentiment
      return {
        overall: 'neutral',
        confidence: 0.5,
        entitySentiments: [],
      };
    }
  }

  /**
   * Parse insights extraction response
   */
  private parseInsightsResponse(response: string): string[] {
    try {
      // Extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      
      const parsed = JSON.parse(jsonStr);
      
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string');
      }
      
      return [];
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to parse insights response'
      );
      return [];
    }
  }

  /**
   * Log cost statistics
   */
  private logCostStats(): void {
    logger.info(
      {
        totalRequests: this.costTracker.totalRequests,
        totalTokens: this.costTracker.totalTokens,
        estimatedCost: this.costTracker.estimatedCost.toFixed(4),
      },
      'OpenAI usage statistics'
    );
  }

  /**
   * Get current cost statistics
   */
  getCostStats(): {
    totalTokens: number;
    totalRequests: number;
    estimatedCost: number;
  } {
    return { ...this.costTracker };
  }
}
