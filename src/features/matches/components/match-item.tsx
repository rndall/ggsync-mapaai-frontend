import { Link } from '@tanstack/react-router'
import { cva } from 'class-variance-authority'
import { Ellipsis, Eye } from 'lucide-react'

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import type {
  MatchHistoryVariant,
  MatchResource,
} from '@/features/matches/utils'
import {
  capitalizeWords,
  formatHistoryDate,
  historyMatchup,
  historyStatusLabel,
  toHistoryVariant,
} from '@/features/matches/utils'

const matchItemVariants = cva('rounded-none border-l-4', {
  variants: {
    variant: {
      analyzing: 'border-l-[#B5C6DD]',
      victory: 'border-l-primary',
      defeat: 'border-l-destructive',
    } satisfies Record<MatchHistoryVariant, string>,
  },
})

const matchItemLabelVariants = cva('font-heading uppercase', {
  variants: {
    variant: {
      analyzing: 'text-[#B5C6DD]',
      victory: 'text-primary',
      defeat: 'text-destructive',
    } satisfies Record<MatchHistoryVariant, string>,
  },
})

interface MatchItemProps {
  match: MatchResource
  teamId: string
}

export default function MatchItem({ match, teamId }: MatchItemProps) {
  const variant = toHistoryVariant(match.status)
  const isReady = match.status === 'ready'

  const row = (
    <div className="block">
      <Item
        className={matchItemVariants({
          variant,
          className:
            'justify-between bg-[#1C304C29] px-6 py-4 transition-colors *:flex-1! hover:bg-[#1C304C55]',
        })}
      >
        <ItemContent className="gap-0">
          <ItemDescription
            className={matchItemLabelVariants({
              variant,
              className: 'text-base',
            })}
          >
            {historyStatusLabel(match.status)}
          </ItemDescription>
          <ItemDescription className="text-sm text-muted">
            {formatHistoryDate(match.played_at, match.created_at)}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="gap-0">
          <ItemTitle className="text-base">{historyMatchup(match)}</ItemTitle>
          <ItemDescription className="text-sm text-muted">
            {match.name}
          </ItemDescription>
        </ItemContent>
        <ItemContent>
          <ItemDescription className="text-center text-base font-bold">
            {match.map?.name ? capitalizeWords(match.map.name) : '—'}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="items-end justify-center">
          {isReady ? (
            <Link
              to="/matches/$matchId/$teamId"
              params={{ matchId: String(match.id), teamId }}
              aria-label={`View ${match.name} analysis`}
              className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
            >
              <Eye className="size-4" aria-hidden />
            </Link>
          ) : (
            <Ellipsis className="size-5 text-muted" aria-hidden />
          )}
        </ItemContent>
      </Item>
    </div>
  )

  return row
}
