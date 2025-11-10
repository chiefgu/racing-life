'use client';

import { useNews } from '@/hooks/api/useNews';
import { format } from 'date-fns';

export default function NewsSection() {
  const { data, isLoading } = useNews();

  const mockArticles = [
    {
      id: '1',
      title: 'Thunder Bolt Dominates Morning Track Work',
      description: 'The Melbourne Cup favorite impressed onlookers with a blistering gallop at Flemington this morning, clocking the fastest time of the session and cementing his position as the one to beat.',
      excerpt: 'The Melbourne Cup favorite impressed onlookers with a blistering gallop at Flemington this morning, clocking the fastest time of the session.',
      publishedAt: new Date().toISOString(),
      author: 'Sarah Mitchell',
      source: 'Racing Post',
      category: 'Track Work',
      readTime: '3 min read',
      sentiment: { overall: 'positive', score: 0.85 },
      entities: { horses: ['Thunder Bolt'], jockeys: ['J. McDonald'], trainers: ['C. Waller'] },
    },
    {
      id: '2',
      title: 'Weather Concerns for Golden Slipper Day',
      description: 'Heavy rain predicted for Saturday could turn Rosehill into a heavy track, affecting betting markets significantly.',
      excerpt: 'Track conditions could play a major role in this year\'s Golden Slipper.',
      publishedAt: new Date().toISOString(),
      author: 'Michael Chen',
      source: 'SMH Racing',
      category: 'Preview',
      readTime: '4 min read',
      sentiment: { overall: 'neutral', score: 0.45 },
      entities: { horses: [], jockeys: [], trainers: [] },
    },
    {
      id: '3',
      title: 'Injury Rules Out Star Mare from Spring Carnival',
      description: 'Connections confirm that Winx\'s daughter will miss the remainder of the spring racing season due to a tendon injury.',
      excerpt: 'Disappointing news for connections as rising star suffers setback.',
      publishedAt: new Date().toISOString(),
      author: 'James Wilson',
      source: 'Racing.com',
      category: 'Breaking',
      readTime: '2 min read',
      sentiment: { overall: 'negative', score: 0.25 },
      entities: { horses: ['Winx Jr'], jockeys: [], trainers: ['G. Waterhouse'] },
    },
    {
      id: '4',
      title: 'Cox Plate Favourite Draws Barrier One',
      description: 'Racing experts say the inside barrier gives the champion an ideal position to control the race from the front.',
      excerpt: 'Barrier draw provides perfect scenario for defending champion.',
      publishedAt: new Date().toISOString(),
      author: 'Emma Thompson',
      source: 'The Age',
      category: 'Analysis',
      readTime: '5 min read',
      sentiment: { overall: 'positive', score: 0.75 },
      entities: { horses: ['Anamoe'], jockeys: [], trainers: [] },
    },
    {
      id: '5',
      title: 'Spring Racing Carnival: Complete Guide to Melbourne Cup Week',
      description: 'Everything you need to know about the biggest week in Australian racing, from Derby Day through to Stakes Day.',
      excerpt: 'Your comprehensive guide to the Spring Racing Carnival.',
      publishedAt: new Date().toISOString(),
      author: 'Racing Life Staff',
      source: 'Racing Life',
      category: 'Feature',
      readTime: '12 min read',
      sentiment: { overall: 'positive', score: 0.65 },
      entities: { horses: [], jockeys: [], trainers: [] },
    },
  ];

  const articles = (Array.isArray(data) ? data : mockArticles);
  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 5);

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-900">
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              Racing News & Analysis
            </h2>
            <p className="text-gray-600">
              Expert insights, breaking news, and in-depth racing coverage
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-900 border-b border-gray-900 cursor-default">
            View all articles →
          </span>
        </div>

        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200"></div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Featured Article */}
            <div className="group cursor-default mb-12 pb-12 border-b border-gray-200">
              <div className="grid lg:grid-cols-[2fr,1fr] gap-12">
                <div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    <span className="bg-black text-white px-2 py-1">{featuredArticle.category}</span>
                    <span>{featuredArticle.source}</span>
                    <span>·</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    {featuredArticle.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                      <span className="font-medium">{featuredArticle.author}</span>
                    </div>
                    <span>·</span>
                    <time>{format(new Date(featuredArticle.publishedAt), 'MMM d, yyyy')}</time>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300"></div>
                </div>
              </div>
            </div>

            {/* Secondary Articles Grid */}
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {secondaryArticles.map((article: any) => (
                <article key={article.id} className="group cursor-default">
                  <div>
                    <div className="aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300 mb-4"></div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      <span>{article.category}</span>
                      <span>·</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <span>{article.author}</span>
                      </div>
                      <span>·</span>
                      <time>{format(new Date(article.publishedAt), 'MMM d')}</time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
