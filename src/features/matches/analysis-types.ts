// Frontend-owned per-match analysis contract.
//
// This mirrors the agreed sample payload until the backend analysis endpoint
// exists. It is intentionally separate from the generated API types
// (`@/types/api`): no generated-types change ships until the backend OpenAPI
// for `GET /matches/{match}/analysis` lands, at which point only the query
// module's fetcher maps the backend response onto this shape.

export type TeamSideColor = 'red' | 'blue'

export type SideAssignment = 'attacking' | 'defending'

export type AnalysisRoundStatus = 'ok' | 'failed'

export type ZoneName = 'A' | 'B' | 'Mid'

export type MapCrop = {
  width: number
  height: number
}

export type FinalScore = Record<TeamSideColor, number>

export type ZoneCounts = Record<ZoneName, number>

export type ZoneSplit = {
  zoneCounts: ZoneCounts
  totalDetected: number
  // Detector confidence in the 0-1 range. Low values render a badge downstream
  // but never block rendering.
  confidence: number
}

export type TrajectoryPoint = {
  // Milliseconds since the match (or recording) start.
  tMs: number
  // Crop-pixel coordinates in the processing frame, normalized downstream as
  // x / crop.width and y / crop.height.
  x: number
  y: number
}

export type Trajectory = {
  // Player tracks end in `player` (e.g. `blue_player`); event tracks are bomb
  // and grenade types (e.g. `frag_grenade`, `bomb_plant`). `bomb_carried`
  // markers exist but are excluded from the utility mix downstream.
  iconType: string
  teamColor: TeamSideColor
  points: Array<TrajectoryPoint>
}

export type ZoneEntry = {
  zone: ZoneName
  teamColor: TeamSideColor
}

export type AnalysisRound = {
  roundNumber: number
  status: AnalysisRoundStatus
  // Side each team played this round. Complementary in practice (one attacks
  // while the other defends); lens-plus-side filtering matches the active
  // team's entry here against the selected Attacking/Defending toggle.
  side: Record<TeamSideColor, SideAssignment>
  scoreAfter: FinalScore
  teamSplit: Record<TeamSideColor, ZoneSplit>
  // Site held at the round cutoff, when the backend reports one.
  heldSite: ZoneName | null
  zoneEntries: Array<ZoneEntry>
  trajectories: Array<Trajectory>
  // Round window in the same clock as trajectory `tMs`. Only points with
  // startMs <= tMs <= cutoffMs contribute to heat downstream.
  startMs: number
  cutoffMs: number
}

export type MatchAnalysis = {
  matchId: number
  mapSlug: string
  mapCrop: MapCrop
  finalScore: FinalScore
  targetScore: number
  rounds: Array<AnalysisRound>
}
