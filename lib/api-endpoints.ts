/**
 * Centralized API endpoint definitions
 */

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    session: '/api/auth/session',
  },
  ping: '/api/ping',
} as const
