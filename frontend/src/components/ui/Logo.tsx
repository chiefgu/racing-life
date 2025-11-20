'use client';

import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-0 group ${className}`}>
      <div className={`font-bold tracking-tight ${sizeClasses[size]} relative`}>
        <span
          className="text-brand-primary font-serif"
          style={{ fontWeight: 700, fontStyle: 'italic' }}
        >
          Racing Life
        </span>
      </div>
    </Link>
  );
}
