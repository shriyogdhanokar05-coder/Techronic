/**
 * Normalizes the backend API base URL for both local development and cloud production (Render).
 * Handles:
 * - Empty / undefined: falls back to '/api' (matching local Vite dev proxy)
 * - Trailing slash trimming
 * - Auto-prefixing https:// if scheme is omitted
 * - Ensuring /api suffix is present
 */
export function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return '/api';
  }

  let clean = rawUrl.trim();

  // Strip trailing slash
  if (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }

  // Prepend https:// if protocol is omitted but domain is specified
  if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('/')) {
    clean = `https://${clean}`;
  }

  // Append /api if not already part of the path
  if (!clean.endsWith('/api') && !clean.includes('/api/')) {
    clean = `${clean}/api`;
  }

  return clean;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
export const TOKEN_STORAGE_KEY = 'techronics_jwt_token';
export const USER_STORAGE_KEY = 'techronics_user_data';
