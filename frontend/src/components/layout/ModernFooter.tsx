export default function ModernFooter() {
  return (
    <footer className="bg-white border-t border-gray-900 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="inline-block mb-4 cursor-default">
                <h3 className="text-3xl font-serif font-bold text-gray-900">Racing Life</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-md">
                Australia's premier destination for horse racing odds comparison, expert analysis, and breaking news. Compare live odds from 10+ bookmakers and make informed betting decisions.
              </p>

              {/* Newsletter Signup */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                  Daily Newsletter
                </h4>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-900"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Racing Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-900">
                Racing
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Today&apos;s Races
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Odds Comparison
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Results
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Form Guides
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    AI Sentiment
                  </span>
                </li>
              </ul>
            </div>

            {/* Content Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-900">
                Content
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    News
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Insights
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Expert Tips
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Betting Guides
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Bookmaker Reviews
                  </span>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-900">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    About Us
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Ambassadors
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Advertise
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 cursor-default">
                    Contact
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
              <span>© {new Date().getFullYear()} Racing Life. All rights reserved.</span>
              <span className="cursor-default">
                Terms of Service
              </span>
              <span className="cursor-default">
                Privacy Policy
              </span>
              <span className="cursor-default">
                Responsible Gambling
              </span>
            </div>
            <div className="text-xs text-gray-500">
              18+ · Gamble Responsibly
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
