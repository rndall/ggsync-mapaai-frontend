import { useQueryClient } from '@tanstack/react-query'

import { matchQueries } from '@/features/matches/queries'
import { $api } from '@/lib/api'

export function useCreateMatchText() {
  const queryClient = useQueryClient()
  return $api.useMutation('post', '/teams/{team}/match-text', {
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: matchQueries.lists() })
    },
  })
}
