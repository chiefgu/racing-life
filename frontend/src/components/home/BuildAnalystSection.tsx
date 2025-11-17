'use client';

import Link from 'next/link';

export default function BuildAnalystSection() {
  return (
    <section className="bg-white border-y-4 border-brand-dark-intense">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="border-4 border-brand-dark-intense bg-white p-8">
          <div className="text-center border-b-2 border-brand-dark-intense pb-6 mb-6">
            <h2 className="text-3xl font-serif font-bold text-brand-dark-intense mb-2 uppercase tracking-tight">
              Premium Membership
            </h2>
            <p className="text-sm text-brand-dark-muted uppercase tracking-wider">
              Australia's Premier Racing Intelligence Platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div>
              <h3 className="font-bold text-brand-dark-intense mb-4 uppercase tracking-wide text-sm border-b border-brand-ui pb-2">
                Member Benefits
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Real-time race alerts</strong> for your favorite jockeys, trainers, and
                    tracks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>AI-powered predictions</strong> analyzing thousands of data points
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Best odds comparison</strong> across all major bookmakers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Exclusive form guides</strong> and expert analysis
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Historical performance data</strong> and winning trends
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Personalized dashboard</strong> tailored to your preferences
                  </span>
                </li>
              </ul>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="font-bold text-brand-dark-intense mb-4 uppercase tracking-wide text-sm border-b border-brand-ui pb-2">
                Subscription Details
              </h3>
              <div className="bg-brand-light-muted border border-brand-ui p-6 mb-4">
                <div className="mb-4">
                  <div className="text-xs text-brand-dark-muted uppercase tracking-wider mb-1">
                    Monthly
                  </div>
                  <div className="text-3xl font-serif font-bold text-brand-dark-intense">
                    $29.95
                    <span className="text-base font-normal text-brand-dark-muted">/month</span>
                  </div>
                </div>
                <div className="text-xs text-brand-dark-muted mb-4">
                  Cancel anytime. First 7 days free.
                </div>
                <Link
                  href="/onboarding"
                  className="block w-full py-3 bg-brand-dark-intense hover:bg-brand-primary text-white text-center font-bold uppercase tracking-wide text-sm transition-colors"
                >
                  Subscribe Now
                </Link>
              </div>

              <div className="text-xs text-brand-dark-muted text-center">
                <p className="mb-2">Already a member?</p>
                <Link
                  href="/onboarding"
                  className="font-bold text-brand-dark-intense hover:text-brand-primary underline"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-brand-dark-intense pt-4 text-center">
            <p className="text-xs text-brand-dark-muted">
              Join over 50,000 members making smarter betting decisions every day
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
