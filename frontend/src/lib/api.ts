// API client for backend communication
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Required for Safari CORS with cookies
    mode: 'cors', // Explicitly set CORS mode
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'An error occurred',
      response.status,
      errorData
    );
  }

  return response.json();
}

export const api = {
  // Races
  getRaces: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/races?${params}`);
  },
  
  getRace: (id: string) => {
    return fetchApi(`/races/${id}`);
  },
  
  getRaceOdds: (id: string) => {
    return fetchApi(`/races/${id}/odds`);
  },
  
  getRaceHistory: (id: string, params?: Record<string, string>) => {
    const query = new URLSearchParams(params);
    return fetchApi(`/races/${id}/history?${query}`);
  },

  // Bookmakers
  getBookmakers: () => {
    return fetchApi('/bookmakers');
  },
  
  getBookmaker: (id: string) => {
    return fetchApi(`/bookmakers/${id}`);
  },
  
  getBookmakerPromotions: (id: string) => {
    return fetchApi(`/bookmakers/${id}/promotions`);
  },

  // News
  getNews: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/news?${params}`);
  },
  
  getNewsArticle: (id: string) => {
    return fetchApi(`/news/${id}`);
  },
  
  getNewsForRace: (raceId: string) => {
    return fetchApi(`/news/race/${raceId}`);
  },

  getPersonalizedNews: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/news/personalized/feed?${params}`);
  },

  // Referrals
  trackClick: (data: { bookmaker: string; raceId?: string; articleId?: string }) => {
    return fetchApi('/referrals/click', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Watchlist
  getWatchlist: () => {
    return fetchApi('/watchlist');
  },

  addToWatchlist: (entityType: string, entityName: string) => {
    return fetchApi('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ entity_type: entityType, entity_name: entityName }),
    });
  },

  removeFromWatchlist: (id: string) => {
    return fetchApi(`/watchlist/${id}`, {
      method: 'DELETE',
    });
  },

  checkWatchlist: (entityType: string, entityNames: string[]) => {
    const params = new URLSearchParams({
      entity_type: entityType,
      entity_names: entityNames.join(','),
    });
    return fetchApi(`/watchlist/check?${params}`);
  },

  // User preferences
  getProfile: () => {
    return fetchApi('/auth/me');
  },

  getPreferences: () => {
    return fetchApi('/preferences');
  },

  updatePreferences: (preferences: any) => {
    return fetchApi('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  sendTestNotification: () => {
    return fetchApi('/preferences/notifications/test', {
      method: 'POST',
    });
  },

  // Ambassadors
  getAmbassadors: (status?: string) => {
    const params = status ? new URLSearchParams({ status }) : '';
    return fetchApi(`/ambassadors${params ? `?${params}` : ''}`);
  },

  getAmbassador: (id: string) => {
    return fetchApi(`/ambassadors/${id}`);
  },

  applyAsAmbassador: (data: { name: string; bio: string; socialLinks?: Array<{ platform: string; url: string }> }) => {
    return fetchApi('/ambassadors/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAmbassadorProfile: (id: string, data: any) => {
    return fetchApi(`/ambassadors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getPendingAmbassadors: () => {
    return fetchApi('/ambassadors/admin/pending');
  },

  approveAmbassador: (id: string, commissionRate?: number) => {
    return fetchApi(`/ambassadors/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ commissionRate }),
    });
  },

  rejectAmbassador: (id: string) => {
    return fetchApi(`/ambassadors/${id}/reject`, {
      method: 'PUT',
    });
  },

  suspendAmbassador: (id: string) => {
    return fetchApi(`/ambassadors/${id}/suspend`, {
      method: 'PUT',
    });
  },

  activateAmbassador: (id: string) => {
    return fetchApi(`/ambassadors/${id}/activate`, {
      method: 'PUT',
    });
  },

  getAmbassadorStats: (id: string) => {
    return fetchApi(`/ambassadors/${id}/stats`);
  },

  // Articles
  getArticles: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/articles${params.toString() ? `?${params}` : ''}`);
  },

  getArticle: (id: string) => {
    return fetchApi(`/articles/${id}`);
  },

  getArticlesByAmbassador: (ambassadorId: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/articles/ambassador/${ambassadorId}${params.toString() ? `?${params}` : ''}`);
  },

  createArticle: (data: any) => {
    return fetchApi('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateArticle: (id: string, data: any) => {
    return fetchApi(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteArticle: (id: string) => {
    return fetchApi(`/articles/${id}`, {
      method: 'DELETE',
    });
  },

  archiveArticle: (id: string) => {
    return fetchApi(`/articles/${id}/archive`, {
      method: 'PUT',
    });
  },

  getPendingArticles: () => {
    return fetchApi('/articles/admin/pending');
  },

  publishArticle: (id: string, scheduledAt?: string) => {
    return fetchApi(`/articles/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ scheduledAt }),
    });
  },

  rejectArticle: (id: string, reason?: string) => {
    return fetchApi(`/articles/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  getContentAnalytics: () => {
    return fetchApi('/articles/admin/analytics');
  },

  // Admin Dashboard
  getAdminDashboardMetrics: () => {
    return fetchApi('/admin/dashboard/metrics');
  },

  getAdminRecentActivity: (limit?: number) => {
    const params = limit ? new URLSearchParams({ limit: limit.toString() }) : '';
    return fetchApi(`/admin/dashboard/activity${params ? `?${params}` : ''}`);
  },

  getAdminSystemHealth: () => {
    return fetchApi('/admin/dashboard/system-health');
  },

  // Admin - Ambassadors (additional methods)
  getAllAmbassadorsAdmin: (status?: string) => {
    const params = status ? new URLSearchParams({ status }) : '';
    return fetchApi(`/ambassadors${params ? `?${params}` : ''}`);
  },

  updateAmbassadorCommission: (id: string, commissionRate: number) => {
    return fetchApi(`/ambassadors/${id}/commission`, {
      method: 'PUT',
      body: JSON.stringify({ commissionRate }),
    });
  },

  // Admin - Referrals
  getReferralStats: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/referrals/stats${params.toString() ? `?${params}` : ''}`);
  },

  // Admin - Sources
  getScraperSources: () => {
    return fetchApi('/admin/sources/scrapers');
  },

  getBookmakerSources: () => {
    return fetchApi('/admin/sources/bookmakers');
  },

  updateScraperSource: (id: string, data: { is_active?: boolean; poll_interval?: number }) => {
    return fetchApi(`/admin/sources/scrapers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  resetScraperFailures: (id: string) => {
    return fetchApi(`/admin/sources/scrapers/${id}/reset`, {
      method: 'POST',
    });
  },

  getScraperMetrics: (id: string, hours?: number) => {
    const params = hours ? new URLSearchParams({ hours: hours.toString() }) : '';
    return fetchApi(`/admin/sources/scrapers/${id}/metrics${params ? `?${params}` : ''}`);
  },

  // Push Notifications
  saveFCMToken: (token: string) => {
    return fetchApi('/preferences/notifications/token', {
      method: 'POST',
      body: JSON.stringify({ fcm_token: token }),
    });
  },

  deleteFCMToken: () => {
    return fetchApi('/preferences/notifications/token', {
      method: 'DELETE',
    });
  },
};
