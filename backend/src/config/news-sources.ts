/**
 * Configuration for Australian racing news sources
 */

import type { NewsSource } from '../types/news.types';

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'racing-com',
    name: 'Racing.com',
    url: 'https://www.racing.com/news/rss',
    type: 'rss',
    pollInterval: 15,
    enabled: true,
  },
  {
    id: 'racing-post-au',
    name: 'Racing Post Australia',
    url: 'https://www.racingpost.com/news/rss',
    type: 'rss',
    pollInterval: 20,
    enabled: true,
  },
  {
    id: 'thoroughbred-news',
    name: 'Thoroughbred News',
    url: 'https://www.thoroughbrednews.com.au/feed/',
    type: 'rss',
    pollInterval: 30,
    enabled: true,
  },
  {
    id: 'racing-nsw',
    name: 'Racing NSW',
    url: 'https://www.racingnsw.com.au/news/',
    type: 'web',
    selectors: {
      article: '.news-item',
      title: '.news-title',
      content: '.news-content',
      author: '.news-author',
      publishedAt: '.news-date',
      url: 'a.news-link',
    },
    pollInterval: 30,
    enabled: false, // Disabled by default, enable when selectors are verified
  },
  {
    id: 'racing-victoria',
    name: 'Racing Victoria',
    url: 'https://www.racingvictoria.com.au/news/',
    type: 'web',
    selectors: {
      article: '.article-card',
      title: '.article-title',
      content: '.article-body',
      publishedAt: '.article-date',
      url: 'a.article-link',
    },
    pollInterval: 30,
    enabled: false, // Disabled by default, enable when selectors are verified
  },
];

export function getEnabledSources(): NewsSource[] {
  return NEWS_SOURCES.filter((source) => source.enabled);
}

export function getSourceById(id: string): NewsSource | undefined {
  return NEWS_SOURCES.find((source) => source.id === id);
}
