/**
 * Centralized API endpoint definitions
 */

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    session: '/api/auth/session',
    checkEmail: '/api/auth/check-email',
  },
  ping: '/api/health',
} as const
