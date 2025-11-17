'use client';

export default function CTASection() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Email Signup */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
              Your complete racing intelligence platform
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of Australian punters using Racing Life to make smarter betting
              decisions. Get started today, completely free.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
            </form>

            <p className="text-sm text-gray-500">
              Free forever · No credit card required · 50,000+ active users
            </p>
          </div>

          {/* Right: Platform Features */}
          <div className="border-2 border-gray-900 bg-gray-50 p-8 relative">
            <div className="absolute -top-4 left-6 bg-gray-900 px-3 py-1">
              <span className="text-sm font-semibold text-white uppercase tracking-wider">
                Everything You Need
              </span>
            </div>
            <ul className="space-y-4 mt-2">
              <li className="flex items-start gap-3">
                <span className="text-gray-900 mt-1">✓</span>
                <span className="text-gray-900 font-medium">
                  Live odds comparison across all major bookmakers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 mt-1">✓</span>
                <span className="text-gray-900 font-medium">
                  AI-powered form analysis and expert tips
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 mt-1">✓</span>
                <span className="text-gray-900 font-medium">
                  Track your favourite horses, jockeys, and trainers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 mt-1">✓</span>
                <span className="text-gray-900 font-medium">
                  Instant alerts for market movements and race entries
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 mt-1">✓</span>
                <span className="text-gray-900 font-medium">
                  Complete race schedules and comprehensive form guides
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
