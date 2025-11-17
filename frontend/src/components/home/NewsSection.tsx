'use client';

import { useNews } from '@/hooks/api/useNews';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedOrb from '@/components/shared/AnimatedOrb';

export default function NewsSection() {
  const { data, isLoading } = useNews();

  const mockArticles = [
    {
      id: '1',
      title: 'Thunder Bolt Dominates Morning Track Work',
      description:
        'The Melbourne Cup favorite impressed onlookers with a blistering gallop at Flemington this morning, clocking the fastest time of the session and cementing his position as the one to beat.',
      excerpt:
        'The Melbourne Cup favorite impressed onlookers with a blistering gallop at Flemington this morning, clocking the fastest time of the session.',
      publishedAt: new Date().toISOString(),
      author: 'Sarah Mitchell',
      authorImage:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      image: '/blog2.jpg',
      source: 'Racing Post',
      category: 'Track Work',
      readTime: '3 min read',
      sentiment: { overall: 'positive', score: 0.85 },
      entities: { horses: ['Thunder Bolt'], jockeys: ['J. McDonald'], trainers: ['C. Waller'] },
    },
    {
      id: '2',
      title: 'Weather Concerns for Golden Slipper Day',
      description:
        'Heavy rain predicted for Saturday could turn Rosehill into a heavy track, affecting betting markets significantly.',
      excerpt: "Track conditions could play a major role in this year's Golden Slipper.",
      publishedAt: new Date().toISOString(),
      author: 'Michael Chen',
      authorImage:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      image: '/blog3.jpg',
      source: 'SMH Racing',
      category: 'Preview',
      readTime: '4 min read',
      sentiment: { overall: 'neutral', score: 0.45 },
      entities: { horses: [], jockeys: [], trainers: [] },
    },
    {
      id: '3',
      title: 'Injury Rules Out Star Mare from Spring Carnival',
      description:
        "Connections confirm that Winx's daughter will miss the remainder of the spring racing season due to a tendon injury.",
      excerpt: 'Disappointing news for connections as rising star suffers setback.',
      publishedAt: new Date().toISOString(),
      author: 'James Wilson',
      authorImage:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      image: '/blog1.jpg',
      source: 'Racing.com',
      category: 'Breaking',
      readTime: '2 min read',
      sentiment: { overall: 'negative', score: 0.25 },
      entities: { horses: ['Winx Jr'], jockeys: [], trainers: ['G. Waterhouse'] },
    },
    {
      id: '4',
      title: 'Cox Plate Favourite Draws Barrier One',
      description:
        'Racing experts say the inside barrier gives the champion an ideal position to control the race from the front.',
      excerpt: 'Barrier draw provides perfect scenario for defending champion.',
      publishedAt: new Date().toISOString(),
      author: 'Emma Thompson',
      authorImage:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      image:
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop&q=80',
      source: 'The Age',
      category: 'Analysis',
      readTime: '5 min read',
      sentiment: { overall: 'positive', score: 0.75 },
      entities: { horses: ['Anamoe'], jockeys: [], trainers: [] },
    },
    {
      id: '5',
      title: 'Spring Racing Carnival: Complete Guide to Melbourne Cup Week',
      description:
        'Everything you need to know about the biggest week in Australian racing, from Derby Day through to Stakes Day.',
      excerpt: 'Your comprehensive guide to the Spring Racing Carnival.',
      publishedAt: new Date().toISOString(),
      author: 'Racing Life Staff',
      authorImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      image:
        'https://images.unsplash.com/photo-1534609104632-c1d58b9a1e6e?w=800&h=600&fit=crop&q=80',
      source: 'Racing Life',
      category: 'Feature',
      readTime: '12 min read',
      sentiment: { overall: 'positive', score: 0.65 },
      entities: { horses: [], jockeys: [], trainers: [] },
    },
  ];

  const articles = Array.isArray(data) ? data : mockArticles;
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
            <Link href={`/news/${featuredArticle.id}`} className="group cursor-pointer mb-12 pb-12 border-b border-gray-200 block hover:bg-gray-50 transition-colors -mx-6 px-6">
              <div className="grid lg:grid-cols-[2fr,1fr] gap-12">
                <div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    <span className="bg-black text-white px-2 py-1">
                      {featuredArticle.category}
                    </span>
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
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                        <Image
                          src={featuredArticle.authorImage}
                          alt={featuredArticle.author}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium">{featuredArticle.author}</span>
                    </div>
                    <span>·</span>
                    <time>{format(new Date(featuredArticle.publishedAt), 'MMM d, yyyy')}</time>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </Link>

            {/* Secondary Grid - Consistent 3-column grid for both rows */}
            <div className="space-y-8">
              {/* Row 1: 2 Articles + AI Analyst */}
              <div className="grid lg:grid-cols-3 gap-8">
                {secondaryArticles.slice(0, 2).map((article: any) => (
                  <Link href={`/news/${article.id}`} key={article.id} className="group cursor-pointer block hover:bg-gray-50 transition-colors -mx-4 px-4 -my-4 py-4">
                    <div>
                      <div className="aspect-[16/9] mb-4 overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          width={600}
                          height={338}
                          className="w-full h-full object-cover"
                        />
                      </div>
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
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                            <Image
                              src={article.authorImage}
                              alt={article.author}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{article.author}</span>
                        </div>
                        <span>·</span>
                        <time>{format(new Date(article.publishedAt), 'MMM d')}</time>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* AI Analyst Builder */}
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
