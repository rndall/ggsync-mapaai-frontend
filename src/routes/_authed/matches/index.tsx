import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

import {
  MatchesList,
  MatchesListFallback,
} from '@/features/matches/components/matches-list'
import { matchQueries } from '@/features/matches/queries'

export const Route = createFileRoute('/_authed/matches/')({
  context: () => {
    const matchesPerPage = 12
    return {
      matchesPerPage,
      matchesQueryOptions: matchQueries.infiniteList({
        per_page: matchesPerPage,
      }),
    }
  },
  loader: ({ context }) => {
    context.queryClient.infiniteQuery({
      ...context.matchesQueryOptions,
      staleTime: 'static',
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl">Latest Games</h1>
        <p className="text-sm text-muted-foreground">
          View the latest match analysis!
        </p>
      </div>
      <Suspense fallback={<MatchesListFallback />}>
        <MatchesList />
      </Suspense>
    </div>
  )
}
