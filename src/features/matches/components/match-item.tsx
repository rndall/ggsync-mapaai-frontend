import { getRouteApi, Link } from '@tanstack/react-router'
import { cva } from 'class-variance-authority'

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'

const matchItemVariants = cva('rounded-none border-l-4', {
  variants: {
    variant: {
      victory: 'border-l-primary',
      defeat: 'border-l-[#B5C6DD]',
    },
  },
})

const matchItemDescriptionVariants = cva('font-heading', {
  variants: {
    variant: {
      victory: 'text-primary',
      defeat: 'text-[#B5C6DD]',
    },
  },
})

interface MatchItemProps {
  variant: 'victory' | 'defeat'
  matchId: string
}

const teamRouteApi = getRouteApi('/_authed/teams/$teamId')

export default function MatchItem({ variant, matchId }: MatchItemProps) {
  const { teamId } = teamRouteApi.useParams()

  return (
    <Link
      to="/matches/$matchId/$teamId"
      params={{ matchId, teamId }}
      className="block"
    >
      <Item
        className={matchItemVariants({
          variant,
          className:
            'justify-between bg-[#1C304C29] px-6 py-4 transition-colors *:flex-1! hover:bg-[#1C304C55]',
        })}
      >
        <ItemContent>
          <ItemDescription
            className={matchItemDescriptionVariants({
              variant,
              className: 'text-base',
            })}
          >
            {variant === 'victory' ? 'Victory' : 'Defeat'}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="gap-0">
          <ItemTitle className="text-base">Team Ryza vs T1</ItemTitle>
          <ItemDescription className="text-sm text-muted">
            VCT Kineme
          </ItemDescription>
        </ItemContent>
        <ItemContent>
          <ItemDescription className="text-center text-base font-bold">
            Map 01
          </ItemDescription>
        </ItemContent>
        <ItemContent>
          <ItemDescription className="text-end text-sm text-muted">
            13/12/2023
          </ItemDescription>
        </ItemContent>
      </Item>
    </Link>
  )
}
