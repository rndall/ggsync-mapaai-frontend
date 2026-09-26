import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

const matchRouteApi = getRouteApi('/_authed/matches/$matchId')

// Both match-detail hosts — the bare-address redirector and the canonical
// team-scoped view — read the same match through the parent route's loader
// context and resolve the same invalid-id case. One hook keeps the query and
// that guard from drifting apart.
export function useMatchQuery() {
  const { matchId } = matchRouteApi.useParams()
  const context = matchRouteApi.useRouteContext()
  const matchIdNumber = Number(matchId)

  return {
    matchId,
    matchIdNumber,
    // Route params are strings; a non-numeric segment is a bad address, not a
    // request, so the query stays disabled until the id is usable.
    matchQuery: useQuery({
      ...context.matchQueryOptions,
      enabled: Number.isFinite(matchIdNumber),
    }),
  }
}
