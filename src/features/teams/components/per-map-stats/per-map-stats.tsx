import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mapQueries } from '@/features/matches/queries'
import { teamQueries } from '@/features/teams/queries'

import { MinimapPlaceholder } from './minimap-placeholder'
import { PerMapStatsBanner } from './per-map-banner'
import { PerMapStatsFilters } from './per-map-stats-filters'
import { PER_MAP_STATS_MOCK } from './per-map-stats-mock'
import { PerMapStatsViewTabs } from './per-map-stats-view-tabs'
import { PlayerStats } from './player-stats'
import type { PerMapStatsSide } from './use-per-map-stats-params'
import { usePerMapStatsParams } from './use-per-map-stats-params'
import { UtilityStats } from './utility-stats'

// MOCK (replace with the real per-map stats endpoint): the headline win rate
// stays hardcoded until the stats API exists.
const MAP_WIN_PCT = 100

type PerMapStatsProps = {
  // Header furniture override. A supplied header replaces the map banner AND
  // the panel's own Player/Utility switch, since both belong to the header
  // and a host that brings its own brings its own switch. The match page
  // passes the score header, which carries both.
  header?: ReactNode
  // Pins the read to one map, overriding the URL. A host that already knows
  // the map has no picker left to set it with, so without this it would
  // silently report the first map in the list instead of its own.
  mapId?: string
  // The Team and Map pickers only make sense where the read is not already
  // scoped; a match fixes both on its own.
  showFilters?: boolean
}

export default function PerMapStats({
  header,
  mapId,
  showFilters = true,
}: PerMapStatsProps) {
  const { view, side, setSide, heat, setHeat, team, setTeam, map, setMap } =
    usePerMapStatsParams()

  // The opponent picker is the only consumer of the team list, so a host that
  // hides the filters must neither fetch it nor block on it.
  const teamsQuery = useQuery({
    ...teamQueries.options(),
    enabled: showFilters,
  })
  const mapsQuery = useQuery(mapQueries.list())

  const teams = teamsQuery.data?.data ?? []
  const maps = mapsQuery.data?.data ?? []
  // No map chosen (or a stale id in the URL) falls back to the first
  // available map. A host-supplied mapId is authoritative and falls back the
  // same way when the list does not carry it.
  const requestedMapId = mapId ?? map
  const selectedMapId = maps.some(
    (option) => String(option.id) === requestedMapId,
  )
    ? requestedMapId
    : maps[0] !== undefined
      ? String(maps[0].id)
      : ''
  const selectedMap =
    maps.find((option) => String(option.id) === selectedMapId) ?? null
  // All numbers below the banner are typed hardcoded mocks until the stats
  // endpoint exists; the side toggle only swaps which mock slice renders.
  const sideStats = PER_MAP_STATS_MOCK[side]

  if (mapsQuery.isPending || (showFilters && teamsQuery.isPending)) {
    return <PerMapStatsSkeleton showFilters={showFilters} />
  }

  if (mapsQuery.isError || (showFilters && teamsQuery.isError)) {
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
        {/* The team page scopes the read by picking a slice. The match page
            has no such choice: the match already fixes both teams and the
            map, so a picker there would only offer a wrong answer. */}
        {showFilters && (
          <PerMapStatsFilters
            teams={teams}
            maps={maps}
            team={team}
            onTeamChange={(value) => void setTeam(value)}
            mapId={selectedMapId}
            onMapChange={(value) => void setMap(value)}
          />
        )}
      </div>
      {/* Banner and analysis panel share one card so the header stays
          attached to the tabs and stats below. */}
      <div className="overflow-hidden rounded-lg border bg-card">
        {header ?? (
          <>
            <PerMapStatsBanner
              mapName={selectedMap?.name ?? null}
              winPct={MAP_WIN_PCT}
              className="rounded-none border-0"
            />
            {/* The tabs straddle the banner's bottom edge, inset from the left
                to match the panel padding. Half of the tab height overlaps the
                banner's bottom padding zone, so no banner content is covered,
                and relative+z-10 keeps the tabs above the banner's positioned
                background layers. */}
            <PerMapStatsViewTabs className="relative z-10 -mt-10 ml-4 sm:ml-6" />
          </>
        )}
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <Tabs
            value={side}
            onValueChange={(value) => void setSide(value as PerMapStatsSide)}
          >
            <TabsList aria-label="Side" className="w-full">
              <TabsTrigger value="attacking">Attacking</TabsTrigger>
              <TabsTrigger value="defending">Defending</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {view === 'player' ? (
              <PlayerStats stats={sideStats} />
            ) : (
              <UtilityStats stats={sideStats} />
            )}
            <MinimapPlaceholder
              heat={heat}
              onHeatChange={(value) => void setHeat(value)}
              showHeatToggle={view === 'player'}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function PerMapStatsSkeleton({ showFilters }: { showFilters: boolean }) {
  return (
    <section
      aria-label="Per Map Stats"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Skeleton className="h-7 w-44" />
        {showFilters && (
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-44" />
          </div>
        )}
      </div>
      <Skeleton className="min-h-48 rounded-lg" />
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="min-h-72 rounded-lg" />
        <Skeleton className="aspect-square w-full rounded-lg" />
      </div>
    </section>
  )
}
