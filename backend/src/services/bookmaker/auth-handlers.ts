import axios from 'axios';
import { BookmakerCredentials } from '../../types/bookmaker.types';

/**
 * Authentication Handlers for different auth types
 */

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * OAuth 2.0 Authentication Handler
 */
export class OAuthHandler {
  private tokenEndpoint: string;
  private credentials: BookmakerCredentials;

  constructor(tokenEndpoint: string, credentials: BookmakerCredentials) {
    this.tokenEndpoint = tokenEndpoint;
    this.credentials = credentials;
  }

  /**
   * Get access token using client credentials flow
   */
  async getAccessToken(): Promise<OAuthTokenResponse> {
    try {
      const response = await axios.post<OAuthTokenResponse>(
        this.tokenEndpoint,
        {
          grant_type: 'client_credentials',
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('OAuth token request failed:', error.message);
      throw new Error('Failed to obtain OAuth access token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<OAuthTokenResponse> {
    if (!this.credentials.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<OAuthTokenResponse>(
        this.tokenEndpoint,
        {
          grant_type: 'refresh_token',
          refresh_token: this.credentials.refreshToken,
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('OAuth token refresh failed:', error.message);
      throw new Error('Failed to refresh OAuth access token');
    }
  }

  /**
   * Update credentials with new token
   */
  updateCredentials(tokenResponse: OAuthTokenResponse): void {
    this.credentials.accessToken = tokenResponse.access_token;
    if (tokenResponse.refresh_token) {
      this.credentials.refreshToken = tokenResponse.refresh_token;
    }
    // Set expiry time (subtract 60 seconds for safety margin)
    const expiryMs = (tokenResponse.expires_in - 60) * 1000;
    this.credentials.tokenExpiry = new Date(Date.now() + expiryMs);
  }
}

/**
 * API Key Authentication Handler
 */
export class ApiKeyHandler {
  private apiKey: string;
  private paramName: string;
  private headerName?: string;

  constructor(
    apiKey: string,
    paramName: string = 'apiKey',
    headerName?: string
  ) {
    this.apiKey = apiKey;
    this.paramName = paramName;
    this.headerName = headerName;
  }

  /**
   * Add API key to request parameters
   */
  addToParams(params: Record<string, any> = {}): Record<string, any> {
    return {
      ...params,
      [this.paramName]: this.apiKey,
    };
  }

  /**
   * Add API key to request headers
   */
  addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    if (this.headerName) {
      return {
        ...headers,
        [this.headerName]: this.apiKey,
      };
    }
    return headers;
  }

  /**
   * Validate API key format
   */
  validate(): boolean {
    return typeof this.apiKey === 'string' && this.apiKey.length > 0;
  }
}

/**
 * Basic Authentication Handler
 */
export class BasicAuthHandler {
  private username: string;
  private password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  /**
   * Generate Basic Auth header value
   */
  getAuthHeader(): string {
    const credentials = `${this.username}:${this.password}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
  }

  /**
   * Add Basic Auth to headers
   */
  addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      Authorization: this.getAuthHeader(),
    };
  }

  /**
   * Validate credentials
   */
  validate(): boolean {
    return (
      typeof this.username === 'string' &&
      this.username.length > 0 &&
      typeof this.password === 'string' &&
      this.password.length > 0
    );
  }
}

/**
 * Token Manager for storing and retrieving tokens
 */
export class TokenManager {
  private tokens: Map<string, BookmakerCredentials> = new Map();

  /**
   * Store credentials for a bookmaker
   */
  setCredentials(bookmaker: string, credentials: BookmakerCredentials): void {
    this.tokens.set(bookmaker, credentials);
  }

  /**
   * Get credentials for a bookmaker
   */
  getCredentials(bookmaker: string): BookmakerCredentials | undefined {
    return this.tokens.get(bookmaker);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(bookmaker: string): boolean {
    const credentials = this.tokens.get(bookmaker);
    if (!credentials || !credentials.tokenExpiry) {
      return true;
    }
    return new Date() >= credentials.tokenExpiry;
  }

  /**
   * Clear credentials for a bookmaker
   */
  clearCredentials(bookmaker: string): void {
    this.tokens.delete(bookmaker);
  }

  /**
   * Clear all credentials
   */
  clearAll(): void {
    this.tokens.clear();
  }
}

// Singleton instance
export const tokenManager = new TokenManager();
