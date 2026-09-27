import type {
  AnalysisRound,
  MatchAnalysis,
  SideAssignment,
  TeamSideColor,
} from './analysis-types'
import type {
  MatchResults,
  MatchResultsRound,
  MatchResultsSideAssignment,
  MatchResultsTrajectory,
} from './match-results-types'

const EMPTY_ZONE_COUNTS = { A: 0, B: 0, Mid: 0 } as const

function mapSide(side: MatchResultsSideAssignment): SideAssignment {
  return side === 'attacker' ? 'attacking' : 'defending'
}

function mapTrajectory(trajectory: MatchResultsTrajectory) {
  return {
    iconType: trajectory.icon_type,
    teamColor: trajectory.team_color,
    points: trajectory.points.map((point) => ({
      tMs: point.t_ms,
      x: point.x,
      y: point.y,
    })),
  }
}

function mapRound(
  round: MatchResultsRound,
  status: AnalysisRound['status'],
): AnalysisRound {
  const side: Record<TeamSideColor, SideAssignment> = {
    blue: mapSide(round.side.blue),
    red: mapSide(round.side.red),
  }

  return {
    roundNumber: round.round_number,
    status,
    side,
    scoreAfter: { ...round.score_after },
    teamSplit: {
      blue: {
        zoneCounts: { ...EMPTY_ZONE_COUNTS },
        totalDetected: 0,
        confidence: 0,
      },
      red: {
        zoneCounts: { ...EMPTY_ZONE_COUNTS },
        totalDetected: 0,
        confidence: 0,
      },
    },
    heldSite: null,
    zoneEntries: [],
    startMs: round.round_start_ms,
    cutoffMs: round.tracking_cutoff_ms,
    trajectories: round.trajectories.map(mapTrajectory),
  }
}

export function normalizeMatchResults(
  results: MatchResults | null,
): MatchAnalysis | null {
  if (!results) return null

  const rounds: Array<MatchResultsRound> = results.playback.rounds
  const status: AnalysisRound['status'] =
    results.status === 'failed' ? 'failed' : 'ok'

  return {
    matchId: results.id,
    mapSlug: results.playback.map_slug,
    mapCrop: { ...results.playback.map_crop },
    finalScore: { ...results.final_score },
    targetScore: 5,
    rounds: rounds.map((round) => mapRound(round, status)),
  }
}