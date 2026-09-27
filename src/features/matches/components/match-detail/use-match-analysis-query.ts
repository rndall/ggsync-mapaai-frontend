import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

import { matchAnalysisQueries } from '@/features/matches/analysis-queries'

const matchRouteApi = getRouteApi('/_authed/matches/$matchId')

// Analysis counterpart to `useMatchQuery`: the team-scoped match view (and
// any future consumer) resolves the per-match analysis through this hook. The
// query serves the typed sample payload with no network dependency until the
// backend `GET /matches/{match}/analysis` endpoint exists, at which point
// only the query module's fetcher changes — this hook and its consumers stay
// unchanged.
export function useMatchAnalysisQuery() {
  const { matchId } = matchRouteApi.useParams()
  const matchIdNumber = Number(matchId)

  return {
    matchId,
    matchIdNumber,
    // Route params are strings; a non-numeric segment is a bad address, not a
    // request, so the query stays disabled until the id is usable — mirroring
    // the match detail guard.
    matchAnalysisQuery: useQuery({
      ...matchAnalysisQueries.detail(matchIdNumber),
      enabled: Number.isFinite(matchIdNumber),
    }),
  }
}
