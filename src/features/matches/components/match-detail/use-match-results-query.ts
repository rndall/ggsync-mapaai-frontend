import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

import { matchAnalysisQueries } from '@/features/matches/analysis-queries'

const matchRouteApi = getRouteApi('/_authed/matches/$matchId')
const matchTeamRouteApi = getRouteApi('/_authed/matches/$matchId/$teamId')

// Analysis counterpart to `useMatchQuery`: the team-scoped match view reads
// the per-match results through this hook. The query hits
// `GET /matches/{match}/results` scoped to the active team (`team_id`) with
// `icons: 'both'`, normalized to `MatchAnalysis` by the query's `select`. A
// `null` payload means the match is still processing, so the query data is
// `null` (loading treatment) rather than an error; 409s surface as errors
// for the view to render its not-ready message.
export function useMatchResultsQuery() {
  const { matchId } = matchRouteApi.useParams()
  const { teamId } = matchTeamRouteApi.useParams()
  const matchIdNumber = Number(matchId)
  const teamIdNumber = Number(teamId)

  return {
    matchId,
    matchIdNumber,
    teamId,
    teamIdNumber,
    // Route params are strings; a non-numeric segment is a bad address, not a
    // request, so the query stays disabled until both ids are usable —
    // mirroring the match detail guard.
    matchResultsQuery: useQuery({
      ...matchAnalysisQueries.detail(matchIdNumber, teamIdNumber),
      enabled: Number.isFinite(matchIdNumber) && Number.isFinite(teamIdNumber),
    }),
  }
}
