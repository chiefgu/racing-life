// API client for making authenticated requests to the backend

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

interface RequestOptions extends RequestInit {
  token?: string;
}

async function fetchWithAuth(endpoint: string, options: RequestOptions = {}) {
  const { token, headers, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const errorData = isJson ? await response.json() : { message: response.statusText };
    throw new ApiError(
      errorData.message || 'An error occurred',
      response.status,
      errorData
    );
  }

  return isJson ? response.json() : response.text();
}

export const apiClient = {
  // Auth endpoints
  register: (data: { email: string; name: string; password: string }) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: (token: string) =>
    fetchWithAuth('/auth/me', { token }),

  changePassword: (data: { current_password: string; new_password: string }, token: string) =>
    fetchWithAuth('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  // Favourites endpoints
  saveFavourites: (
    data: {
      jockeys: string[];
      trainers: string[];
      tracks: string[];
      bookmakers: string[];
    },
    token: string
  ) =>
    fetchWithAuth('/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getFavourites: (token: string) =>
    fetchWithAuth('/favorites', { token }),

  // Watchlist endpoints
  getWatchlist: (token: string) =>
    fetchWithAuth('/watchlist', { token }),

  addToWatchlist: (data: { entity_type: string; entity_name: string }, token: string) =>
    fetchWithAuth('/watchlist', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  removeFromWatchlist: (id: string, token: string) =>
    fetchWithAuth(`/watchlist/${id}`, {
      method: 'DELETE',
      token,
    }),
};
