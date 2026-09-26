import { useQuery } from '@tanstack/react-query'
import { getRouteApi, Navigate, useLocation } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MatchResource } from '@/features/matches/utils'
import {
  capitalizeWords,
  formatCardDate,
  statusBadgeLabel,
} from '@/features/matches/utils'

import {
  MatchDetailEmpty,
  MatchDetailError,
  MatchDetailLoading,
} from './match-detail-feedback'
import {
  isMatchParticipant,
  orderParticipantsBySide,
  participantTeamId,
  pickPerspectiveTeamId,
  readOriginTeamId,
  sideLabel,
} from './match-perspective'

const matchRouteApi = getRouteApi('/_authed/matches/$matchId')
const teamRouteApi = getRouteApi('/_authed/matches/$matchId/$teamId')

// Canonical team-scoped match view. The match is fetched once per match and
// the team perspective is derived client-side, so switching teams flips the
// same widgets without a new fetch and a future backend perspective
// parameter can drop in without a route change.
export function MatchTeamView() {
  const { matchId, teamId } = teamRouteApi.useParams()
  const context = matchRouteApi.useRouteContext()
  const locationState = useLocation({
    select: (location) => location.state,
  })
  const matchIdNumber = Number(matchId)

  const matchQuery = useQuery({
    ...context.matchQueryOptions,
    enabled: Number.isFinite(matchIdNumber),
  })

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
    const targetTeamId = pickPerspectiveTeamId(
      participants,
      readOriginTeamId(locationState),
    )
    if (!targetTeamId) return <MatchDetailEmpty />
    return (
      <Navigate
        to="/matches/$matchId/$teamId"
        params={{ matchId, teamId: targetTeamId }}
        replace
      />
    )
  }

  return <MatchPerspective match={match} activeTeamId={teamId} />
}

function MatchPerspective({
  match,
  activeTeamId,
}: {
  match: MatchResource
  activeTeamId: string
}) {
  const { matchId } = teamRouteApi.useParams()
  const navigate = teamRouteApi.useNavigate()
  const ordered = orderParticipantsBySide(match.participants)
  const active = ordered.find(
    (participant) => participantTeamId(participant) === activeTeamId,
  )
  // Guarded above by the participant check; staying total keeps the render
  // honest if the data changes between the two passes.
  if (!active) {
    return <MatchDetailError message="Team not found in this match." />
  }
  const opponent =
    ordered.find(
      (participant) => participantTeamId(participant) !== activeTeamId,
    ) ?? null

  const badgeLabel = statusBadgeLabel(match.status)
  const mapName = match.map?.name ? capitalizeWords(match.map.name) : '—'
  const playedOn = formatCardDate(match.played_at || match.created_at)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">{match.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[mapName, playedOn].filter(Boolean).join(' • ')}
          </p>
        </div>
        {badgeLabel && <Badge variant="secondary">{badgeLabel}</Badge>}
      </div>

      <Tabs
        value={activeTeamId}
        onValueChange={(nextTeamId) => {
          // Replace, never push: Back from either perspective exits the
          // match instead of ping-ponging between the two teams.
          if (nextTeamId !== activeTeamId) {
            void navigate({
              to: '/matches/$matchId/$teamId',
              params: { matchId, teamId: nextTeamId },
              replace: true,
            })
          }
        }}
      >
        <TabsList aria-label="Team perspective">
          {ordered.map((participant) => (
            <TabsTrigger
              key={participantTeamId(participant)}
              value={participantTeamId(participant)}
            >
              {participant.team_name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section
        aria-label="Match perspective"
        className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
      >
        <div>
          <p className="text-sm text-muted-foreground">Viewing as</p>
          <p className="font-heading text-xl">
            {active.team_name} ({sideLabel(active.color)} side)
          </p>
          {active.is_uploaded_from && (
            <p className="text-sm text-muted-foreground">
              Match footage uploaded from this team.
            </p>
          )}
        </div>
        {opponent && (
          <div>
            <p className="text-sm text-muted-foreground">Opponent</p>
            <p className="font-heading text-xl">
              {opponent.team_name} ({sideLabel(opponent.color)} side)
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
