'use client';

import Link from 'next/link';

export default function LogoTestPage() {
  const logoOptions = [
    {
      id: 1,
      name: 'Bold Sans with Underline Accent',
      render: () => (
        <div className="relative inline-block">
          <span className="font-sans" style={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
            Racing Life
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary" style={{ width: '40%' }}></div>
        </div>
      ),
    },
    {
      id: 2,
      name: 'Mixed Weight - Bold/Light',
      render: () => (
        <span className="font-sans">
          <span style={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Racing</span>
          {' '}
          <span style={{ fontWeight: 300, letterSpacing: '0.05em' }}>Life</span>
        </span>
      ),
    },
    {
      id: 3,
      name: 'Small Caps Modern',
      render: () => (
        <span className="font-sans" style={{ fontWeight: 700, fontVariant: 'small-caps', letterSpacing: '0.1em' }}>
          Racing Life
        </span>
      ),
    },
    {
      id: 4,
      name: 'Condensed Uppercase',
      render: () => (
        <span className="font-sans uppercase" style={{ fontWeight: 800, letterSpacing: '0.05em', fontStretch: 'condensed' }}>
          Racing Life
        </span>
      ),
    },
    {
      id: 5,
      name: 'Serif Display',
      render: () => (
        <span className="font-serif" style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
          Racing Life
        </span>
      ),
    },
    {
      id: 6,
      name: 'Two-Tone Sans',
      render: () => (
        <span className="font-sans" style={{ fontWeight: 800 }}>
          <span className="text-gray-900">Racing</span>
          {' '}
          <span className="text-brand-primary">Life</span>
        </span>
      ),
    },
    {
      id: 7,
      name: 'Slanted Modern',
      render: () => (
        <span className="font-sans" style={{ fontWeight: 700, transform: 'skewX(-8deg)', display: 'inline-block', letterSpacing: '0.02em' }}>
          Racing Life
        </span>
      ),
    },
    {
      id: 8,
      name: 'Elegant Serif Light',
      render: () => (
        <span className="font-serif" style={{ fontWeight: 300, fontSize: '1.1em', letterSpacing: '0.08em' }}>
          RACING LIFE
        </span>
      ),
    },
    {
      id: 9,
      name: 'Heavy Sans Tight',
      render: () => (
        <span className="font-sans uppercase" style={{ fontWeight: 900, letterSpacing: '-0.05em' }}>
          Racing Life
        </span>
      ),
    },
    {
      id: 10,
      name: 'Classic Newspaper',
      render: () => (
        <span className="font-serif" style={{ fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Racing Life
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-brand-primary">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Logo Font Options</h1>
          <p className="text-gray-600 mt-2">Choose your preferred Racing Life logo style</p>
        </div>

        <div className="space-y-8">
          {logoOptions.map((option) => (
            <div
              key={option.id}
              className="border-2 border-gray-200 hover:border-brand-primary transition-colors p-8 rounded-lg bg-white"
            >
              <div className="mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Option {option.id}
                </span>
                <span className="text-xs text-gray-400 ml-3">{option.name}</span>
              </div>

              {/* Logo Preview */}
              <div className="flex items-center justify-center py-12 bg-gray-50 rounded">
                <div className="text-4xl text-brand-primary">
                  {option.render()}
                </div>
              </div>

              {/* On Dark Background */}
              <div className="flex items-center justify-center py-8 bg-gray-900 rounded mt-4">
                <div className="text-3xl text-white">
                  {option.render()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
