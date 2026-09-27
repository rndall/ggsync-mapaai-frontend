// Frontend-owned contract for the `GET /matches/{match}/results` response.
//
// The generated OpenAPI types in `@/types/api` are lossy for this endpoint:
// `participants`, `playback.rounds`, `playback.map_slug`, `playback.map_crop`,
// `perspective.side`, and `player_heatmaps` are typed as `unknown`/`string`
// unions even though the backend sends structured data. These types mirror the
// actual runtime shape so the normalization mapper (`analysis-mapper.ts`) can
// work with precise types after a single cast. Like `analysis-types.ts`, this
// file is intentionally separate from the generated API types: regenerating
// `api.d.ts` from the OpenAPI spec never touches it.

export type MatchResultsSideColor = 'red' | 'blue'

// The API side vocabulary is attacker/defender; the frontend analysis types
// use attacking/defending. The mapper translates between them.
export type MatchResultsSideAssignment = 'attacker' | 'defender'

export type MatchResultsStatus =
  'upload_pending' | 'processing' | 'ready' | 'failed'

export type MatchResultsMap = {
  id: number
  name: string
  image_url: string | null
}

export type MatchResultsFinalScore = Record<MatchResultsSideColor, number>

export type MatchResultsParticipant = {
  // Route params are strings; participant ids may be numeric, so consumers
  // coerce via String() before comparing (see `participantTeamId`).
  team_id: number | string
  team_name: string
  color: string
  is_uploaded_from: boolean
  logo_url: string | null
  score: number
  is_winner: boolean
}

export type MatchResultsPerspective = {
  team_id: string
  color: string
  side: MatchResultsSideAssignment
}

export type MatchResultsTrajectoryPoint = {
  t_ms: number
  x: number
  y: number
}

export type MatchResultsTrajectory = {
  track_id: number
  icon_type: string
  team_color: MatchResultsSideColor
  attached_to_track_id?: number | null
  points: Array<MatchResultsTrajectoryPoint>
}

export type MatchResultsRound = {
  round_number: number
  side: Record<MatchResultsSideColor, MatchResultsSideAssignment>
  winner: MatchResultsSideColor
  score_after: MatchResultsFinalScore
  round_start_ms: number
  tracking_cutoff_ms: number
  trajectories: Array<MatchResultsTrajectory>
}

export type MatchResultsMapCrop = {
  width: number
  height: number
}

export type MatchResultsPlayback = {
  map_slug: string
  map_crop: MatchResultsMapCrop
  fps: number
  rounds: Array<MatchResultsRound>
}

export type MatchResultsUtilityLandingPoint = {
  x: number
  y: number
  round_number: number
}

export type MatchResultsUtility = {
  icon_type: string
  landing_points: Array<MatchResultsUtilityLandingPoint>
  throw_count: number
  rounds_with_use: number
  rounds_total: number
  usage_pct: number
  avg_per_round: number
}

// Keyed by player/track identifier to a grid of normalized weights; the
// frontend consumes these for the player heatmap overlay.
export type MatchResultsHeatmap = {
  dwell: Record<string, number[][]>
  traffic: Record<string, number[][]>
}

export type MatchResults = {
  id: number
  name: string
  played_at: string | null
  status: MatchResultsStatus
  map: MatchResultsMap
  final_score: MatchResultsFinalScore
  participants: Array<MatchResultsParticipant>
  winner_team_id: string | null
  perspective: MatchResultsPerspective
  player_heatmaps: MatchResultsHeatmap
  utility: Array<MatchResultsUtility>
  playback: MatchResultsPlayback
}
