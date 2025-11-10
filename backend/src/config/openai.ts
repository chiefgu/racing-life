/**
 * OpenAI API configuration
 */

import OpenAI from 'openai';
import logger from './logger';

// Validate required environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  logger.warn('OPENAI_API_KEY not set - sentiment analysis will be disabled');
}

// OpenAI client configuration
export const openaiConfig = {
  apiKey: apiKey || '',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
  rateLimit: parseInt(process.env.OPENAI_RATE_LIMIT || '50', 10), // requests per minute
};

// Create OpenAI client instance
export const openaiClient = apiKey
  ? new OpenAI({
      apiKey: openaiConfig.apiKey,
    })
  : null;

// Check if OpenAI is enabled
export const isOpenAIEnabled = (): boolean => {
  return openaiClient !== null;
};

// Prompt templates for sentiment analysis
export const SENTIMENT_ANALYSIS_PROMPT = `You are a horse racing news analyst. Analyze the sentiment of the following article and extract entity-specific sentiments.

Article Title: {title}
Article Content: {content}

Provide your analysis in the following JSON format:
{
  "overall": "positive" | "negative" | "neutral",
  "confidence": 0.0-1.0,
  "entitySentiments": [
    {
      "entityName": "name of horse/jockey/trainer",
      "entityType": "horse" | "jockey" | "trainer",
      "sentiment": "positive" | "negative" | "neutral",
      "confidence": 0.0-1.0,
      "relevantQuotes": ["quote from article"]
    }
  ]
}

Focus on:
- Overall tone of the article (positive, negative, or neutral)
- Specific mentions of horses, jockeys, and trainers
- Performance indicators, injuries, form, and predictions
- Only include entities that are explicitly mentioned in the article`;

// Prompt template for content rewriting
export const CONTENT_REWRITE_PROMPT = `You are a professional horse racing journalist. Rewrite the following article to be clear, concise, and engaging while preserving all key facts and insights.

Original Article:
Title: {title}
Content: {content}

Requirements:
- Keep the rewritten content between 150-300 words
- Maintain all factual information (names, dates, statistics)
- Use clear, accessible language
- Highlight key insights and predictions
- Remove redundancy and filler content
- Maintain a professional, informative tone

Provide only the rewritten content without any preamble or explanation.`;

// Prompt template for key insights extraction
export const KEY_INSIGHTS_PROMPT = `You are a horse racing analyst. Extract the 3-5 most important insights from the following article.

Article Title: {title}
Article Content: {content}

Provide insights as a JSON array of strings:
["insight 1", "insight 2", "insight 3"]

Focus on:
- Performance predictions
- Form analysis
- Injury updates
- Track conditions
- Betting implications
- Expert opinions`;

export default openaiClient;
