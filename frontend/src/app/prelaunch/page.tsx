'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Lock } from 'lucide-react';

export default function PrelaunchPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to your email service
    console.log('Email submitted:', email);
    setSubmitted(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check password and set cookie if correct
    if (password === process.env.NEXT_PUBLIC_SITE_PASSWORD) {
      // Set cookie for 7 days
      document.cookie = `site_access=true; path=/; max-age=${60 * 60 * 24 * 7}`;
      // Redirect to homepage
      window.location.href = '/';
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simplified Header */}
      <header className="border-b border-gray-900">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Logo */}
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-2xl font-serif font-bold text-black tracking-tight hover:opacity-70 transition-opacity"
            >
              Racing Life
            </Link>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors"
            >
              <Lock className="w-4 h-4" />
              Enter Site
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div className="border-t border-brand-primary/20 bg-brand-primary">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center h-10">
              <div className="flex items-center gap-6 overflow-x-auto">
                <span className="text-xs font-semibold text-gray-300 whitespace-nowrap uppercase tracking-wide">
                  Odds Comparison
                </span>
                <span className="text-xs font-semibold text-gray-300 whitespace-nowrap uppercase tracking-wide">
                  Expert Analysis
                </span>
                <span className="text-xs font-semibold text-gray-300 whitespace-nowrap uppercase tracking-wide">
                  AI Sentiment
                </span>
                <span className="text-xs font-semibold text-gray-300 whitespace-nowrap uppercase tracking-wide">
                  Race Coverage
                </span>
                <span className="text-xs font-semibold text-gray-300 whitespace-nowrap uppercase tracking-wide">
                  Market Updates
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-[1400px] mx-auto px-6 w-full py-12">
          <div className="grid lg:grid-cols-[1fr,1.2fr] gap-16 items-start">
            {/* Left Column - Branding & Copy */}
            <div className="lg:sticky lg:top-12">
              <h2 className="text-[2.5rem] font-serif font-bold text-gray-900 mb-6 leading-[1.1]">
                Launching Soon: Australia's Premier Racing Intelligence Platform
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Be first to access Australia's most comprehensive racing platform. Get{' '}
                <span className="font-bold text-gray-900">free daily expert tips</span> from
                professional analysts, exclusive odds comparison tools, and instant market insights
                delivered to your inbox.
              </p>

              <div className="space-y-4 border-l-2 border-gray-900 pl-6">
                <div>
                  <h4 className="text-xl font-serif font-bold text-gray-900 mb-1">
                    Live Odds Comparison
                  </h4>
                  <p className="text-lg text-gray-600">10+ bookmakers compared in real-time</p>
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-gray-900 mb-1">
                    Expert Analysis
                  </h4>
                  <p className="text-lg text-gray-600">Professional tips for every major meeting</p>
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-gray-900 mb-1">Breaking News</h4>
                  <p className="text-lg text-gray-600">Track conditions & market movements</p>
                </div>
              </div>
            </div>

            {/* Right Column - Video + Form */}
            <div>
              {/* Vimeo Video */}
              <div className="mb-8">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://player.vimeo.com/video/YOUR_VIDEO_ID?badge=0&autopause=0&player_id=0&app_id=58479"
                    className="absolute top-0 left-0 w-full h-full border-2 border-gray-900"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    title="Racing Life Preview"
                  />
                </div>
              </div>
              {!submitted ? (
                <div className="border-2 border-gray-900 p-12 bg-gray-50">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                    Get Early Access
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-6 py-4 border-2 border-gray-900 text-base focus:outline-none focus:border-black mb-6"
                    />
                    <button
                      type="submit"
                      className="w-full px-8 py-5 bg-black text-white text-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
                    >
                      Claim Free Daily Tips
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </button>
                    <p className="text-xs text-gray-500 mt-6 uppercase tracking-wider">
                      No Credit Card · Cancel Anytime
                    </p>
                  </form>
                </div>
              ) : (
                <div className="border-2 border-gray-900 p-12 bg-gray-50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-bold text-gray-900 mb-3">
                        Welcome to Racing Life
                      </h3>
                      <p className="text-base text-gray-700 leading-relaxed">
                        Check your inbox to confirm your subscription. Your first edition of expert
                        racing analysis arrives tomorrow morning at 6am.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white border-2 border-gray-900 p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6" />
              <h3 className="text-2xl font-serif font-bold text-gray-900">Enter Site Password</h3>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter password"
                required
                autoFocus
                className="w-full px-4 py-3 border-2 border-gray-900 text-base focus:outline-none focus:border-black mb-4"
              />
              {passwordError && <p className="text-sm text-red-600 mb-4">{passwordError}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  Enter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="px-6 py-3 border-2 border-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
