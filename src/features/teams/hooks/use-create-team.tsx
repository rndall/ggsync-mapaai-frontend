import { useQueryClient } from '@tanstack/react-query'

import { teamQueries } from '@/features/teams/queries'
import { $api } from '@/lib/api'

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return $api.useMutation('post', '/teams', {
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: teamQueries.lists() })
    },
  })
}
