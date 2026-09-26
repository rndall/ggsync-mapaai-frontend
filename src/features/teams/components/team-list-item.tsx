import { Link } from '@tanstack/react-router'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from 'cn'
import { EllipsisVertical } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

import { getTeamNameInitials } from '../utils'

const teamItemVariants = cva('gap-6 rounded-sm p-6', {
  variants: {
    variant: {
      default: 'team-card',
      myTeam: 'my-team-card',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export default function TeamListItem({
  id,
  name,
  description,
  logoUrl,
  variant,
}: VariantProps<typeof teamItemVariants> & {
  id: number
  name: string
  description: string | null
  logoUrl: string | null
}) {
  const initials = getTeamNameInitials(name)

  return (
    <Item
      variant="outline"
      render={
        <Link
          to="/teams/$teamId"
          params={{ teamId: String(id) }}
          className="hover:bg-transparent!"
        />
      }
      className={teamItemVariants({
        variant,
        className: 'relative overflow-hidden',
      })}
    >
      <div
        className={cn(
          'absolute inset-0 z-10 h-full w-1.25',
          variant === 'myTeam' && 'bg-primary',
        )}
      />
      <ItemMedia>
        <Avatar className="size-20">
          <AvatarImage src={logoUrl || undefined} />
          <AvatarFallback className="text-3xl font-bold uppercase">
            {initials}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="font-heading text-xl">{name}</ItemTitle>
        <ItemDescription className="text-base">{description}</ItemDescription>
      </ItemContent>
      <ItemContent className="items-center px-5">
        <span className="font-heading text-2xl leading-none font-black">
          97%
        </span>
        <span className="text-base text-primary">Overall Win %</span>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Team options"
          onClick={(e) => {
            e.preventDefault()
          }}
        >
          <EllipsisVertical className="size-4" />
        </Button>
      </ItemActions>
    </Item>
  )
}
