'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthButtons({ mobile = false }: { mobile?: boolean }) {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <>
        <Link
          href="/account"
          className={`font-medium text-gray-700 hover:text-racing-blue ${
            mobile ? 'block px-3 py-2 text-base' : 'text-sm'
          }`}
        >
          {user?.name}
        </Link>
        <button
          onClick={logout}
          className={`font-medium text-gray-700 hover:text-racing-blue text-left ${
            mobile ? 'block px-3 py-2 text-base w-full' : 'text-sm'
          }`}
        >
          Logout
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className={`font-medium text-gray-700 hover:text-racing-blue ${
          mobile ? 'block px-3 py-2 text-base' : 'text-sm'
        }`}
      >
        Login
      </Link>
      <Link
        href="/register"
        className={`inline-flex items-center justify-center border border-transparent font-medium rounded-md text-white bg-racing-blue hover:bg-racing-blue/90 ${
          mobile ? 'px-3 py-2 text-base w-full' : 'px-4 py-2 text-sm'
        }`}
      >
        Sign Up
      </Link>
    </>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const navLinks = [
    { href: '/', label: 'Home', exact: true },
    { href: '/races', label: 'Racecards' },
    { href: '/news', label: 'Racing News' },
    { href: '/ambassadors', label: 'Tips' },
    { href: '/bookmakers', label: 'Ante-Post' },
  ];

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Racing Life"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  (link.exact ? pathname === link.href : isActive(link.href))
                    ? 'text-racing-blue font-semibold'
                    : 'text-gray-700 hover:text-racing-blue'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link href="/bookmakers" className="text-sm font-medium text-racing-green hover:text-racing-green/80">
              Free Bets
            </Link>
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-racing-blue"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  (link.exact ? pathname === link.href : isActive(link.href))
                    ? 'bg-racing-blue/10 text-racing-blue'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-racing-blue'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/bookmakers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-racing-green hover:bg-gray-100"
            >
              Free Bets
            </Link>
          </nav>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              <AuthButtons mobile />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
