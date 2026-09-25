import { Users } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import TeamListItem from '@/features/teams/components/team-list-item'
import type { components } from '@/types/api'

type TeamResource = components['schemas']['TeamResource']

interface TeamListProps {
  teams: TeamResource[]
}

export default function TeamList({ teams }: TeamListProps) {
  if (teams.length === 0) {
    return <TeamsEmptyState />
  }

  return (
    <ItemGroup>
      {teams.map((team) => (
        <TeamListItem
          key={team.id}
          id={team.id}
          name={team.name}
          description={team.description}
          logoUrl={team.logo_url}
        />
      ))}
    </ItemGroup>
  )
}

function TeamSkeletonItem() {
  return (
    <div
      aria-hidden
      className="flex w-full flex-wrap items-center gap-6 rounded-sm border border-border p-6"
    >
      <Skeleton className="size-20 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="flex flex-col items-center gap-2 px-5">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="size-8 rounded-full" />
    </div>
  )
}

export function TeamListFallback({ count = 3 }: { count?: number }) {
  return (
    <ItemGroup>
      {Array.from({ length: count }).map((_, index) => (
        <TeamSkeletonItem key={index} />
      ))}
    </ItemGroup>
  )
}

export function TeamsEmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users />
        </EmptyMedia>
        <EmptyTitle>No teams yet</EmptyTitle>
        <EmptyDescription>
          Teams you create or follow will appear here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
