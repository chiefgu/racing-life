'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AIAnalystPage() {
  const router = useRouter();

  useEffect(() => {
    // For now, redirect to home page
    // TODO: Implement full AI Analyst page with dedicated chat interface
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to AI Analyst...</h1>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}
