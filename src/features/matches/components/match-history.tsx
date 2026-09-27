import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import MatchItem from '@/features/matches/components/match-item'
import { mapQueries, matchQueries } from '@/features/matches/queries'
import { usePerMapStatsParams } from '@/features/teams/components/per-map-stats/use-per-map-stats-params'

import UploadMatchDrawer from './upload-match-drawer'

const teamRouteApi = getRouteApi('/_authed/teams/$teamId')

export default function MatchHistory() {
  const { teamId } = teamRouteApi.useParams()
  const teamIdNumber = Number(teamId)
  const hasTeam = Number.isFinite(teamIdNumber)

  // Shares the Per Map Stats map selection (?map=) so the history lists
  // matches for the selected map. Same fallback as PerMapStats: a missing
  // or stale id resolves to the first available map.
  const mapsQuery = useQuery(mapQueries.list())
  const { map: mapParam } = usePerMapStatsParams()
  const maps = mapsQuery.data?.data ?? []
  const selectedMapId = maps.some(
    (option) => String(option.id) === mapParam,
  )
    ? mapParam
    : maps[0] !== undefined
      ? String(maps[0].id)
      : ''
  const selectedMapIdNumber = Number(selectedMapId)

  const matchesQuery = useQuery({
    ...matchQueries.teamList(hasTeam ? teamIdNumber : 0, {
      map_id: selectedMapIdNumber,
    }),
    enabled:
      hasTeam && selectedMapId !== '' && Number.isFinite(selectedMapIdNumber),
  })
  const matches = matchesQuery.data?.data.matches ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl">Match History</h2>
        <UploadMatchDrawer teamId={teamId} />
      </div>
      <Separator />
      {matchesQuery.isPending || mapsQuery.isPending ? (
        <MatchHistorySkeleton />
      ) : matchesQuery.isError || mapsQuery.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Failed to load match history.
        </p>
      ) : matches.length === 0 ? (
        <MatchHistoryEmptyState />
      ) : (
        <ItemGroup>
          {matches.map((match) => (
            <MatchItem key={match.id} match={match} teamId={teamId} />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

function MatchHistorySkeleton() {
  return (
    <ItemGroup aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-19 rounded-none" />
      ))}
    </ItemGroup>
  )
}

function MatchHistoryEmptyState() {
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
