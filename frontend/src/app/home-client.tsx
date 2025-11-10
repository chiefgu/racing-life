'use client';

import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import HeroSection from '@/components/home/HeroSection';
import LiveRacesSection from '@/components/home/LiveRacesSection';
import NewsSection from '@/components/home/NewsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import BookmakersSection from '@/components/home/BookmakersSection';
import CTASection from '@/components/home/CTASection';

export default function HomeClient() {
  return (
    <div className="flex flex-col min-h-screen">
      <EditorialHeader />
      <main className="flex-1">
        <HeroSection />
        <LiveRacesSection />
        <NewsSection />
        <FeaturesSection />
        <BookmakersSection />
        <CTASection />
      </main>
      <ModernFooter />
    </div>
  );
}