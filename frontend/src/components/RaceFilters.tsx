'use client';

import { RaceFilters as RaceFiltersType } from '@/types';

interface RaceFiltersProps {
  filters: RaceFiltersType;
  onFilterChange: (filters: RaceFiltersType) => void;
}

export default function RaceFilters({ filters, onFilterChange }: RaceFiltersProps) {
  const handleChange = (key: keyof RaceFiltersType, value: string | undefined) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search races..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location"
            value={filters.meetingLocation || ''}
            onChange={(e) => handleChange('meetingLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            <option value="Flemington">Flemington</option>
            <option value="Randwick">Randwick</option>
            <option value="Caulfield">Caulfield</option>
            <option value="Rosehill">Rosehill</option>
            <option value="Eagle Farm">Eagle Farm</option>
            <option value="Morphettville">Morphettville</option>
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={filters.date || ''}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value as RaceFiltersType['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="resulted">Resulted</option>
          </select>
        </div>
      </div>
    </div>
  );
}
