import {
  createFileRoute,
  Outlet,
  useChildMatches,
} from '@tanstack/react-router'

import { MatchRedirector } from '@/features/matches/components/match-detail/match-redirector'
import { matchQueries } from '@/features/matches/queries'

export const Route = createFileRoute('/_authed/matches/$matchId')({
  context: ({ params }) => ({
    matchQueryOptions: matchQueries.detail(Number(params.matchId)),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.matchQueryOptions,
      staleTime: 'static',
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  // The bare address exists only as a redirector. When the canonical
  // team-scoped child matches, its view renders in the outlet instead — the
  // redirector must not render above it.
  const childMatches = useChildMatches()
  if (childMatches.length > 0) return <Outlet />
  return <MatchRedirector />
}
