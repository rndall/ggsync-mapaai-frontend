import { getRouteApi, Navigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { selectPlayerHeatPoints } from '@/features/matches/analysis-heat'
import type {
  FinalScore,
  MatchAnalysis,
} from '@/features/matches/analysis-types'
import { MatchScoreHeader } from '@/features/matches/components/match-score-header'
import type { MatchResource } from '@/features/matches/utils'
import {
  capitalizeWords,
  formatCardDate,
  statusBadgeLabel,
} from '@/features/matches/utils'
import PerMapStats from '@/features/teams/components/per-map-stats/per-map-stats'
import { PerMapStatsViewTabs } from '@/features/teams/components/per-map-stats/per-map-stats-view-tabs'
import { usePerMapStatsParams } from '@/features/teams/components/per-map-stats/use-per-map-stats-params'

import {
  MatchDetailEmpty,
  MatchDetailError,
  MatchDetailLoading,
} from './match-detail-feedback'
import { MatchHeatmap } from './match-heatmap'
import {
  isMatchParticipant,
  orderParticipantsBySide,
  participantSideColor,
  participantTeamId,
  pickPerspectiveTeamId,
} from './match-perspective'
import { useMatchAnalysisQuery } from './use-match-analysis-query'
import { useMatchQuery } from './use-match-query'

const teamRouteApi = getRouteApi('/_authed/matches/$matchId/$teamId')

// Canonical team-scoped match view. The match is fetched once per match and
// the team perspective is derived client-side, so switching teams flips the
// same widgets without a new fetch and a future backend perspective
// parameter can drop in without a route change.
export function MatchTeamView() {
  const { teamId } = teamRouteApi.useParams()
  const { matchIdNumber, matchQuery } = useMatchQuery()
  // Resolved (and cached) for every numeric match id so downstream slices —
  // real final score, heat, setups, utility — read one shared result.
  // Disabled for non-numeric ids, mirroring the match detail guard. Resolving
  // here keeps the seam at this view.
  const { matchAnalysisQuery } = useMatchAnalysisQuery()

  if (!Number.isFinite(matchIdNumber)) {
    return <MatchDetailError message="Match not found." />
  }
  if (matchQuery.isPending) return <MatchDetailLoading />
  if (matchQuery.isError) return <MatchDetailError />

  const match = matchQuery.data.data
  const participants = match.participants
  const ordered = orderParticipantsBySide(participants)
  if (ordered.length === 0) return <MatchDetailEmpty />

  // Stale or typed team segments self-heal onto the auto-picked valid team
  // instead of 404ing.
  if (!isMatchParticipant(participants, teamId)) {
    const targetTeamId = pickPerspectiveTeamId(participants)
    if (!targetTeamId) return <MatchDetailEmpty />
    return (
      <Navigate
        to="/matches/$matchId/$teamId"
        params={{
          matchId: String(matchQuery.data.data.id),
          teamId: targetTeamId,
        }}
        replace
      />
    )
  }

  // Real analysis only for a ready match; pending, processing, failed, or
  // errored analysis keeps every fallback treatment so the page never reads
  // mock-shaped data with no analysis behind it.
  const analysis: MatchAnalysis | null =
    match.status === 'ready' ? (matchAnalysisQuery.data ?? null) : null
  const finalScore: FinalScore | null = analysis?.finalScore ?? null

  return (
    <MatchTeamViewContent
      match={match}
      activeTeamId={teamId}
      finalScore={finalScore}
      analysis={analysis}
    />
  )
}

function MatchTeamViewContent({
  match,
  activeTeamId,
  finalScore,
  analysis,
}: {
  match: MatchResource
  activeTeamId: string
  finalScore: FinalScore | null
  analysis: MatchAnalysis | null
}) {
  const { matchId } = teamRouteApi.useParams()
  const navigate = teamRouteApi.useNavigate()
  const { view, side, heat, setHeat } = usePerMapStatsParams()
  const ordered = orderParticipantsBySide(match.participants)
  const active = ordered.find(
    (participant) => participantTeamId(participant) === activeTeamId,
  )
  // Guarded above by the participant check; staying total keeps the render
  // honest if the data changes between the two passes.
  if (!active) {
    return <MatchDetailError message="Team not found in this match." />
  }

  // Player heat follows the active team lens (by side color) and the selected
  // Attacking/Defending toggle. Memoized so the canvas effect only re-renders
  // when the selection actually changes.
  const activeColor = participantSideColor(active)
  const heatSelection = useMemo(
    () =>
      analysis
        ? selectPlayerHeatPoints(analysis, activeColor, side, heat)
        : null,
    [analysis, activeColor, side, heat],
  )
  // The Player tab swaps the placeholder for live heat; the Utility tab keeps
  // the placeholder until the row-driven heat ticket reuses this module.
  const minimap =
    view === 'player' && analysis && heatSelection ? (
      <MatchHeatmap
        mapSlug={analysis.mapSlug}
        mapCrop={analysis.mapCrop}
        points={heatSelection.points}
        heat={heat}
        onHeatChange={(value) => void setHeat(value)}
        matchedRounds={heatSelection.matchedRounds}
        failedRounds={heatSelection.failedRounds}
        lowConfidence={heatSelection.lowConfidence}
        teamLabel={active.team_name}
        sideLabel={side === 'attacking' ? 'Attacking' : 'Defending'}
      />
    ) : undefined

  const badgeLabel = statusBadgeLabel(match.status)
  const mapName = match.map?.name ? capitalizeWords(match.map.name) : '—'
  const playedOn = formatCardDate(match.played_at || match.created_at)

  // The header's team names are the perspective switch. Replace, never push:
  // Back from either perspective exits the match instead of ping-ponging
  // between the two teams.
  function handleTeamChange(nextTeamId: string) {
    if (nextTeamId === activeTeamId) return
    void navigate({
      to: '/matches/$matchId/$teamId',
      params: { matchId, teamId: nextTeamId },
      replace: true,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">{match.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[mapName, playedOn].filter(Boolean).join(' • ')}
          </p>
        </div>
        {badgeLabel && (
          <Badge variant="secondary" className="h-10 p-3 text-sm">
            {badgeLabel}
          </Badge>
        )}
      </div>

      {/* The score header stands in for Per Map Stats' map banner and its own
          view switch: a match already frames its own two teams, and the
          header's team names are the perspective switch. Header and panel
          share one card, so the tabs stay attached to the stats. mapId pins
          the read to the match's own map, since the page has no picker to
          set it with. */}
      <PerMapStats
        header={
          <MatchScoreHeader
            match={match}
            activeTeamId={activeTeamId}
            onTeamChange={handleTeamChange}
            finalScore={finalScore}
            tabs={<PerMapStatsViewTabs />}
            className="rounded-none border-0"
          />
        }
        minimap={minimap}
        mapId={match.map ? String(match.map.id) : undefined}
        showFilters={false}
        showTitle={false}
      />
    </div>
  )
}
