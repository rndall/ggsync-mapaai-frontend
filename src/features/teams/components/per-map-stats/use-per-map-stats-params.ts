import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'

export const perMapStatsViews = ['player', 'utility'] as const
export type PerMapStatsView = (typeof perMapStatsViews)[number]

export const perMapStatsSides = ['attacking', 'defending'] as const
export type PerMapStatsSide = (typeof perMapStatsSides)[number]

// Team filter value meaning stats versus the selected opponent.
export const PER_MAP_STATS_TEAM_ALL = 'all'

// All Per Map Stats selections live in the URL so a read can be
// deep-linked. View/side/team carry literal defaults; map defaults to
// '' and resolves to the first available map once the maps list loads.
// Stale `heat` keys from old links are ignored, never errors.
export function usePerMapStatsParams() {
  const [view, setView] = useQueryState(
    'view',
    parseAsStringLiteral(perMapStatsViews).withDefault('player'),
  )
  const [side, setSide] = useQueryState(
    'side',
    parseAsStringLiteral(perMapStatsSides).withDefault('attacking'),
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
    team,
    setTeam,
    map,
    setMap,
  }
}
