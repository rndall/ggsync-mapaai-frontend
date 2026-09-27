// Top-setups derivation for the team-scoped match view.
//
// Aggregation rule, agreed in grilling (see
// `.scratch/match-analysis-heatmap/spec.md`): one occurrence per ok round per
// active team where that team's round side matches the selected
// Attacking/Defending toggle; group identical site-count patterns including
// Mid; frequency equals group count over total matching rounds; sorted
// descending; all rows render (no top-5 cut). Failed rounds are excluded.
//
// Covered implicitly through the team-scoped match view module boundary (the
// spec's agreed seam), not by unit tests — the repo has no test runner.

import type { SiteSetup } from '@/features/teams/components/per-map-stats/per-map-stats-mock'

import type {
  MatchAnalysis,
  SideAssignment,
  TeamSideColor,
} from './analysis-types'

export type TopSetupsSelection = {
  // Every observed site-count pattern, sorted by frequency descending with a
  // deterministic tie-break. Empty when the lens team never played the
  // selected side; the caller renders the empty state.
  setups: Array<SiteSetup>
  // Ok rounds where the lens team played the selected side (the frequency
  // denominator). Zero means the combination was never played.
  matchedRounds: number
  // Failed rounds are excluded from every read; reported so callers can keep
  // the count consistent with the heat card when needed.
  failedRounds: number
}

export function selectTopSetups(
  analysis: MatchAnalysis,
  teamColor: TeamSideColor | null,
  side: SideAssignment,
): TopSetupsSelection {
  const empty: TopSetupsSelection = {
    setups: [],
    matchedRounds: 0,
    failedRounds: 0,
  }
  if (!teamColor) return empty

  const counts = new Map<
    string,
    { a: number; b: number; mid: number; count: number }
  >()
  let matchedRounds = 0
  let failedRounds = 0

  for (const round of analysis.rounds) {
    if (round.status !== 'ok') {
      failedRounds += 1
      continue
    }
    if (round.side[teamColor] !== side) continue
    matchedRounds += 1
    const { A: a, B: b, Mid: mid } = round.teamSplit[teamColor].zoneCounts
    const key = `${a}-${b}-${mid}`
    const entry = counts.get(key)
    if (entry) {
      entry.count += 1
    } else {
      counts.set(key, { a, b, mid, count: 1 })
    }
  }

  if (matchedRounds === 0) {
    return { setups: [], matchedRounds, failedRounds }
  }

  // Sort by raw occurrence count descending (not the rounded share) so
  // near-ties order by true frequency; the a/b/mid tail only breaks exact
  // ties deterministically.
  const setups: Array<SiteSetup> = [...counts.values()]
    .sort(
      (left, right) =>
        right.count - left.count ||
        right.a - left.a ||
        right.b - left.b ||
        right.mid - left.mid,
    )
    .map(({ a, b, mid, count }) => ({
      a,
      b,
      mid,
      pct: Math.round((count / matchedRounds) * 100),
    }))

  return { setups, matchedRounds, failedRounds }
}
