import { Link } from '@tanstack/react-router'
import { Fragment } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import type { MatchCard } from '@/features/matches/utils'
import {
  formatCardDate,
  mapBackground,
  statusBadgeLabel,
} from '@/features/matches/utils'

export default function MatchListItem({
  id,
  name,
  timestamp,
  mapName,
  status,
  participants,
}: MatchCard) {
  const background = mapBackground(mapName)
  const badgeLabel = statusBadgeLabel(status)

  return (
    <Link
      to="/matches/$matchId"
      params={{ matchId: String(id) }}
      className="h-full"
    >
      <Item className="h-full flex-col flex-nowrap items-stretch overflow-hidden rounded-lg bg-[linear-gradient(90.01deg,rgba(47,112,204,0.2)_0.01%,rgba(0,82,197,0)_228.76%)] p-0">
        <ItemHeader className="relative min-h-44 basis-auto font-bold">
          {background && (
            <div aria-hidden className="absolute inset-0 overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: `url(${background.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: background.position,
                  transform:
                    background.scale !== 1
                      ? `scale(${background.scale})`
                      : undefined,
                  transformOrigin: background.origin,
                }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-b from-[#0D1722]/[0.56] to-[#0D1722]" />

          {badgeLabel && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 z-20 text-xs"
            >
              {badgeLabel}
            </Badge>
          )}

          {/* Equal flex tracks: a long name wraps inside its own half
              instead of stealing width from the other side, so the VS
              divider stays centred. */}
          <div className="relative z-10 flex grow">
            {participants.map((participant, index) => (
              <Fragment key={participant.teamId}>
                {index > 0 && (
                  <div className="self-center text-center *:leading-none">
                    <p className="text-muted">VS</p>
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2 px-2">
                  <Avatar size="xl">
                    <AvatarImage src={participant.logo ?? undefined} />
                    <AvatarFallback className="text-lg uppercase">
                      {participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-center uppercase">{participant.name}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </ItemHeader>
        <ItemContent className="grow px-4 pb-3">
          <ItemTitle className="text-lg leading-5 font-bold">{name}</ItemTitle>
          <ItemDescription className="font-bold text-muted uppercase">
            {formatCardDate(timestamp)}
          </ItemDescription>
        </ItemContent>
      </Item>
    </Link>
  )
}
