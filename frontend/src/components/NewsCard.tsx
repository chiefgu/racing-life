import Link from 'next/link';
import { NewsArticle } from '@/types';
import { formatDateTime, getSentimentColor, getSentimentBgColor } from '@/lib/utils';

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const sentiment = article.sentiment?.overall || 'neutral';

  return (
    <Link href={`/news/${article.id}`} className="block touch-manipulation">
      <article className="bg-white rounded-lg shadow hover:shadow-md active:shadow-lg transition-shadow p-4 sm:p-6 border border-gray-200 h-full active:border-racing-blue">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {article.title}
          </h3>
          <span
            className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getSentimentBgColor(
              sentiment
            )} ${getSentimentColor(sentiment)}`}
          >
            {sentiment}
          </span>
        </div>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
          {article.rewrittenContent || article.content}
        </p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {article.entities.horses.slice(0, 3).map((horse) => (
            <span
              key={horse}
              className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full truncate max-w-[120px]"
            >
              {horse}
            </span>
          ))}
          {article.entities.jockeys.slice(0, 2).map((jockey) => (
            <span
              key={jockey}
              className="px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-800 text-xs rounded-full truncate max-w-[120px]"
            >
              {jockey}
            </span>
          ))}
          {article.entities.trainers.slice(0, 2).map((trainer) => (
            <span
              key={trainer}
              className="px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 text-xs rounded-full truncate max-w-[120px]"
            >
              {trainer}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs sm:text-sm text-gray-500">
          <span>{formatDateTime(article.publishedAt)}</span>
          {article.author && <span className="truncate">By {article.author}</span>}
        </div>
      </article>
    </Link>
  );
}
