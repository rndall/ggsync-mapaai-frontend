import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { Spinner } from '@/components/ui/spinner'
import TeamList, {
  TeamListFallback,
  TeamsEmptyState,
} from '@/features/teams/components/team-list'
import { teamQueries } from '@/features/teams/queries'

export const Route = createFileRoute('/_authed/teams/')({
  context: () => {
    const teamsPerPage = 10
    return {
      teamsPerPage,
      teamsQueryOptions: teamQueries.infiniteList({
        per_page: teamsPerPage,
      }),
    }
  },
  loader: ({ context }) => {
    context.queryClient.infiniteQuery({
      ...context.teamsQueryOptions,
      staleTime: 'static',
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const context = Route.useRouteContext()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Teams</h1>
          <p className="text-sm text-muted-foreground">
            Manage esports teams for your scouting network.
          </p>
        </div>
      </div>
      <Suspense fallback={<TeamListFallback count={context.teamsPerPage} />}>
        <TeamListContent />
      </Suspense>
    </div>
  )
}

// Trailing placeholders while the next page fetches: a couple of rows, not
// another full page, so the list grows in place.
const TRAILING_SKELETON_COUNT = 2

function TeamListContent() {
  const context = Route.useRouteContext()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(context.teamsQueryOptions)
  const teams = data.pages.flatMap((page) => page.data.teams)
  // Start fetching well before the sentinel scrolls into view.
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '600px' })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage])

  if (teams.length === 0) return <TeamsEmptyState />

  return (
    <>
      <TeamList teams={teams} />
      <div ref={sentinelRef} aria-hidden className="h-px" />
      {isFetchingNextPage && (
        <>
          <p role="status" className="sr-only">
            Loading more teams
          </p>
          <div aria-hidden>
            <TeamListFallback count={TRAILING_SKELETON_COUNT} />
          </div>
          <Spinner className="size-6 self-center" />
        </>
      )}
    </>
  )
}
