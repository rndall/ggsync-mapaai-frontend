// Player-heat derivation for the team-scoped match view.
//
// Heat input rules, agreed in grilling (see `.scratch/match-analysis-heatmap/spec.md`):
// only rounds with ok status; only points whose timestamp falls within that
// round's start-to-cutoff window; Player heat equals icon types ending in
// `player` (player-position density only); all heat is
// filtered to the active team lens and to rounds where that team's side
// matches the selected Attacking/Defending toggle.
//
// These helpers are covered implicitly through the team-scoped match view
// module boundary (the spec's agreed seam), not by unit tests — the repo has
// no test runner.

import type {
  MatchAnalysis,
  SideAssignment,
  TeamSideColor,
} from './analysis-types'

// A split below this confidence renders the low-confidence badge downstream
// without blocking. The sample payload keeps every contributing split at or
// above 0.78 except round 4 (0.47/0.55), so 0.6 separates the two groups.
export const LOW_CONFIDENCE_THRESHOLD = 0.6

export type NormalizedHeatPoint = {
  // Crop-normalized coordinates: x / crop.width, y / crop.height, each
  // clamped to the 0-1 range so stray points never leave the rendered box.
  nx: number
  ny: number
}

// Translate a crop-normalized point into the aspect-preserved base image
// rect, mirroring CSS `object-contain`: the base scales to the largest fit
// inside the box and centers, and the point scales into that displayed rect.
// Without a known base size (image still loading, or no base URL) it falls
// back to the full box.
export function containPoint(
  nx: number,
  ny: number,
  boxWidth: number,
  boxHeight: number,
  baseWidth: number | null,
  baseHeight: number | null,
): { x: number; y: number } {
  if (!baseWidth || !baseHeight || !boxWidth || !boxHeight) {
    return { x: nx * boxWidth, y: ny * boxHeight }
  }
  const scale = Math.min(boxWidth / baseWidth, boxHeight / baseHeight)
  const displayWidth = baseWidth * scale
  const displayHeight = baseHeight * scale
  return {
    x: (boxWidth - displayWidth) / 2 + nx * displayWidth,
    y: (boxHeight - displayHeight) / 2 + ny * displayHeight,
  }
}

// Player-position tracks end in `player` (e.g. `blue_player`, `red_player`).
export function isPlayerIconType(iconType: string): boolean {
  return iconType.trim().toLowerCase().endsWith('player')
}

export function normalizeHeatPoint(
  x: number,
  y: number,
  cropWidth: number,
  cropHeight: number,
): NormalizedHeatPoint {
  const clamp01 = (value: number) =>
    Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
  return {
    nx: cropWidth > 0 ? clamp01(x / cropWidth) : 0,
    ny: cropHeight > 0 ? clamp01(y / cropHeight) : 0,
  }
}

export type PlayerHeatSelection = {
  // Density points for the canvas overlay, already normalized.
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

export function selectPlayerHeatPoints(
  analysis: MatchAnalysis,
  teamColor: TeamSideColor | null,
  side: SideAssignment,
): PlayerHeatSelection {
  const empty: PlayerHeatSelection = {
    points: [],
    matchedRounds: 0,
    failedRounds: 0,
    lowConfidence: false,
  }
  if (!teamColor) return empty

  const selection: PlayerHeatSelection = {
    points: [],
    matchedRounds: 0,
    failedRounds: 0,
    lowConfidence: false,
  }

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
    for (const trajectory of round.trajectories) {
      if (trajectory.teamColor !== teamColor) continue
      if (!isPlayerIconType(trajectory.iconType)) continue
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
