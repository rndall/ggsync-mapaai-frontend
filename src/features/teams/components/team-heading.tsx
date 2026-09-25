import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { getTeamNameInitials } from '@/features/teams/utils'

const routeApi = getRouteApi('/_authed/teams/$teamId')

export function TeamHeading() {
  const context = routeApi.useRouteContext()
  const { data } = useSuspenseQuery(context.teamQueryOptions)

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={data.data.logo_url || undefined} />
        <AvatarFallback>{getTeamNameInitials(data.data.name)}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="font-heading text-3xl">{data.data.name}</h1>
        <p className="text-muted-foreground">{data.data.description}</p>
      </div>
    </div>
  )
}

export function TeamHeadingSkeleton() {
  return (
    <div aria-hidden className="flex gap-4">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
    </div>
  )
}
