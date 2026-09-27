import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'

export const perMapStatsViews = ['player', 'utility'] as const
export type PerMapStatsView = (typeof perMapStatsViews)[number]

export const perMapStatsSides = ['attacking', 'defending'] as const
export type PerMapStatsSide = (typeof perMapStatsSides)[number]

// All Per Map Stats selections live in the URL so a read can be
// deep-linked. View/side carry literal defaults; map defaults to
// '' and resolves to the first available map once the maps list loads.
// Stale `heat` or `team` keys from old links are ignored, never errors.
export function usePerMapStatsParams() {
  const [view, setView] = useQueryState(
    'view',
    parseAsStringLiteral(perMapStatsViews).withDefault('player'),
  )
  const [side, setSide] = useQueryState(
    'side',
    parseAsStringLiteral(perMapStatsSides).withDefault('attacking'),
  )
  const [map, setMap] = useQueryState('map', parseAsString.withDefault(''))

  return {
    view,
    setView,
    side,
    setSide,
    map,
    setMap,
  }
}
