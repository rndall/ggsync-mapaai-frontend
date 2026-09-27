import { queryOptions } from '@tanstack/react-query'

import { SAMPLE_MATCH_ANALYSIS } from './analysis-mock'
import type { MatchAnalysis } from './analysis-types'

// Per-match analysis query, alongside `matchQueries.detail` in
// `./queries.ts`: same match identifier in, analysis payload out.
//
// Today the fetcher serves the typed sample payload with no network
// dependency. When the backend `GET /matches/{match}/analysis` endpoint
// exists, only `fetchMatchAnalysis` changes to call it (via `fetchClient`)
// and map the response onto `MatchAnalysis` — the query key and the consumer
// call shape (`useQuery(matchAnalysisQueries.detail(id))`) stay unchanged,
// so no route or component change is needed to go live.
async function fetchMatchAnalysis(matchId: number): Promise<MatchAnalysis> {
  // Per-match identity: the mock stands in for every match, stamped with the
  // requested id so consumers can treat it as this match's result.
  return { ...SAMPLE_MATCH_ANALYSIS, matchId }
}

export const matchAnalysisQueries = {
  detail: (id: number) =>
    queryOptions({
      queryKey: ['matches', id, 'analysis'],
      queryFn: () => fetchMatchAnalysis(id),
      // The mock is static local data; keep it cached indefinitely until the
      // live endpoint (with its own staleness) arrives.
      staleTime: Infinity,
    }),
}
