'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import AnimatedOrb from '@/components/shared/AnimatedOrb';

export default function AIHeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const exampleQueries = [
    'Which horse should I bet on at Flemington today?',
    'Show me the best odds for Race 4 at Randwick',
    'What are the track conditions at Caulfield?',
    "Tell me about Nature Strip's recent form",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Navigate to AI analyst with query
    console.log('Search query:', searchQuery);
  };

  return (
    <section className="bg-gradient-to-b from-white to-brand-light py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Main Hero Content */}
        <div className="text-center mb-12">
          {/* Animated Orb */}
          <div className="flex justify-center mb-6">
            <AnimatedOrb size="large" energy={65} />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            Your AI Racing Analyst
          </h1>

          {/* Subheadline - Beginner Friendly */}
          <p className="text-xl md:text-2xl text-gray-600 mb-3 max-w-2xl mx-auto">
            New to racing? No worries. Ask anything about horses, odds, or races.
          </p>

          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Get instant answers, compare odds from top bookmakers, and discover winning insights—all
            in plain English.
          </p>
        </div>

        {/* Large Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div
            className={`relative bg-white rounded-full shadow-lg transition-all duration-300 ${
              isFocused ? 'shadow-2xl ring-2 ring-brand-primary' : 'hover:shadow-xl'
            }`}
          >
            <div className="flex items-center px-6 py-4">
              <Search className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask me anything about racing..."
                className="flex-1 text-lg outline-none text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="ml-4 bg-brand-primary hover:bg-brand-primary-intense text-white px-6 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Example Queries */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3 font-medium">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(query)}
                className="text-sm bg-white hover:bg-brand-light border border-gray-200 hover:border-brand-primary text-gray-700 hover:text-brand-primary px-4 py-2 rounded-full transition-all duration-200"
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-brand-primary mb-2">24/7</div>
            <div className="text-sm text-gray-600">Always ready to help with instant answers</div>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-brand-primary mb-2">10+</div>
            <div className="text-sm text-gray-600">Bookmakers compared for best odds</div>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-brand-primary mb-2">100%</div>
            <div className="text-sm text-gray-600">Free to use, no hidden costs</div>
          </div>
        </div>

        {/* CTA for beginners */}
        <div className="mt-12 text-center">
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Get Started - It's Free
          </a>
          <p className="text-sm text-gray-500 mt-3">
            No experience needed • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
