'use client';

import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            Start comparing odds today
          </h2>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Join thousands of Australian punters who use Racing Life to find the best odds
            and make smarter betting decisions every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white text-base font-semibold cursor-default"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-base font-semibold text-gray-900 cursor-default"
            >
              View Today's Races
            </button>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required · Free forever · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
