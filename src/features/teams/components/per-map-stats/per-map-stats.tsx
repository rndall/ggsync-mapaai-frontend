import { useQuery } from '@tanstack/react-query'

import { Skeleton } from '@/components/ui/skeleton'
import { mapQueries } from '@/features/matches/queries'
import { teamQueries } from '@/features/teams/queries'

import { PerMapStatsBanner } from './per-map-banner'
import { PerMapStatsFilters } from './per-map-stats-filters'
import { usePerMapStatsParams } from './use-per-map-stats-params'

// MOCK (replace with the real per-map stats endpoint): the headline win rate
// stays hardcoded until the stats API exists.
const MAP_WIN_PCT = 100

export default function PerMapStats() {
  // View/side/heat have no UI yet (later tickets) but stay subscribed inside
  // the hook so their URL defaults persist from the same module boundary.
  const { team, setTeam, map, setMap } = usePerMapStatsParams()

  const teamsQuery = useQuery(teamQueries.options())
  const mapsQuery = useQuery(mapQueries.list())

  const teams = teamsQuery.data?.data ?? []
  const maps = mapsQuery.data?.data ?? []
  // No map chosen (or a stale id in the URL) falls back to the first
  // available map.
  const selectedMapId = maps.some((option) => String(option.id) === map)
    ? map
    : maps[0] !== undefined
      ? String(maps[0].id)
      : ''
  const selectedMap =
    maps.find((option) => String(option.id) === selectedMapId) ?? null

  if (teamsQuery.isPending || mapsQuery.isPending) {
    return <PerMapStatsSkeleton />
  }

  if (teamsQuery.isError || mapsQuery.isError) {
    return (
      <section
        aria-label="Per Map Stats"
        className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
      >
        <h2 className="font-heading text-xl">Per Map Stats</h2>
        <p role="alert" className="text-sm text-destructive">
          Failed to load Per Map Stats.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Per Map Stats"
      className="flex flex-col gap-4 rounded-lg"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-heading text-xl">Per Map Stats</h2>
        <PerMapStatsFilters
          teams={teams}
          maps={maps}
          team={team}
          onTeamChange={(value) => void setTeam(value)}
          mapId={selectedMapId}
          onMapChange={(value) => void setMap(value)}
        />
      </div>
      <PerMapStatsBanner
        mapName={selectedMap?.name ?? null}
        winPct={MAP_WIN_PCT}
      />
    </section>
  )
}

function PerMapStatsSkeleton() {
  return (
    <section
      aria-label="Per Map Stats"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Skeleton className="h-7 w-44" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-44" />
        </div>
      </div>
      <Skeleton className="min-h-48 rounded-lg" />
    </section>
  )
}
