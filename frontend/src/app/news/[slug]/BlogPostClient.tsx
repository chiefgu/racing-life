'use client';

import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import BlogPostHero from '@/components/blog/BlogPostHero';
import BlogPostContent from '@/components/blog/BlogPostContent';
import BlogPostSidebar from '@/components/blog/BlogPostSidebar';
import AuthorBio from '@/components/blog/AuthorBio';
import SocialShare from '@/components/blog/SocialShare';
import Comments from '@/components/blog/Comments';
import NewsletterSignup from '@/components/blog/NewsletterSignup';
import { useNewsArticle } from '@/hooks/api/useNews';

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const { data: article, isLoading } = useNewsArticle(slug);

  // Mock article data for demonstration when API is not available
  const mockArticle = {
    id: slug,
    sourceId: 'racing-life',
    title: 'Thunder Bolt Dominates Morning Track Work Ahead of Cup Day',
    content: `The Melbourne Cup favorite Thunder Bolt impressed onlookers with a blistering gallop at Flemington this morning, clocking the fastest time of the session and cementing his position as the one to beat.

Trainer Chris Waller expressed confidence in the gelding's preparation, noting that the four-year-old has never looked better heading into a major race. "Everything has gone according to plan," Waller said trackside. "He's eating well, his coat is gleaming, and most importantly, he's moving like a champion."

Jockey James McDonald, who will partner Thunder Bolt in next week's feature, was equally enthusiastic about the morning's work. "He gave me a great feel out there," McDonald noted. "The moment I asked him to quicken, he just exploded. That's the sign of a horse who's ready to produce his best."

The impressive workout comes after Thunder Bolt's dominant victory in the Caulfield Cup three weeks ago, where he defeated a quality field by two and a half lengths. That performance saw his Melbourne Cup odds firm dramatically, with most bookmakers now offering him at $3.50.

However, not everyone is convinced Thunder Bolt has the race won. Racing analyst Sarah Mitchell points to the gelding's relative inexperience at the 3200-metre distance. "While his form is undeniable, the Cup is a different beast altogether," Mitchell explained. "We've seen plenty of champions struggle with the extreme distance before."

The weather forecast for Cup day remains a key factor, with light rain predicted throughout the week. Should the track be downgraded to soft or heavy, it could significantly impact Thunder Bolt's chances, as he has previously shown a preference for firmer going.

Chief rival Winx Jr, trained by Gai Waterhouse, worked shortly after Thunder Bolt and also put in a solid performance. The mare's connections remain confident despite her longer odds, citing her proven ability to handle wet conditions as a potential advantage.`,
    author: 'Sarah Mitchell',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    authorBio: 'Senior racing journalist with over 15 years covering Australian thoroughbred racing. Former editor of Australian Racing Monthly.',
    authorSocial: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      email: 'sarah@racinglife.com',
    },
    publishedAt: new Date().toISOString(),
    url: `/news/${slug}`,
    image: '/blog2.jpg',
    category: 'Track Work',
    readTime: '4 min read',
    entities: {
      horses: ['Thunder Bolt', 'Winx Jr'],
      jockeys: ['James McDonald'],
      trainers: ['Chris Waller', 'Gai Waterhouse'],
      meetings: ['Flemington'],
    },
    sentiment: {
      overall: 'positive' as const,
      confidence: 0.85,
      entitySentiments: [],
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <EditorialHeader />
        <main className="flex-1 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 mb-8"></div>
              <div className="h-8 bg-gray-200 mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 w-2/3"></div>
            </div>
          </div>
        </main>
        <ModernFooter />
      </div>
    );
  }

  // Use mock data if article is not found (for demonstration)
  const displayArticle = article || mockArticle;

  return (
    <div className="flex flex-col min-h-screen">
      <EditorialHeader />

      <main className="flex-1 bg-white">
        {/* Main Layout: 2/3 + 1/3 starting from the top */}
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Hero + Content (2/3) */}
            <div className="lg:col-span-2">
              {/* Hero Section */}
              <BlogPostHero article={displayArticle} />

              {/* Article Content */}
              <div className="mt-8">
                <BlogPostContent article={displayArticle} />
              </div>

              {/* Mobile: Interspersed Sidebar Content */}
              <div className="lg:hidden my-12 space-y-8">
                <BlogPostSidebar article={displayArticle} isMobile />
              </div>

              {/* Author Bio */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <AuthorBio article={displayArticle} />
              </div>

              {/* Social Share */}
              <div className="mt-8">
                <SocialShare article={displayArticle} />
              </div>

              {/* Comments Section */}
              <div className="mt-12">
                <Comments articleId={displayArticle.id} />
              </div>

              {/* Newsletter Signup */}
              <div className="mt-12">
                <NewsletterSignup />
              </div>
            </div>

            {/* Right Column: Sidebar (1/3) - Hidden on mobile, starts at top */}
            <div className="hidden lg:block">
              <BlogPostSidebar article={displayArticle} />
            </div>
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}
