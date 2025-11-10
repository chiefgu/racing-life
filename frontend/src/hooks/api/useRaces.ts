import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useRaces() {
  return useQuery({
    queryKey: ['races'],
    queryFn: async () => {
      const response = await api.getRaces();
      return response; // api.getRaces already returns the data
    },
  });
}

export function useRace(id: string) {
  return useQuery({
    queryKey: ['race', id],
    queryFn: async () => {
      const response = await api.getRace(id);
      return response; // api.getRace already returns the data
    },
    enabled: !!id,
  });
}

export function useRaceOdds(raceId: string) {
  return useQuery({
    queryKey: ['race-odds', raceId],
    queryFn: async () => {
      const response = await api.getRaceOdds(raceId);
      return response; // api.getRaceOdds already returns the data
    },
    enabled: !!raceId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, entityId }: { type: string; entityId: string }) => {
      const response = await api.addToWatchlist(type, entityId);
      return response; // api.addToWatchlist already returns the data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}
