import { ItemGroup } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import MatchListItem from '@/features/matches/components/match-list-item'
import type { MatchCard } from '@/features/matches/utils'

export const matchGridClassName =
  'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export default function MatchItemGroup({ matches }: { matches: MatchCard[] }) {
  return (
    <ItemGroup className={matchGridClassName}>
      {matches.map((match) => (
        <MatchListItem key={match.id} {...match} />
      ))}
    </ItemGroup>
  )
}

export function MatchSkeletonCard() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-[linear-gradient(90.01deg,rgba(47,112,204,0.2)_0.01%,rgba(0,82,197,0)_228.76%)]">
      <Skeleton className="min-h-44 rounded-none" />
      <div className="flex grow flex-col gap-2 px-4 py-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function MatchItemGroupFallback({ count = 4 }: { count?: number }) {
  return (
    <ItemGroup className={matchGridClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <MatchSkeletonCard key={index} />
      ))}
    </ItemGroup>
  )
}
