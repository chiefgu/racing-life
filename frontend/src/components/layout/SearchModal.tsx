'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  FileText,
  Trophy,
  User as UserIcon,
  Loader2,
} from 'lucide-react';
import { useSearch } from '@/hooks/api/useSearch';
import { apiClient } from '@/lib/api-client';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results = [], isLoading } = useSearch(query);

  const handleResultClick = async (resultId: string, resultType: string) => {
    try {
      await apiClient.trackSearchClick({
        resultId,
        resultType,
        query,
      });
    } catch (error) {
      console.error('Failed to track search click:', error);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const popularSearches = [
    'Melbourne Cup',
    'Cox Plate',
    'Golden Slipper',
    'The Everest',
    'Flemington',
    'Randwick',
  ];

  const recentSearches = ['Thunder Bolt', 'J. McDonald', 'Chris Waller'];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Search Modal */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Search Input */}
          <div className="flex items-center gap-4 py-6 border-b border-gray-200">
            <Search className="w-6 h-6 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search races, horses, jockeys, trainers, news..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-lg outline-none placeholder:text-gray-400"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search Results / Suggestions */}
          <div className="py-6 max-h-[60vh] overflow-y-auto">
            {query.length === 0 ? (
              <div className="space-y-8">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Recent Searches
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-900 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Popular Searches
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-900 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="ml-3 text-gray-500">Searching...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result, index) => {
                      const Icon =
                        result.type === 'news'
                          ? FileText
                          : result.type === 'race'
                            ? Trophy
                            : UserIcon;

                      return (
                        <button
                          key={index}
                          onClick={() => handleResultClick(result.id, result.type)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-4"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <Icon className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                              {result.category && (
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  {result.category}
                                </span>
                              )}
                            </div>
                            {result.subtitle && (
                              <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-400 uppercase">
                              {result.type}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No results found for "{query}"</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Try searching for horses, jockeys, trainers, races, or news
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
