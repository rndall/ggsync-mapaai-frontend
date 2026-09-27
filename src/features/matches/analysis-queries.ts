import { $api } from '@/lib/api'

import { normalizeMatchResults } from './analysis-mapper'
import type { MatchAnalysis } from './analysis-types'
import type { MatchResults } from './match-results-types'

// Per-match analysis query, alongside `matchQueries.detail` in
// `./queries.ts`: match plus team identifiers in, normalized analysis out.
//
// Backed by `GET /matches/{match}/results`, scoped to the active team
// (`team_id`) with `icons: 'both'` so player and utility trajectories arrive
// in one request and share one cache entry. The `select` normalizes the lossy
// generated OpenAPI shape into the frontend `MatchAnalysis` contract — the
// single cast to `MatchResults` happens here at the query boundary. A `null`
// data payload means the match is still processing, so `select` returns
// `null` and consumers render their loading treatment (no polling on 409).
export const matchAnalysisQueries = {
  detail: (matchId: number, teamId: number) =>
    $api.queryOptions(
      'get',
      '/matches/{match}/results',
      {
        params: {
          path: { match: matchId },
          query: { team_id: teamId, icons: 'both' },
        },
      },
      {
        select: (response): MatchAnalysis | null =>
          normalizeMatchResults(
            response.data as unknown as MatchResults | null,
          ),
      },
    ),
}
