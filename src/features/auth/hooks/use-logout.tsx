import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { $api, clearAuthToken } from '@/lib/api'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  function reset() {
    clearAuthToken()
    queryClient.clear()
    router.navigate({ href: '/login', replace: true })
  }
  return $api.useMutation('post', '/logout', {
    onSuccess: reset,
    // Clear local auth state even if the server call fails so a stale
    // token can never trap the visitor on the authed layout.
    onError: reset,
  })
}
