'use client';

import Image from 'next/image';
import { Clock, MapPin, TrendingUp } from 'lucide-react';
import { NewsArticle } from '@/types';
import { useNews } from '@/hooks/api/useNews';
import AnimatedOrb from '@/components/shared/AnimatedOrb';

interface BlogPostSidebarProps {
  article: NewsArticle;
  isMobile?: boolean;
}

export default function BlogPostSidebar({ article, isMobile = false }: BlogPostSidebarProps) {
  const { data } = useNews();

  // Mock data for races (would come from API)
  const nextRaces = [
    {
      id: '1',
      location: 'Flemington',
      raceNumber: 3,
      time: '2:30 PM',
      prize: '$50,000',
    },
    {
      id: '2',
      location: 'Randwick',
      raceNumber: 5,
      time: '3:15 PM',
      prize: '$75,000',
    },
    {
      id: '3',
      location: 'Eagle Farm',
      raceNumber: 2,
      time: '4:00 PM',
      prize: '$40,000',
    },
  ];

  // Get related articles (excluding current one)
  const relatedArticles =
    Array.isArray(data)
      ? data.filter((a: any) => a.id !== article.id).slice(0, 3)
      : [];

  return (
    <div className="space-y-8">
      {/* Advertisement Space 1 */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 mx-auto mb-3 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">AD</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Advertisement
          </p>
          <p className="text-xs text-gray-400 mt-1">300×250</p>
        </div>
      </div>

      {/* Next Races Widget */}
      <div className="bg-white border-2 border-gray-200 p-6">
        <h3 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-primary" />
          Next Races
        </h3>
        <div className="space-y-4">
          {nextRaces.map((race) => (
            <div
              key={race.id}
              className="pb-4 border-b border-gray-200 last:border-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 py-2 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                  {race.location}
                </div>
                <span className="text-xs bg-brand-primary text-white px-2 py-1 font-semibold">
                  R{race.raceNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {race.time}
                </div>
                <span className="font-medium text-gray-900">{race.prize}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 bg-brand-primary hover:bg-brand-primary-intense text-white text-sm font-semibold py-3 transition-colors">
          View All Races
        </button>
      </div>

      {/* Advertisement Space 2 */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 mx-auto mb-3 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">AD</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Advertisement
          </p>
          <p className="text-xs text-gray-400 mt-1">300×600</p>
        </div>
      </div>

      {/* Featured Articles */}
      <div className="bg-white border-2 border-gray-200 p-6">
        <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">
          More From Racing Life
        </h3>
        <div className="space-y-4">
          {relatedArticles.map((relatedArticle: any, index: number) => (
            <div
              key={relatedArticle.id}
              className={`${
                index !== relatedArticles.length - 1
                  ? 'pb-4 border-b border-gray-200'
                  : ''
              }`}
            >
              {relatedArticle.image && (
                <div className="aspect-video overflow-hidden mb-3">
                  <Image
                    src={relatedArticle.image}
                    alt={relatedArticle.title}
                    width={300}
                    height={169}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <h4 className="text-sm font-serif font-bold text-gray-900 mb-2 leading-snug hover:text-brand-primary transition-colors cursor-pointer">
                {relatedArticle.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {relatedArticle.excerpt || relatedArticle.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Advertisement Space 3 */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 mx-auto mb-3 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">AD</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Advertisement
          </p>
          <p className="text-xs text-gray-400 mt-1">300×250</p>
        </div>
      </div>

      {/* AI Racing Analyst */}
      <div className="bg-brand-primary-intense text-white p-6 relative">
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              <AnimatedOrb size="tiny" energy={0} />
            </div>
            <h3 className="text-xl font-serif font-bold">Your Personal Racing Analyst</h3>
          </div>

          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            Track your favourite horses, jockeys, and trainers. Get instant alerts on form
            changes, odds movements, and race entries.
          </p>

          <div className="space-y-3 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
              <span className="text-gray-300">Real-time performance tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
              <span className="text-gray-300">Personalised race alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
              <span className="text-gray-300">Form guide insights</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
              <span className="text-gray-300">Market movement notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
              <span className="text-gray-300">Historical statistics & trends</span>
            </div>
          </div>

          <a
            href="/onboarding"
            className="block w-full bg-white hover:bg-gray-100 text-black text-center font-semibold py-4 px-4 transition-colors"
          >
            Get Started
          </a>

          <p className="text-xs text-gray-400 text-center mt-4">
            Free • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
