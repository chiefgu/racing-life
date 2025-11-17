'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Implement actual newsletter signup API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      setEmail('');

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border-2 border-green-500 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            You're subscribed!
          </h3>
          <p className="text-gray-700">
            Check your inbox for a confirmation email. We'll keep you updated with the latest racing news and analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-primary text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-3xl font-serif font-bold mb-3">
          Get Racing Insights in Your Inbox
        </h3>

        <p className="text-white/90 mb-6 text-lg">
          Join thousands of racing enthusiasts receiving expert analysis, breaking news, and exclusive tips delivered weekly.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-brand-primary font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-red-200 text-sm">{error}</p>
        )}

        <p className="text-xs text-white/70 mt-4">
          We respect your privacy. Unsubscribe at any time. No spam, ever.
        </p>
      </div>
    </div>
  );
}
