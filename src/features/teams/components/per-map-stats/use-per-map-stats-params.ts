import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'

export const perMapStatsViews = ['player', 'utility'] as const
export type PerMapStatsView = (typeof perMapStatsViews)[number]

export const perMapStatsSides = ['attacking', 'defending'] as const
export type PerMapStatsSide = (typeof perMapStatsSides)[number]

export const perMapStatsHeats = ['type1', 'type2'] as const
export type PerMapStatsHeat = (typeof perMapStatsHeats)[number]

// Team filter value meaning stats versus the selected opponent.
export const PER_MAP_STATS_TEAM_ALL = 'all'

// All five Per Map Stats selections live in the URL so a read can be
// deep-linked. View/side/heat/team carry literal defaults; map defaults to
// '' and resolves to the first available map once the maps list loads.
export function usePerMapStatsParams() {
  const [view, setView] = useQueryState(
    'view',
    parseAsStringLiteral(perMapStatsViews).withDefault('player'),
  )
  const [side, setSide] = useQueryState(
    'side',
    parseAsStringLiteral(perMapStatsSides).withDefault('attacking'),
  )
  const [heat, setHeat] = useQueryState(
    'heat',
    parseAsStringLiteral(perMapStatsHeats).withDefault('type1'),
  )
  const [team, setTeam] = useQueryState(
    'team',
    parseAsString.withDefault(PER_MAP_STATS_TEAM_ALL),
  )
  const [map, setMap] = useQueryState('map', parseAsString.withDefault(''))

  return {
    view,
    setView,
    side,
    setSide,
    heat,
    setHeat,
    team,
    setTeam,
    map,
    setMap,
  }
}
