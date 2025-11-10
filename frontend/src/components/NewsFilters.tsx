'use client';

import { NewsFilters as NewsFiltersType } from '@/types';

interface NewsFiltersProps {
  filters: NewsFiltersType;
  onFilterChange: (filters: NewsFiltersType) => void;
}

export default function NewsFilters({ filters, onFilterChange }: NewsFiltersProps) {
  const handleChange = (key: keyof NewsFiltersType, value: string | undefined) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="entity" className="block text-sm font-medium text-gray-700 mb-1">
            Entity Name
          </label>
          <input
            type="text"
            id="entity"
            placeholder="Horse, jockey, or trainer..."
            value={filters.entity || ''}
            onChange={(e) => handleChange('entity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 mb-1">
            Entity Type
          </label>
          <select
            id="entityType"
            value={filters.entityType || ''}
            onChange={(e) => handleChange('entityType', e.target.value as NewsFiltersType['entityType'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="horse">Horse</option>
            <option value="jockey">Jockey</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>
        <div>
          <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-1">
            Sentiment
          </label>
          <select
            id="sentiment"
            value={filters.sentiment || ''}
            onChange={(e) => handleChange('sentiment', e.target.value as NewsFiltersType['sentiment'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            id="dateFrom"
            value={filters.dateFrom || ''}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
