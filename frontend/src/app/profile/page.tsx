'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Star, Edit2, Save, X, Loader2 } from 'lucide-react';
import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';

interface Favourites {
  jockeys: string[];
  trainers: string[];
  tracks: string[];
  bookmakers: string[];
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, token, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favourites, setFavourites] = useState<Favourites>({
    jockeys: [],
    trainers: [],
    tracks: [],
    bookmakers: [],
  });
  const [loadingFavourites, setLoadingFavourites] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const loadFavourites = async () => {
      if (!token) return;

      try {
        const response = await apiClient.getFavourites(token);
        setFavourites(response.data);
      } catch (error) {
        console.error('Failed to load favourites:', error);
      } finally {
        setLoadingFavourites(false);
      }
    };

    loadFavourites();
  }, [token]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Update profile name if changed
      if (name !== user?.name) {
        // Note: We'd need to add an updateProfile endpoint in the API
        // For now, this is a placeholder
        console.log('Update name:', name);
      }

      // Change password if provided
      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }

        if (newPassword.length < 8) {
          setError('Password must be at least 8 characters');
          setLoading(false);
          return;
        }

        await apiClient.changePassword(
          { currentPassword, newPassword },
          token!
        );

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      await refreshProfile();
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/onboarding');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <EditorialHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="bg-white border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-intense transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-intense text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                <User className="w-4 h-4" />
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                />
              ) : (
                <p className="text-base text-gray-900 py-2.5">{user.name}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-base text-gray-900 py-2.5">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Subscription Tier */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                <Shield className="w-4 h-4" />
                Subscription
              </label>
              <p className="text-base text-gray-900 py-2.5 capitalize">{user.subscription_tier}</p>
            </div>

            {/* Password Change (only in edit mode) */}
            {isEditing && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
                      className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Favourites */}
        <div className="bg-white border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-brand-primary" />
            <h2 className="text-2xl font-serif font-bold text-gray-900">My Favourites</h2>
          </div>

          {loadingFavourites ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jockeys */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Jockeys ({favourites.jockeys.length})
                </h3>
                {favourites.jockeys.length > 0 ? (
                  <div className="space-y-2">
                    {favourites.jockeys.map((jockey, index) => (
                      <div
                        key={index}
                        className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-800"
                      >
                        {jockey}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No favourite jockeys</p>
                )}
              </div>

              {/* Trainers */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Trainers ({favourites.trainers.length})
                </h3>
                {favourites.trainers.length > 0 ? (
                  <div className="space-y-2">
                    {favourites.trainers.map((trainer, index) => (
                      <div
                        key={index}
                        className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-800"
                      >
                        {trainer}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No favourite trainers</p>
                )}
              </div>

              {/* Tracks */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Tracks ({favourites.tracks.length})
                </h3>
                {favourites.tracks.length > 0 ? (
                  <div className="space-y-2">
                    {favourites.tracks.map((track, index) => (
                      <div
                        key={index}
                        className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-800"
                      >
                        {track}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No favourite tracks</p>
                )}
              </div>

              {/* Bookmakers */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Bookmakers ({favourites.bookmakers.length})
                </h3>
                {favourites.bookmakers.length > 0 ? (
                  <div className="space-y-2">
                    {favourites.bookmakers.map((bookmaker, index) => (
                      <div
                        key={index}
                        className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-800"
                      >
                        {bookmaker}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No favourite bookmakers</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Account Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold text-sm uppercase tracking-wide hover:border-gray-400 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm uppercase tracking-wide transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}
