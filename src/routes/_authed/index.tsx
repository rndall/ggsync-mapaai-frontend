import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Suspense } from 'react'

import { buttonVariants } from '@/components/ui/button'
import MatchItemGroup, {
  MatchItemGroupFallback,
} from '@/features/matches/components/match-item-group'
import { matchQueries } from '@/features/matches/queries'
import { toMatchCard } from '@/features/matches/utils'
import TeamList, { TeamListFallback } from '@/features/teams/components/team-list'
import { teamQueries } from '@/features/teams/queries'

import DashboardBackground from './-components/dashboard-background'

export const Route = createFileRoute('/_authed/')({
  context: () => ({
    teamsQueryOptions: teamQueries.list({ per_page: 2 }),
    matchesQueryOptions: matchQueries.list({ per_page: 4 }),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.matchesQueryOptions,
      staleTime: 'static',
    })
    context.queryClient.query({
      ...context.teamsQueryOptions,
      staleTime: 'static',
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative -m-12 overflow-hidden bg-background">
      <DashboardBackground />

      <div className="relative z-10 flex flex-col gap-14 p-12">
        <div className="mt-45">
          <h1 className="w-sm font-heading text-3xl">
            Explore the latest updates and insights.
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl">Latest Matches</h2>
            <Link
              to="/matches"
              className={buttonVariants({
                variant: 'link',
                className: 'font-mono uppercase',
              })}
            >
              View All Matches
            </Link>
          </div>
          <Suspense fallback={<MatchItemGroupFallback count={4} />}>
            <LatestMatches />
          </Suspense>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl">Teams</h2>
            <Link
              to="/teams"
              className={buttonVariants({
                variant: 'link',
                className: 'font-mono uppercase',
              })}
            >
              View All Teams
            </Link>
          </div>
          <Suspense fallback={<TeamListFallback count={2} />}>
            <LatestTeams />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function LatestMatches() {
  const context = Route.useRouteContext()
  const { data: matchesData } = useSuspenseQuery(context.matchesQueryOptions)
  const matches = matchesData.data.matches.map(toMatchCard)
  return <MatchItemGroup matches={matches} />
}

function LatestTeams() {
  const context = Route.useRouteContext()
  const { data } = useSuspenseQuery(context.teamsQueryOptions)
  return <TeamList teams={data.data.teams} />
}
