import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-900 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <Link href="/" className="inline-block mb-4">
                <h3 className="text-3xl font-serif font-bold text-gray-900">Racing Life</h3>
              </Link>
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
                  <Link href="/races" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Today&apos;s Races
                  </Link>
                </li>
                <li>
                  <Link href="/odds-comparison" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Odds Comparison
                  </Link>
                </li>
                <li>
                  <Link href="/results" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Results
                  </Link>
                </li>
                <li>
                  <Link href="/form-guides" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Form Guides
                  </Link>
                </li>
                <li>
                  <Link href="/sentiment" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    AI Sentiment
                  </Link>
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
                  <Link href="/news" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="/insights" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link href="/tips" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Expert Tips
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Betting Guides
                  </Link>
                </li>
                <li>
                  <Link href="/bookmakers" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Bookmaker Reviews
                  </Link>
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
                  <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/ambassadors" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Ambassadors
                  </Link>
                </li>
                <li>
                  <Link href="/advertise" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Advertise
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Contact
                  </Link>
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
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/responsible-gambling" className="hover:text-gray-900 transition-colors">
                Responsible Gambling
              </Link>
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
