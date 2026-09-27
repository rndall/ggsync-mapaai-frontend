import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mapQueries } from '@/features/matches/queries'

import { MinimapPlaceholder } from './minimap-placeholder'
import { PerMapStatsBanner } from './per-map-banner'
import { PerMapStatsFilters } from './per-map-stats-filters'
import type { SiteSetup, UtilityMixRow } from './per-map-stats-mock'
import { PER_MAP_STATS_MOCK } from './per-map-stats-mock'
import { PerMapStatsViewTabs } from './per-map-stats-view-tabs'
import { PlayerStats } from './player-stats'
import { TeamMapHeat } from './team-map-heat'
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
  // Minimap override. A supplied node replaces the team heat box — the
  // match view passes the live analysis heatmap while the team page leaves
  // it undefined so the Player tab can render its own per-map heat.
  minimap?: ReactNode
  // Pins the read to one map, overriding the URL. A host that already knows
  // the map has no picker left to set it with, so without this it would
  // silently report the first map in the list instead of its own.
  mapId?: string
  // Derived Top Setups rows for the match view. Undefined keeps the mock
  // slice (team pages and pending/failed analysis); a defined array — even
  // empty — renders the live aggregation so the list re-aggregates per
  // lens-plus-side with failed rounds excluded.
  setups?: Array<SiteSetup>
  // Derived Utility mix rows for the match view. Undefined keeps the mock
  // slice; a defined array — even empty — renders the live aggregation.
  // Selection stays local (component state in the host, never a URL key).
  utility?: Array<UtilityMixRow>
  selectedUtility?: string | null
  onUtilitySelect?: (name: string) => void
  // The Map picker only makes sense where the read is not already
  // scoped; a match fixes the map on its own.
  showFilters?: boolean
  // The heading only makes sense where the panel stands alone; a match
  // already frames the context with its own title and score header.
  showTitle?: boolean
  // Detail-team route id for the team page. When present (and no minimap
  // override is supplied), the Player tab renders live per-map heat scoped
  // to this team; the match page leaves it undefined and drives the
  // minimap slot itself.
  teamId?: string
}

export default function PerMapStats({
  header,
  minimap,
  mapId,
  setups,
  utility,
  selectedUtility,
  onUtilitySelect,
  showFilters = true,
  showTitle = true,
  teamId,
}: PerMapStatsProps) {
  const { view, side, setSide, map, setMap } = usePerMapStatsParams()

  const mapsQuery = useQuery(mapQueries.list())

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
  // Team-page utility selection is local single-select state, never a URL
  // key, mirroring the match view. The mock rows never change per map, so
  // the pick persists across map/side flips and falls back to the first row
  // when stale. The match view stays controlled via its own props.
  const utilityRows = utility ?? sideStats.utility
  const isUtilityControlled =
    selectedUtility !== undefined || onUtilitySelect !== undefined
  const [teamUtilityPick, setTeamUtilityPick] = useState<string | null>(null)
  const teamActiveUtility =
    teamUtilityPick && utilityRows.some((row) => row.name === teamUtilityPick)
      ? teamUtilityPick
      : (utilityRows[0]?.name ?? null)
  // Heat follows the same active row the table highlights: the controlled
  // name when the host drives selection, else the team-page local pick, so
  // picking a row swaps the minimap layer.
  const heatUtilityName = isUtilityControlled
    ? selectedUtility && utilityRows.some((row) => row.name === selectedUtility)
      ? selectedUtility
      : (utilityRows[0]?.name ?? null)
    : teamActiveUtility
  const teamUtilitySelected = isUtilityControlled
    ? selectedUtility
    : teamId && !minimap
      ? teamActiveUtility
      : undefined
  const teamUtilityOnSelect = isUtilityControlled
    ? onUtilitySelect
    : teamId && !minimap
      ? setTeamUtilityPick
      : undefined

  if (mapsQuery.isPending) {
    return (
      <PerMapStatsSkeleton showFilters={showFilters} showTitle={showTitle} />
    )
  }

  if (mapsQuery.isError) {
    return (
      <section
        aria-label="Per Map Stats"
        className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
      >
        {showTitle && <h2 className="font-heading text-xl">Per Map Stats</h2>}
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
      {(showTitle || showFilters) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          {showTitle && <h2 className="font-heading text-xl">Per Map Stats</h2>}
          {/* The team page scopes the read by picking a map. The match page
            has no such choice: the match already fixes the map, so a picker
            there would only offer a wrong answer. */}
          {showFilters && (
            <PerMapStatsFilters
              maps={maps}
              mapId={selectedMapId}
              onMapChange={(value) => void setMap(value)}
            />
          )}
        </div>
      )}
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
              <PlayerStats stats={sideStats} side={side} setups={setups} />
            ) : (
              <UtilityStats
                stats={sideStats}
                rows={utility}
                selected={teamUtilitySelected}
                onSelect={teamUtilityOnSelect}
              />
            )}
            {/* The match view drives this slot itself. The team page leaves
                it undefined: the Player tab renders live per-map player
                heat over the selected map's minimap base, while the
                Utility tab renders the same module row-driven with the
                selected utility row's points only (picking a row swaps the
                layer). Missing base images fall back to the dark box with
                heat only. The grid keeps stacking at narrow widths either
                way. */}
            {minimap ??
              (teamId ? (
                view === 'player' ? (
                  <TeamMapHeat
                    teamId={teamId}
                    mapId={selectedMapId}
                    baseImageUrl={selectedMap?.image_url ?? null}
                    mapName={selectedMap?.name ?? null}
                    side={side}
                  />
                ) : (
                  <TeamMapHeat
                    teamId={teamId}
                    mapId={selectedMapId}
                    baseImageUrl={selectedMap?.image_url ?? null}
                    mapName={selectedMap?.name ?? null}
                    side={side}
                    utilityName={heatUtilityName}
                  />
                )
              ) : (
                <MinimapPlaceholder />
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PerMapStatsSkeleton({
  showFilters,
  showTitle = true,
}: {
  showFilters: boolean
  showTitle?: boolean
}) {
  return (
    <section
      aria-label="Per Map Stats"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
    >
      {(showTitle || showFilters) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          {showTitle && <Skeleton className="h-7 w-44" />}
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-44" />
            </div>
          )}
        </div>
      )}
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
