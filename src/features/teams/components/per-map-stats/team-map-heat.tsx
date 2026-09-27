import { useQuery } from '@tanstack/react-query'

import { MatchHeatmap } from '@/features/matches/components/match-detail/match-heatmap'
import { capitalizeWords } from '@/features/matches/utils'
import { teamQueries } from '@/features/teams/queries'

import { MinimapPlaceholder } from './minimap-placeholder'
import type { PerMapStatsSide } from './use-per-map-stats-params'
import { useTeamMapHeat } from './use-team-map-heat'

type TeamMapHeatProps = {
  teamId: string
  mapId: string
  // Maps API image URL for the selected map (`map.image_url`). Null renders
  // the dark box with heat only; the banner keeps its separate bundled art.
  baseImageUrl: string | null
  mapName: string | null
  side: PerMapStatsSide
}

// Live per-map player-density heat for the team detail panel. The map
// dropdown drives the base plus the density together: switching maps switches
// both. Left-column numbers stay mocked; only this minimap box goes live.
export function TeamMapHeat({
  teamId,
  mapId,
  baseImageUrl,
  mapName,
  side,
}: TeamMapHeatProps) {
  const teamIdNumber = Number(teamId)
  const teamQuery = useQuery({
    ...teamQueries.detail(Number.isFinite(teamIdNumber) ? teamIdNumber : 0),
    enabled: Number.isFinite(teamIdNumber),
  })
  const teamLabel = teamQuery.data?.data.name ?? 'This team'

  const heat = useTeamMapHeat({ teamId, mapId, side })
  const sideLabel = side === 'attacking' ? 'Attacking' : 'Defending'

  // Pending heat keeps the blank square box so arrival causes no reflow —
  // the same box the placeholder held.
  if (heat.isPending) {
    return <MinimapPlaceholder />
  }

  if (heat.isError) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div
          role="alert"
          className="relative flex aspect-square w-full flex-1 items-center justify-center rounded-lg border bg-background/70 p-6 text-center text-sm text-destructive"
        >
          Failed to load heat.
        </div>
      </div>
    )
  }

  // No matches on the map reads as fact, never a blank box.
  if (heat.totalMatches === 0) {
    const mapLabel = mapName ? capitalizeWords(mapName) : 'this map'
    return (
      <div className="flex h-full flex-col gap-3">
        <div
          role="img"
          aria-label={`No matches for ${teamLabel} on ${mapLabel}`}
          className="relative flex aspect-square w-full flex-1 items-center justify-center rounded-lg border bg-background/70 p-6 text-center text-sm text-muted-foreground"
        >
          No matches tracked for {teamLabel} on {mapLabel}.
        </div>
      </div>
    )
  }

  // Matches exist: the shared heatmap module carries the density plus the
  // unplayed lens-plus-side empty copy, the failure note, and the badge.
  return (
    <MatchHeatmap
      baseImageUrl={baseImageUrl}
      mapCrop={heat.mapCrop}
      points={heat.points}
      matchedRounds={heat.matchedRounds}
      failedRounds={heat.failedRounds}
      lowConfidence={heat.lowConfidence}
      teamLabel={teamLabel}
      sideLabel={sideLabel}
    />
  )
}
