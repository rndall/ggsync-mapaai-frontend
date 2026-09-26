import { cn } from 'cn'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { getTeamNameInitials } from '../utils'

type TeamAvatarProps = {
  name: string
  logoUrl?: string | null
  className?: string
  fallbackClassName?: string
}

// One answer to "how does a team look": the logo when the resource carries
// one, team-name initials when it does not. Match cards and the match score
// header both come through here so the two can never disagree on the
// fallback.
export function TeamAvatar({
  name,
  logoUrl,
  className,
  fallbackClassName,
}: TeamAvatarProps) {
  return (
    <Avatar size="xl" className={className}>
      <AvatarImage src={logoUrl ?? undefined} />
      <AvatarFallback className={cn('uppercase', fallbackClassName)}>
        {getTeamNameInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
