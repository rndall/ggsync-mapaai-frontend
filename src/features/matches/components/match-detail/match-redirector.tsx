import { Navigate } from '@tanstack/react-router'

import {
  MatchDetailEmpty,
  MatchDetailError,
  MatchDetailLoading,
} from './match-detail-feedback'
import { pickPerspectiveTeamId } from './match-perspective'
import { useMatchQuery } from './use-match-query'

// Bare match address. It never renders content: it resolves the first
// participant in blue-first side order, then replaces onto the canonical
// team-scoped address.
export function MatchRedirector() {
  const { matchId, matchIdNumber, matchQuery } = useMatchQuery()

  if (!Number.isFinite(matchIdNumber)) {
    return <MatchDetailError message="Match not found." />
  }
  if (matchQuery.isPending) return <MatchDetailLoading />
  if (matchQuery.isError) return <MatchDetailError />

  const targetTeamId = pickPerspectiveTeamId(matchQuery.data.data.participants)
  if (!targetTeamId) return <MatchDetailEmpty />

  return (
    <Navigate
      to="/matches/$matchId/$teamId"
      params={{ matchId, teamId: targetTeamId }}
      replace
    />
  )
}
