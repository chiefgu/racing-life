import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { NewsArticle } from '@/types';

export function useNews(filters?: Record<string, any>) {
  return useQuery<{ articles: NewsArticle[] }>({
    queryKey: ['news', filters],
    queryFn: async () => {
      const response = await api.getNews(filters);
      return response; // api.getNews already returns the data
    },
  });
}

export function usePersonalizedNews() {
  return useQuery({
    queryKey: ['news', 'personalized'],
    queryFn: async () => {
      const response = await api.getPersonalizedNews();
      return response; // api.getPersonalizedNews already returns the data
    },
  });
}

export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const response = await api.getNewsArticle(id);
      return response; // api.getNewsArticle already returns the data
    },
    enabled: !!id,
  });
}