import { Trophy } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

export function MatchDetailLoading() {
  return (
    <div className="flex flex-col gap-4">
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Spinner className="size-4" aria-hidden />
        Loading match…
      </p>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  )
}

export function MatchDetailError({
  message = 'Failed to load match.',
}: {
  message?: string
}) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}

export function MatchDetailEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Trophy />
        </EmptyMedia>
        <EmptyTitle>No teams in this match</EmptyTitle>
        <EmptyDescription>
          This match has no participating teams to show.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
