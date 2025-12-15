/**
 * Unified API Client
 * Provides a simple, consistent interface for making API calls
 */

import { API_ENDPOINTS } from './api-endpoints'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiRequestOptions {
  method?: string
  headers?: HeadersInit
  body?: unknown
}

/**
 * Unified API client for making HTTP requests
 */
class ApiClient {
  private async request<T>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { body, headers, method } = options

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, config)
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      const isJson = contentType && contentType.includes('application/json')
      
      let data: any
      
      if (isJson) {
        try {
          data = await response.json()
        } catch {
          // If JSON parsing fails, create a generic error
          throw new ApiError(
            'Invalid response from server',
            response.status
          )
        }
      } else {
        // Non-JSON response (likely HTML error page)
        throw new ApiError(
          response.ok ? 'Invalid response format' : 'Server error occurred',
          response.status
        )
      }

      if (!response.ok) {
        throw new ApiError(
          data.error || 'An error occurred',
          response.status,
          data
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      // Network errors or other unexpected errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      )
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: { email, password },
    })
  }

  async register(data: {
    email: string
    password: string
    firstname: string
    lastname: string
    middlename?: string
    birthdate: string
    address?: string
    phone?: string
    paymentType?: string
    paymentInfo?: string
  }) {
    return this.request(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: data,
    })
  }

  async logout() {
    return this.request(API_ENDPOINTS.auth.logout, {
      method: 'POST',
    })
  }

  async getSession() {
    return this.request(API_ENDPOINTS.auth.session)
  }

  // Utility methods
  async ping() {
    return this.request(API_ENDPOINTS.ping)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
