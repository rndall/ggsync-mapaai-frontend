import { useQuery } from '@tanstack/react-query'

import { authQueries } from '@/features/auth/queries'
import { getAuthToken } from '@/lib/api'

export function useCurrentUser() {
  const query = useQuery({
    ...authQueries.currentUser(),
    enabled: getAuthToken() !== null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  return { user: query.data?.data, isPending: query.isPending }
}
