import { createFileRoute } from '@tanstack/react-router'

import { MatchTeamView } from '@/features/matches/components/match-detail/match-team-view'

export const Route = createFileRoute('/_authed/matches/$matchId/$teamId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MatchTeamView />
}
