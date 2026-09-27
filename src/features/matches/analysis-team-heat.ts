// Team per-map heat aggregation for the team detail Per Map Stats panel.
//
// Aggregation rule, agreed in grilling (see
// `.scratch/team-per-map-heat/spec.md`): list the detail team's matches for
// the selected map across all opponents, fetch per-match analysis for each,
// map the detail team to its per-match side color, and merge density points.
// Only rounds with ok status and points inside each round's start-to-cutoff
// window contribute, filtered to rounds where the detail team's side matches
// the selected Attacking/Defending toggle. A match where the detail team is
// not a participant contributes nothing.
//
// Covered implicitly through the team Per Map Stats host boundary (the
// spec's agreed seam), not by unit tests — the repo has no test runner.

import type { NormalizedHeatPoint } from './analysis-heat'
import { selectPlayerHeatPoints } from './analysis-heat'
import type {
  MatchAnalysis,
  SideAssignment,
  TeamSideColor,
} from './analysis-types'
import { selectUtilityHeatPoints } from './analysis-utility'
import type { MatchResource } from './utils'

export type TeamMapHeat = {
  // Merged crop-normalized density points (x over crop width, y over crop
  // height, each clamped to 0-1) across every contributing match.
  points: Array<NormalizedHeatPoint>
  // Ok rounds where the detail team played the selected side, summed across
  // matches whether or not they contributed points. Zero means the
  // lens-plus-side combination was never played and the card shows the
  // explicit empty state.
  matchedRounds: number
  // Failed analysis rounds, summed across matches. Excluded from every read
  // but reported as a compact note on the card.
  failedRounds: number
  // True when any matched round's detail-team split confidence falls below
  // the threshold. Renders a badge, never blocks.
  lowConfidence: boolean
}

// Merge player-density heat across the detail team's matches on one map.
// `analysesByMatchId` maps match id to that match's analysis payload (null
// when the match has no analysis, e.g. a non-ready match). Missing entries
// contribute nothing.
export function selectTeamMapHeat(
  matches: Array<MatchResource>,
  analysesByMatchId: Map<number, MatchAnalysis | null | undefined>,
  detailTeamId: string,
  side: SideAssignment,
): TeamMapHeat {
  const selection: TeamMapHeat = {
    points: [],
    matchedRounds: 0,
    failedRounds: 0,
    lowConfidence: false,
  }

  for (const match of matches) {
    // Only ready matches carry analysis; pending, processing, or failed
    // matches contribute nothing (and never inflate the failed-round note,
    // which counts failed analysis rounds, not failed matches).
    if (match.status !== 'ready') continue
    const participant = match.participants.find(
      (entry) => String(entry.team_id) === detailTeamId,
    )
    if (!participant) continue
    const teamColor = teamLensColor(participant.color)
    if (!teamColor) continue
    const analysis = analysesByMatchId.get(match.id)
    if (!analysis) continue
    const perMatch = selectPlayerHeatPoints(analysis, teamColor, side)
    selection.points.push(...perMatch.points)
    selection.matchedRounds += perMatch.matchedRounds
    selection.failedRounds += perMatch.failedRounds
    if (perMatch.lowConfidence) selection.lowConfidence = true
  }

  return selection
}

// TeamMapHeat doubles as the utility-heat payload: the same round, window,
// lens, and side filter applies, only the point source narrows to the
// selected utility row's event type (null counts matched rounds with no
// points, mirroring the per-match selector).
export function selectTeamUtilityHeat(
  matches: Array<MatchResource>,
  analysesByMatchId: Map<number, MatchAnalysis | null | undefined>,
  detailTeamId: string,
  side: SideAssignment,
  utilityName: string | null,
): TeamMapHeat {
  const selection: TeamMapHeat = {
    points: [],
    matchedRounds: 0,
    failedRounds: 0,
    lowConfidence: false,
  }

  for (const match of matches) {
    if (match.status !== 'ready') continue
    const participant = match.participants.find(
      (entry) => String(entry.team_id) === detailTeamId,
    )
    if (!participant) continue
    const teamColor = teamLensColor(participant.color)
    if (!teamColor) continue
    const analysis = analysesByMatchId.get(match.id)
    if (!analysis) continue
    const perMatch = selectUtilityHeatPoints(
      analysis,
      teamColor,
      side,
      utilityName,
    )
    selection.points.push(...perMatch.points)
    selection.matchedRounds += perMatch.matchedRounds
    selection.failedRounds += perMatch.failedRounds
    if (perMatch.lowConfidence) selection.lowConfidence = true
  }

  return selection
}

// Team lens by per-match side color, mirroring `participantSideColor` in
// `./components/match-detail/match-perspective` without pulling the
// vite-only match utils (bundled backgrounds) into this pure helper. Null
// renders the heat empty state rather than another team's read.
function teamLensColor(color: string): TeamSideColor | null {
  const normalized = color.trim().toLowerCase()
  if (normalized === 'blue' || normalized === 'red') return normalized
  return null
}
