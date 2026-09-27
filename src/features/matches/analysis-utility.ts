// Utility-mix derivation for the team-scoped match view.
//
// Mix rule, agreed in grilling (see
// `.scratch/match-analysis-heatmap/spec.md`): group event trajectories by
// normalized utility name (frag grenade maps to Frag, smoke variants to
// Smoke, concussion to Concussion), count one throw per trajectory, share
// equals group count over total event throws under the same lens-plus-side
// filter (ok rounds only, active team lens, rounds where that team's side
// matches the selected toggle). Bomb markers (`bomb_plant`, `bomb_carried`)
// are carried-state/event decorations, not utils, and are excluded — as is
// any non-grenade track.
//
// Utility heat equals the selected utility row's event type only, with the
// same round/window/team filter as player heat: only ok rounds, only points
// inside the round start-to-cutoff window.
//
// Covered implicitly through the team-scoped match view module boundary (the
// spec's agreed seam), not by unit tests — the repo has no test runner.

import type { UtilityMixRow } from '@/features/teams/components/per-map-stats/per-map-stats-mock'

import type { NormalizedHeatPoint } from './analysis-heat'
import { LOW_CONFIDENCE_THRESHOLD, normalizeHeatPoint } from './analysis-heat'
import type {
  MatchAnalysis,
  SideAssignment,
  TeamSideColor,
} from './analysis-types'

// Map an event track onto its utility row name. Returns null for anything
// that is not a utility throw: bomb markers plus unknown tracks. Grenade
// variants beyond the three sampled ones fall through to a capitalized
// `<kind>` label so future utils appear instead of vanishing.
export function normalizeUtilityName(iconType: string): string | null {
  const normalized = iconType.trim().toLowerCase()
  if (normalized === 'bomb_carried') return null
  if (normalized.startsWith('bomb')) return null
  if (normalized.includes('smoke')) return 'Smoke'
  if (normalized.includes('frag')) return 'Frag'
  if (normalized.includes('concussion')) return 'Concussion'
  if (normalized.includes('grenade')) {
    const kind = normalized.split('_').filter(Boolean)[0] ?? ''
    if (!kind) return null
    return kind.charAt(0).toUpperCase() + kind.slice(1)
  }
  return null
}

export type UtilityMixSelection = {
  // One row per observed utility, sorted by throw count descending with a
  // deterministic name tie-break. Empty when the lens team never played the
  // selected side; the caller renders the empty state.
  rows: Array<UtilityMixRow>
  // Ok rounds where the lens team played the selected side (the share
  // denominator's round scope). Zero means the combination was never played.
  matchedRounds: number
  // Failed rounds are excluded from every read; reported so callers can keep
  // the count consistent with the heat card when needed.
  failedRounds: number
}

export function selectUtilityMix(
  analysis: MatchAnalysis,
  teamColor: TeamSideColor | null,
  side: SideAssignment,
): UtilityMixSelection {
  const empty: UtilityMixSelection = {
    rows: [],
    matchedRounds: 0,
    failedRounds: 0,
  }
  if (!teamColor) return empty

  const counts = new Map<string, number>()
  let matchedRounds = 0
  let failedRounds = 0

  for (const round of analysis.rounds) {
    if (round.status !== 'ok') {
      failedRounds += 1
      continue
    }
    if (round.side[teamColor] !== side) continue
    matchedRounds += 1
    for (const trajectory of round.trajectories) {
      if (trajectory.teamColor !== teamColor) continue
      const name = normalizeUtilityName(trajectory.iconType)
      if (!name) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }

  if (matchedRounds === 0) {
    return { rows: [], matchedRounds, failedRounds }
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
  if (total === 0) {
    return { rows: [], matchedRounds, failedRounds }
  }

  // Sort by raw throw count descending (not the rounded share) so near-ties
  // order by true frequency; the name tail only breaks exact ties, which
  // also pins the auto-selected first row deterministically.
  const rows: Array<UtilityMixRow> = [...counts.entries()]
    .sort(
      ([leftName, leftCount], [rightName, rightCount]) =>
        rightCount - leftCount || leftName.localeCompare(rightName),
    )
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }))

  return { rows, matchedRounds, failedRounds }
}

export type UtilityHeatSelection = {
  // Density points for the selected utility only, already normalized.
  points: Array<NormalizedHeatPoint>
  // Ok rounds where the lens team played the selected side, whether or not
  // they contributed points. Empty means the lens-plus-side combination was
  // never played and the card shows the explicit empty state.
  matchedRounds: number
  // Failed rounds are excluded from every read but stay visible as a compact
  // note on the card.
  failedRounds: number
  // True when any matched round's active-team split confidence falls below
  // the threshold. Renders a badge, never blocks.
  lowConfidence: boolean
}

export function selectUtilityHeatPoints(
  analysis: MatchAnalysis,
  teamColor: TeamSideColor | null,
  side: SideAssignment,
  utilityName: string | null,
): UtilityHeatSelection {
  const selection: UtilityHeatSelection = {
    points: [],
    matchedRounds: 0,
    failedRounds: 0,
    lowConfidence: false,
  }
  if (!teamColor) return selection

  for (const round of analysis.rounds) {
    if (round.status !== 'ok') {
      selection.failedRounds += 1
      continue
    }
    if (round.side[teamColor] !== side) continue
    selection.matchedRounds += 1
    if (round.teamSplit[teamColor].confidence < LOW_CONFIDENCE_THRESHOLD) {
      selection.lowConfidence = true
    }
    if (!utilityName) continue
    for (const trajectory of round.trajectories) {
      if (trajectory.teamColor !== teamColor) continue
      if (normalizeUtilityName(trajectory.iconType) !== utilityName) continue
      for (const point of trajectory.points) {
        if (point.tMs < round.startMs || point.tMs > round.cutoffMs) continue
        selection.points.push(
          normalizeHeatPoint(
            point.x,
            point.y,
            analysis.mapCrop.width,
            analysis.mapCrop.height,
          ),
        )
      }
    }
  }

  return selection
}
