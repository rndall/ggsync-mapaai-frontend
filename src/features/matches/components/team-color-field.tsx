import { cn } from 'cn'
import { useState } from 'react'

import type { TeamOption } from '@/features/matches/components/team-combobox'
import TeamCombobox from '@/features/matches/components/team-combobox'

type Side = 'red' | 'blue'

type SideConfig = {
  side: Side
  label: string
  pillClassName: string
  dotFillClassName: string
  dotRingClassName: string
}

const SIDE_CONFIGS: SideConfig[] = [
  {
    side: 'red',
    label: 'Red',
    pillClassName: 'border-red-500/40 bg-red-950/40 text-red-50',
    dotFillClassName: 'bg-red-500',
    dotRingClassName: 'ring-red-400/30',
  },
  {
    side: 'blue',
    label: 'Blue',
    pillClassName: 'border-blue-500/40 bg-blue-950/40 text-blue-50',
    dotFillClassName: 'bg-blue-500',
    dotRingClassName: 'ring-blue-400/30',
  },
]

type TeamColorFieldProps = {
  teamId?: string
  teams: TeamOption[]
  teamName?: string
  redTeamId: string
  blueTeamId: string
  onRedTeamChange: (value: string) => void
  onBlueTeamChange: (value: string) => void
  onRedBlur?: () => void
  onBlueBlur?: () => void
  redInvalid?: boolean | 'true' | 'false'
  blueInvalid?: boolean | 'true' | 'false'
  redInputId?: string
  blueInputId?: string
}

export default function TeamColorField({
  teamId,
  teams,
  teamName,
  redTeamId,
  blueTeamId,
  onRedTeamChange,
  onBlueTeamChange,
  onRedBlur,
  onBlueBlur,
  redInvalid,
  blueInvalid,
  redInputId,
  blueInputId,
}: TeamColorFieldProps) {
  const [contextSide, setContextSide] = useState<Side>('red')
  const isLocked = teamId !== undefined && teamId !== ''

  const handleToggle = (side: Side) => {
    if (!teamId || !isLocked || side === contextSide) {
      return
    }
    const opponent = contextSide === 'red' ? blueTeamId : redTeamId
    const nextOpponent = opponent === teamId ? '' : opponent
    setContextSide(side)
    if (side === 'red') {
      onRedTeamChange(teamId)
      onBlueTeamChange(nextOpponent)
    } else {
      onBlueTeamChange(teamId)
      onRedTeamChange(nextOpponent)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {SIDE_CONFIGS.map((config) => {
        const isRed = config.side === 'red'
        const isContextSide = isLocked && contextSide === config.side
        const isDotFilled = !isLocked || isContextSide
        const value = isRed ? redTeamId : blueTeamId
        const otherValue = isRed ? blueTeamId : redTeamId
        const pill = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'size-3 shrink-0 rounded-full ring-2',
                config.dotRingClassName,
                isDotFilled ? config.dotFillClassName : 'bg-transparent',
              )}
            />
            {config.label}
          </>
        )

        return (
          <div key={config.side} className="flex items-center gap-3">
            {isLocked ? (
              <button
                type="button"
                aria-pressed={isContextSide}
                aria-label={`Play as ${config.label}`}
                onClick={() => handleToggle(config.side)}
                className={cn(
                  'flex h-11 w-32 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm/relaxed font-medium transition-all outline-none hover:brightness-125 focus-visible:ring-2 focus-visible:ring-ring/30',
                  config.pillClassName,
                  isContextSide
                    ? 'ring-1 ring-white/25'
                    : 'opacity-70 hover:opacity-100',
                )}
              >
                {pill}
              </button>
            ) : (
              <div
                className={cn(
                  'flex h-11 w-32 shrink-0 items-center gap-2 rounded-md border px-4 text-sm/relaxed font-medium',
                  config.pillClassName,
                )}
              >
                {pill}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <TeamCombobox
                id={isRed ? redInputId : blueInputId}
                value={value}
                onValueChange={isRed ? onRedTeamChange : onBlueTeamChange}
                onBlur={isRed ? onRedBlur : onBlueBlur}
                teams={teams}
                excludeId={
                  isLocked
                    ? isContextSide
                      ? undefined
                      : teamId
                    : otherValue || undefined
                }
                placeholder={isLocked ? 'Select Opponent' : 'Select team'}
                disabled={isContextSide}
                aria-invalid={isRed ? redInvalid : blueInvalid}
                size="xl"
              />
            </div>
          </div>
        )
      })}
      {isLocked ? (
        <p className="text-right text-sm text-muted italic">
          Select which color {teamName ?? 'your team'} is playing as.
        </p>
      ) : null}
    </div>
  )
}
