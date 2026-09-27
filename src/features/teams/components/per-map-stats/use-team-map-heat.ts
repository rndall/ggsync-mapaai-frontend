import { useQueries, useQuery } from '@tanstack/react-query'

import type { NormalizedHeatPoint } from '@/features/matches/analysis-heat'
import { matchAnalysisQueries } from '@/features/matches/analysis-queries'
import {
  selectTeamMapHeat,
  selectTeamUtilityHeat,
} from '@/features/matches/analysis-team-heat'
import type { MapCrop, SideAssignment } from '@/features/matches/analysis-types'
import { matchQueries } from '@/features/matches/queries'

type UseTeamMapHeatInput = {
  // Detail-team route id (string). Non-numeric ids disable the fetch and
  // keep the placeholder, mirroring the match detail guard.
  teamId: string | undefined
  // Resolved selected map id (string). Empty disables the fetch until the
  // maps list resolves to the first available map.
  mapId: string
  side: SideAssignment
  // Utility mode selector. Undefined renders player-density heat; a string
  // (or null for no selection yet) renders that utility row's points only
  // under the same round, window, lens, and side filter.
  utilityName?: string | null
}

export type TeamMapHeatResult = {
  points: Array<NormalizedHeatPoint>
  matchedRounds: number
  failedRounds: number
  lowConfidence: boolean
  // Matches listed for the detail team on the selected map (all opponents,
  // any status). Zero renders the explicit zero-matches empty state.
  totalMatches: number
  // First contributing analysis's crop for the base aspect warning; a 1x1
  // fallback when no analysis has resolved yet. Points are already
  // crop-normalized per match, so mixed crops still merge safely.
  mapCrop: MapCrop
  isPending: boolean
  isError: boolean
}

// Query seam behind the team Per Map Stats panel: the detail team's matches
// for the selected map plus one per-match analysis each, aggregated into a
// single player-density read (or, when `utilityName` is supplied, into that
// utility row's layer). A future backend per-map heat endpoint replaces
// only this hook — the panel keeps reading the same shape.
export function useTeamMapHeat({
  teamId,
  mapId,
  side,
  utilityName,
}: UseTeamMapHeatInput): TeamMapHeatResult {
  const teamIdNumber = Number(teamId)
  const mapIdNumber = Number(mapId)
  const hasTeam = teamId !== undefined && Number.isFinite(teamIdNumber)
  const hasMap = mapId !== '' && Number.isFinite(mapIdNumber)

  const matchesQuery = useQuery({
    ...matchQueries.teamList(hasTeam ? teamIdNumber : 0, {
      map_id: hasMap ? mapIdNumber : 0,
      // Single-page cap: teams past 100 matches on one map need cursor
      // pagination here before the aggregation covers "all opponents".
      per_page: 100,
    }),
    enabled: hasTeam && hasMap,
  })
  const matches = matchesQuery.data?.data.matches ?? []
  const readyMatches = matches.filter((match) => match.status === 'ready')

  const analysisQueries = useQueries({
    queries: readyMatches.map((match) =>
      matchAnalysisQueries.detail(match.id, teamIdNumber),
    ),
  })
  const analysesPending = analysisQueries.some((query) => query.isPending)
  // A failed per-match fetch must not render partial heat as complete: any
  // analysis error fails the whole read into the error card (with query
  // retries absorbing the transient case).
  const analysesFailed = analysisQueries.some((query) => query.isError)

  const analysesByMatchId = new Map<
    number,
    (typeof analysisQueries)[number]['data']
  >()
  readyMatches.forEach((match, index) => {
    const data = analysisQueries[index]?.data
    if (data) analysesByMatchId.set(match.id, data)
  })

  const aggregated = hasTeam
    ? utilityName !== undefined
      ? selectTeamUtilityHeat(
          matches,
          analysesByMatchId,
          String(teamId),
          side,
          utilityName,
        )
      : selectTeamMapHeat(matches, analysesByMatchId, String(teamId), side)
    : { points: [], matchedRounds: 0, failedRounds: 0, lowConfidence: false }

  const firstCrop: MapCrop | undefined = analysisQueries.find(
    (query) => query.data,
  )?.data?.mapCrop

  return {
    ...aggregated,
    totalMatches: matches.length,
    mapCrop: firstCrop ?? { width: 1, height: 1 },
    isPending: matchesQuery.isPending || analysesPending,
    isError: matchesQuery.isError || analysesFailed,
  }
}
