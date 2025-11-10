'use client';

import Link from 'next/link';

const racingGuides = [
  {
    id: '1',
    title: 'Beginner\'s Guide to Reading Form',
    category: 'Betting Basics',
    description: 'Learn how to read and interpret racing form guides like a professional punter. We break down every symbol, stat, and indicator you need to know.',
    author: 'Tom Richardson',
    readTime: '8 min read',
    updated: 'Updated Nov 2025',
  },
  {
    id: '2',
    title: 'Understanding Track Conditions',
    category: 'Advanced Strategy',
    description: 'How different track conditions affect horse performance and betting markets. From firm to heavy, learn which horses excel in each condition.',
    author: 'Emma Davies',
    readTime: '6 min read',
    updated: 'Updated Nov 2025',
  },
  {
    id: '3',
    title: 'Jockey & Trainer Statistics Guide',
    category: 'Form Analysis',
    description: 'Master the art of analyzing jockey and trainer statistics to identify winning patterns and profitable betting opportunities.',
    author: 'Michael Chen',
    readTime: '10 min read',
    updated: 'Updated Oct 2025',
  },
];

const expertTips = [
  {
    id: '1',
    race: 'Flemington R4',
    time: 'Today 2:15 PM',
    tip: 'Thunder Bolt',
    odds: '$3.50',
    bookmaker: 'TAB',
    reasoning: 'Dominant track work this week, barrier 3 is ideal for this run style. Expect to lead and kick clear.',
    tipster: 'Sarah Mitchell',
  },
  {
    id: '2',
    race: 'Randwick R6',
    time: 'Today 2:45 PM',
    tip: 'Lightning Strike',
    odds: '$4.20',
    bookmaker: 'Sportsbet',
    reasoning: 'Strong form but drawing wide. Needs luck from the gate but has the class to overcome.',
    tipster: 'James Wilson',
  },
];

export default function FeaturesSection() {
  return (
    <>
      {/* Expert Tips Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-900">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                Today's Expert Tips
              </h2>
              <p className="text-gray-600">
                Professional racing tips from our team of expert analysts
              </p>
            </div>
            <Link
              href="/tips"
              className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600"
            >
              View all tips →
            </Link>
          </div>

          <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
            {/* Tips Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {expertTips.map((tip) => (
                <div key={tip.id} className="bg-white border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {tip.race} · {tip.time}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">
                        {tip.tip}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">{tip.odds}</span>
                        <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 border border-gray-200">
                          <div className="w-5 h-5 bg-gray-900 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">{tip.bookmaker.substring(0, 3)}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{tip.bookmaker}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4 pb-4 border-b border-gray-200">
                    {tip.reasoning}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                      <span className="font-medium">Tip by {tip.tipster}</span>
                    </div>
                    <Link
                      href={`/tips/${tip.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600"
                    >
                      Full analysis →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter Sidebar */}
            <div className="bg-white border border-gray-200 p-8 h-fit sticky top-24">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                Never Miss a Winner
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get expert tips, odds alerts, and breaking news delivered to your inbox every morning.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900"
                />
                <button
                  type="submit"
                  className="w-full px-8 py-3 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-4">
                Join 50,000+ subscribers. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Racing Guides Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-900">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                Betting Guides & Strategy
              </h2>
              <p className="text-gray-600">
                Master the fundamentals and advanced strategies of horse racing betting
              </p>
            </div>
            <Link
              href="/guides"
              className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600"
            >
              View all guides →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {racingGuides.slice(0, 2).map((guide) => (
              <article key={guide.id} className="group border border-gray-200 hover:border-gray-900 transition-all">
                <Link href={`/guides/${guide.id}`}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      <span>{guide.category}</span>
                      <span>·</span>
                      <span>{guide.readTime}</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors leading-tight">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{guide.author}</span>
                      </div>
                      <span className="text-xs text-gray-500">{guide.updated}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}

            {/* Advertisement Space */}
            <div className="border border-gray-300 bg-gray-50 flex flex-col">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-20 h-20 bg-gray-900 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">AD</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Sponsored Content
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Premium advertising space available
                </p>
                <a
                  href="/advertise"
                  className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-900 hover:border-gray-600 inline-block"
                >
                  Learn More →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
