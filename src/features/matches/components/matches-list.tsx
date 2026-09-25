import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import MatchItemGroup, {
  matchGridClassName,
  MatchItemGroupFallback,
  MatchSkeletonCard,
} from '@/features/matches/components/match-item-group'
import { toMatchCard } from '@/features/matches/utils'

const routeApi = getRouteApi('/_authed/matches/')

export function MatchesList() {
  const context = routeApi.useRouteContext()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(context.matchesQueryOptions)
  const matches = data.pages
    .flatMap((page) => page.data.matches)
    .map(toMatchCard)
  // Start fetching well before the sentinel scrolls into view.
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '600px' })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage])

  if (matches.length === 0) return <MatchesEmptyState />

  return (
    <>
      <MatchItemGroup matches={matches} />
      <div ref={sentinelRef} aria-hidden className="h-px" />
      {isFetchingNextPage && (
        <>
          <p role="status" className="sr-only">
            Loading more matches
          </p>
          <ItemGroup aria-hidden className={matchGridClassName}>
            {Array.from({ length: TRAILING_SKELETON_COUNT }).map((_, index) => (
              <MatchSkeletonCard key={index} />
            ))}
          </ItemGroup>
        </>
      )}
    </>
  )
}

// Trailing placeholders while the next page fetches: one full row at the
// widest breakpoint, not another full page, so the grid grows in place.
const TRAILING_SKELETON_COUNT = 4

export function MatchesListFallback() {
  const context = routeApi.useRouteContext()
  return <MatchItemGroupFallback count={context.matchesPerPage} />
}

export function MatchesEmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Trophy />
        </EmptyMedia>
        <EmptyTitle>No matches yet</EmptyTitle>
        <EmptyDescription>Played matches will appear here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
