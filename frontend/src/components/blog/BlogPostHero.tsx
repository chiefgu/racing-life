'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Clock, Calendar, Tag } from 'lucide-react';
import { NewsArticle } from '@/types';

interface BlogPostHeroProps {
  article: NewsArticle & {
    image?: string;
    category?: string;
    readTime?: string;
    authorImage?: string;
  };
}

export default function BlogPostHero({ article }: BlogPostHeroProps) {
  // Calculate read time if not provided
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const readTime = article.readTime || calculateReadTime(article.content);

  return (
    <div>
      {/* Category Badge */}
      {article.category && (
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <Tag className="w-3 h-3" />
            {article.category}
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
        {article.title}
      </h1>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-8 border-b border-gray-200">
        {/* Author */}
        {article.author && (
          <div className="flex items-center gap-3">
            {article.authorImage && (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={article.authorImage}
                  alt={article.author}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">{article.author}</div>
            </div>
          </div>
        )}

        {/* Published Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <time>{format(new Date(article.publishedAt), 'MMMM d, yyyy')}</time>
        </div>

        {/* Read Time */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{readTime}</span>
        </div>
      </div>

      {/* Featured Image */}
      {article.image && (
        <div className="mt-8 aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={article.image}
            alt={article.title}
            width={1200}
            height={675}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      )}
    </div>
  );
}
