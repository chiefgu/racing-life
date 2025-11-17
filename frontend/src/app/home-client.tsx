'use client';

import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import HeroSectionSplit from '@/components/home/HeroSectionSplit';
import LiveRacesSection from '@/components/home/LiveRacesSection';
import NewsSection from '@/components/home/NewsSection';
import CTASection from '@/components/home/CTASection';

export default function HomeClient() {
  return (
    <div className="flex flex-col min-h-screen">
      <EditorialHeader />
      <main className="flex-1">
        <HeroSectionSplit />
        <LiveRacesSection />
        <NewsSection />

        {/* Full Width Advertisement Banner */}
        <section className="w-full bg-brand-primary-intense border-y border-gray-700">
          <div className="h-[150px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">AD</span>
              </div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Advertisement Space
              </p>
              <p className="text-xs text-gray-400 mt-1">Full Width Banner · 1920x150</p>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <ModernFooter />
    </div>
  );
}
