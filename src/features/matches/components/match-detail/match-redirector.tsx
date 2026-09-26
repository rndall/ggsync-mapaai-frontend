import { useQuery } from '@tanstack/react-query'
import { getRouteApi, Navigate, useLocation } from '@tanstack/react-router'

import {
  MatchDetailEmpty,
  MatchDetailError,
  MatchDetailLoading,
} from './match-detail-feedback'
import { pickPerspectiveTeamId, readOriginTeamId } from './match-perspective'

const matchRouteApi = getRouteApi('/_authed/matches/$matchId')

// Bare match address. It never renders content: it resolves the incoming
// team context (when present and a valid participant) or the first
// participant in blue-first side order, then replaces onto the canonical
// team-scoped address.
export function MatchRedirector() {
  const { matchId } = matchRouteApi.useParams()
  const context = matchRouteApi.useRouteContext()
  const locationState = useLocation({
    select: (location) => location.state,
  })
  const matchIdNumber = Number(matchId)

  const matchQuery = useQuery({
    ...context.matchQueryOptions,
    enabled: Number.isFinite(matchIdNumber),
  })

  if (!Number.isFinite(matchIdNumber)) {
    return <MatchDetailError message="Match not found." />
  }
  if (matchQuery.isPending) return <MatchDetailLoading />
  if (matchQuery.isError) return <MatchDetailError />

  const participants = matchQuery.data.data.participants
  const targetTeamId = pickPerspectiveTeamId(
    participants,
    readOriginTeamId(locationState),
  )
  if (!targetTeamId) return <MatchDetailEmpty />

  return (
    <Navigate
      to="/matches/$matchId/$teamId"
      params={{ matchId, teamId: targetTeamId }}
      replace
    />
  )
}
