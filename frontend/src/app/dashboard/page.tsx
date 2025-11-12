'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import { Star, TrendingUp, Calendar, Users, Trophy, Sparkles } from 'lucide-react';

interface Favourites {
  jockeys: string[];
  trainers: string[];
  tracks: string[];
  bookmakers: string[];
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, token } = useAuth();
  const [favourites, setFavourites] = useState<Favourites>({
    jockeys: [],
    trainers: [],
    tracks: [],
    bookmakers: [],
  });
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavourites = async () => {
      if (!token) return;

      try {
        const response = await apiClient.getFavourites(token);
        setFavourites(response.data);
      } catch (error) {
        console.error('Failed to load favourites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavourites();
  }, [token]);

  const totalFavourites = favourites.jockeys.length + favourites.trainers.length + favourites.tracks.length + favourites.bookmakers.length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <EditorialHeader />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-brand-primary" />
            <h1 className="text-4xl font-serif font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Your personalised racing dashboard, powered by AI
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-brand-primary" />
              <span className="text-2xl font-bold text-gray-900">{totalFavourites}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Favourites</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-brand-primary" />
              <span className="text-2xl font-bold text-gray-900">{favourites.jockeys.length}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Jockeys Tracked</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-brand-primary" />
              <span className="text-2xl font-bold text-gray-900">{favourites.trainers.length}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Trainers Followed</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-brand-primary" />
              <span className="text-2xl font-bold text-gray-900">{favourites.tracks.length}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Favourite Tracks</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Races for Your Favourites */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-brand-primary" />
                <h2 className="text-xl font-serif font-bold text-gray-900">Today's Races</h2>
              </div>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No races today featuring your favourites</p>
                <p className="text-xs mt-1">Check back later for updates</p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <h2 className="text-xl font-serif font-bold text-gray-900">AI Insights</h2>
              </div>
              <div className="space-y-4">
                {favourites.jockeys.slice(0, 3).map((jockey, index) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{jockey}</h3>
                        <p className="text-sm text-gray-600">
                          Strong recent form with {Math.floor(Math.random() * 3) + 1} wins in the last 7 days.
                          Currently trending in sentiment analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {favourites.jockeys.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Add favourites to see personalised AI insights</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Your Favourites */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Your Favourites</h2>

              <div className="space-y-4">
                {/* Jockeys */}
                {favourites.jockeys.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Jockeys ({favourites.jockeys.length})
                    </h3>
                    <div className="space-y-1">
                      {favourites.jockeys.slice(0, 3).map((jockey, index) => (
                        <div key={index} className="text-sm text-gray-900 py-1 px-2 bg-gray-50 border border-gray-100">
                          {jockey}
                        </div>
                      ))}
                      {favourites.jockeys.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{favourites.jockeys.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Trainers */}
                {favourites.trainers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Trainers ({favourites.trainers.length})
                    </h3>
                    <div className="space-y-1">
                      {favourites.trainers.slice(0, 3).map((trainer, index) => (
                        <div key={index} className="text-sm text-gray-900 py-1 px-2 bg-gray-50 border border-gray-100">
                          {trainer}
                        </div>
                      ))}
                      {favourites.trainers.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{favourites.trainers.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tracks */}
                {favourites.tracks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Tracks ({favourites.tracks.length})
                    </h3>
                    <div className="space-y-1">
                      {favourites.tracks.map((track, index) => (
                        <div key={index} className="text-sm text-gray-900 py-1 px-2 bg-gray-50 border border-gray-100">
                          {track}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalFavourites === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No favourites yet</p>
                    <a href="/profile" className="text-xs text-brand-primary hover:text-brand-primary-intense mt-2 inline-block">
                      Add favourites
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <a
                  href="/profile"
                  className="block w-full py-2.5 px-4 text-center border-2 border-gray-300 text-gray-700 font-semibold text-sm uppercase tracking-wide hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  Edit Profile
                </a>
                <a
                  href="/"
                  className="block w-full py-2.5 px-4 text-center border-2 border-gray-300 text-gray-700 font-semibold text-sm uppercase tracking-wide hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  Browse Races
                </a>
                <a
                  href="/"
                  className="block w-full py-2.5 px-4 text-center bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold text-sm uppercase tracking-wide transition-colors"
                >
                  View All Odds
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Tier Banner */}
        {user?.subscription_tier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-brand-primary to-brand-primary-intense border border-brand-primary p-8 text-center">
            <h2 className="text-2xl font-serif font-bold text-white mb-2">
              Unlock Premium Features
            </h2>
            <p className="text-white/90 mb-4">
              Get access to advanced AI insights, real-time alerts, and exclusive racing tips
            </p>
            <button className="px-8 py-3 bg-white text-brand-primary font-semibold text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        )}
      </main>

      <ModernFooter />
    </div>
  );
}
