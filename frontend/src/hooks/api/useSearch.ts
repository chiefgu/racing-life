import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface SearchResult {
  id: string;
  type: 'news' | 'horse' | 'jockey' | 'trainer' | 'race';
  title: string;
  subtitle?: string;
  category?: string;
}

export function useSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return [];
      }

      return await apiClient.search(query);
    },
    enabled: query.trim().length > 0,
    staleTime: 30000, // 30 seconds
  });
}
