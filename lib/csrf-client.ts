/**
 * Client-side CSRF token utility
 * Fetches CSRF token from API endpoint
 */

let csrfTokenCache: string | null = null

export async function getCSRFToken(): Promise<string | null> {
  if (csrfTokenCache) {
    return csrfTokenCache
  }

  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    csrfTokenCache = data.token
    return csrfTokenCache
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
    return null
  }
}

export function clearCSRFTokenCache() {
  csrfTokenCache = null
}
