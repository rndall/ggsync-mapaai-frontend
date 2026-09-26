import { getRouteApi } from '@tanstack/react-router'

import { ItemGroup } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import MatchItem from '@/features/matches/components/match-item'

import UploadMatchDrawer from './upload-match-drawer'

const teamRouteApi = getRouteApi('/_authed/teams/$teamId')

export default function MatchHistory() {
  const { teamId } = teamRouteApi.useParams()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl">Match History</h2>
        <UploadMatchDrawer teamId={teamId} />
      </div>
      <Separator />
      <ItemGroup>
        <MatchItem variant="victory" matchId="abc123" />
        <MatchItem variant="defeat" matchId="def456" />
      </ItemGroup>
    </div>
  )
}
