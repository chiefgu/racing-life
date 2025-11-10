import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Bottleneck from 'bottleneck';
import {
  BookmakerConfig,
  OddsRequest,
  OddsResponse,
  ApiResponse,
  ApiError,
  ResponseMetadata,
  AuthType,
} from '../../types/bookmaker.types';

/**
 * Base Bookmaker API Client
 * Provides common functionality for all bookmaker API integrations
 */
export abstract class BaseBookmakerClient {
  protected config: BookmakerConfig;
  protected axiosInstance: AxiosInstance;
  protected limiter: Bottleneck;
  protected lastRequestTime: number = 0;

  constructor(config: BookmakerConfig) {
    this.config = config;

    // Initialize axios instance
    this.axiosInstance = axios.create({
      baseURL: config.apiEndpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HorseRacingPlatform/1.0',
      },
    });

    // Initialize rate limiter
    this.limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: config.rateLimit.minTime || 0,
      reservoir: config.rateLimit.maxRequests,
      reservoirRefreshAmount: config.rateLimit.maxRequests,
      reservoirRefreshInterval: config.rateLimit.windowMs,
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      async (config) => await this.addAuthHeaders(config),
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleError(error)
    );
  }

  /**
   * Add authentication headers based on auth type
   */
  protected async addAuthHeaders(
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    const { authType, credentials } = this.config;

    switch (authType) {
      case AuthType.API_KEY:
        if (credentials.apiKey) {
          config.params = {
            ...config.params,
            apiKey: credentials.apiKey,
          };
        }
        break;

      case AuthType.OAUTH:
        if (credentials.accessToken) {
          // Check if token is expired
          if (this.isTokenExpired()) {
            await this.refreshAccessToken();
          }
          config.headers.Authorization = `Bearer ${credentials.accessToken}`;
        }
        break;

      case AuthType.BASIC:
        if (credentials.username && credentials.password) {
          const auth = Buffer.from(
            `${credentials.username}:${credentials.password}`
          ).toString('base64');
          config.headers.Authorization = `Basic ${auth}`;
        }
        break;
    }

    return config;
  }

  /**
   * Check if OAuth token is expired
   */
  protected isTokenExpired(): boolean {
    const { credentials } = this.config;
    if (!credentials.tokenExpiry) return false;
    return new Date() >= credentials.tokenExpiry;
  }

  /**
   * Refresh OAuth access token
   * Override in subclass for specific implementation
   */
  protected async refreshAccessToken(): Promise<void> {
    throw new Error('refreshAccessToken not implemented');
  }

  /**
   * Handle successful response
   */
  protected handleResponse(response: AxiosResponse): AxiosResponse {
    // Extract rate limit info from headers
    const metadata: ResponseMetadata = {
      requestsRemaining: this.parseHeader(response.headers['x-requests-remaining']),
      requestsUsed: this.parseHeader(response.headers['x-requests-used']),
      quotaUsed: this.parseHeader(response.headers['x-quota-used']),
    };

    // Attach metadata to response
    response.data = {
      ...response.data,
      _metadata: metadata,
    };

    return response;
  }

  /**
   * Handle API errors
   */
  protected handleError(error: any): Promise<never> {
    const apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    if (error.response) {
      // Server responded with error status
      apiError.statusCode = error.response.status;
      apiError.message = error.response.data?.message || error.message;
      apiError.code = this.mapStatusToCode(error.response.status);
      apiError.details = error.response.data;
    } else if (error.request) {
      // Request made but no response
      apiError.code = 'NO_RESPONSE';
      apiError.message = 'No response received from server';
    } else {
      // Error in request setup
      apiError.message = error.message;
    }

    console.error(`[${this.config.name}] API Error:`, apiError);
    return Promise.reject(apiError);
  }

  /**
   * Map HTTP status codes to error codes
   */
  protected mapStatusToCode(status: number): string {
    const statusMap: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };

    return statusMap[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Parse header value to number
   */
  protected parseHeader(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Make rate-limited request
   */
  protected async makeRequest<T>(
    method: string,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.limiter.schedule(() =>
        this.axiosInstance.request<T>({
          method,
          url,
          ...config,
        })
      );

      return {
        success: true,
        data: response.data,
        metadata: (response.data as any)._metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Get current rate limiter status
   */
  public getRateLimitStatus(): {
    running: number;
    queued: number;
  } {
    return {
      running: this.limiter.counts().RUNNING,
      queued: this.limiter.counts().QUEUED,
    };
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  abstract fetchOdds(request: OddsRequest): Promise<ApiResponse<OddsResponse>>;
  abstract testConnection(): Promise<boolean>;
  abstract getName(): string;
}
