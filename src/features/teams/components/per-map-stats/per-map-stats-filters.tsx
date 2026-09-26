import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import * as React from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { capitalizeWords } from '@/features/matches/utils'
import type { components } from '@/types/api'

import { PER_MAP_STATS_TEAM_ALL } from './use-per-map-stats-params'

type TeamFilterOption = Pick<components['schemas']['Team'], 'id' | 'name'>
type MapFilterOption = components['schemas']['MapResource']

type PerMapStatsFiltersProps = {
  teams: TeamFilterOption[]
  maps: MapFilterOption[]
  team: string
  onTeamChange: (value: string) => void
  mapId: string
  onMapChange: (value: string) => void
}

type TeamSelectOption = {
  id: string
  name: string
}

export function PerMapStatsFilters({
  teams,
  maps,
  team,
  onTeamChange,
  mapId,
  onMapChange,
}: PerMapStatsFiltersProps) {
  // An unknown team id in the URL (e.g. a deleted team) falls back to All
  // rather than rendering a blank filter.
  const effectiveTeam =
    team === PER_MAP_STATS_TEAM_ALL ||
    teams.some((option) => String(option.id) === team)
      ? team
      : PER_MAP_STATS_TEAM_ALL

  const teamOptions = React.useMemo<TeamSelectOption[]>(
    () => [
      { id: PER_MAP_STATS_TEAM_ALL, name: 'All' },
      ...teams.map((option) => ({
        id: String(option.id),
        name: option.name,
      })),
    ],
    [teams],
  )
  const teamItems = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(teamOptions, {
        getValue: (option) => option.id,
        getLabel: (option) => option.name,
      }),
    [teamOptions],
  )
  const mapItems = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(maps, {
        getValue: (map) => String(map.id),
        getLabel: (map) => capitalizeWords(map.name ?? String(map.id)),
      }),
    [maps],
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="per-map-stats-team" className="text-sm text-muted">
          Team
        </label>
        <Combobox
          autoHighlight
          items={teamItems}
          value={effectiveTeam}
          onValueChange={(next) => {
            onTeamChange(
              typeof next === 'string' ? next : PER_MAP_STATS_TEAM_ALL,
            )
          }}
        >
          <ComboboxInput
            id="per-map-stats-team"
            placeholder="Select team"
            className="w-44"
          />
          <ComboboxContent>
            <ComboboxList>
              {(option: TeamSelectOption) => (
                <ComboboxItem key={option.id} value={option.id}>
                  {option.name}
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>No team found.</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="per-map-stats-map" className="text-sm text-muted">
          Map
        </label>
        <Combobox
          autoHighlight
          items={mapItems}
          value={mapId === '' ? null : mapId}
          onValueChange={(next) => {
            if (typeof next === 'string' && next !== '') {
              onMapChange(next)
            }
          }}
          disabled={maps.length === 0}
        >
          <ComboboxInput
            id="per-map-stats-map"
            placeholder="Select map"
            className="w-44"
            disabled={maps.length === 0}
          />
          <ComboboxContent>
            <ComboboxList>
              {(map: MapFilterOption) => (
                <ComboboxItem key={map.id} value={String(map.id)}>
                  {capitalizeWords(map.name ?? String(map.id))}
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>No map found.</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  )
}
