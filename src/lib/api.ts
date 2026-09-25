import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'

import type { paths } from '@/types/api'

export const TOKEN_STORAGE_KEY = 'mapa-ai:token'

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export const fetchClient = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
})

fetchClient.use({
  onRequest: ({ request }) => {
    const token = getAuthToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
  },
})

export const $api = createClient(fetchClient)
