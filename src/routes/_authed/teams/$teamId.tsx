import { createFileRoute, Link } from '@tanstack/react-router'
import { CircleArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

import { buttonVariants } from '@/components/ui/button'
import MatchHistory from '@/features/matches/components/match-history'
import PerMapStats from '@/features/teams/components/per-map-stats/per-map-stats'
import {
  TeamHeading,
  TeamHeadingSkeleton,
} from '@/features/teams/components/team-heading'
import { teamQueries } from '@/features/teams/queries'

export const Route = createFileRoute('/_authed/teams/$teamId')({
  context: ({ params }) => ({
    teamQueryOptions: teamQueries.detail(Number(params.teamId)),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.teamQueryOptions,
      staleTime: 'static',
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <Link
        to="/teams"
        className={buttonVariants({
          variant: 'link',
          className: 'self-start font-sans',
        })}
      >
        <CircleArrowLeft data-icon="inline-start" />
        Back to Teams
      </Link>
      <div className="flex flex-col gap-10">
        <Suspense fallback={<TeamHeadingSkeleton />}>
          <TeamHeading />
        </Suspense>
        <PerMapStats />
      </div>
      <MatchHistory />
    </div>
  )
}
