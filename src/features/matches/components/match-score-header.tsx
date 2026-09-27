import { cva } from 'class-variance-authority'
import { cn } from 'cn'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import type { FinalScore } from '@/features/matches/analysis-types'
import type { MatchResource } from '@/features/matches/utils'
import { mapBackground } from '@/features/matches/utils'
import { TeamAvatar } from '@/features/teams/components/team-avatar'

import type { MatchParticipant } from './match-detail/match-perspective'
import {
  orderParticipantsBySide,
  participantTeamId,
} from './match-detail/match-perspective'

// Fallback while the match is not ready or no analysis is available: the
// match resource carries no score, so both numbers are fixed for the layout
// review. They follow the blue-first side order used everywhere else, which
// keeps each number attached to the team it belongs to. Never render blank
// or zeroed — the owner passes a real `finalScore` once it exists.
const MOCK_SCORES = { blue: 4, red: 2 } satisfies FinalScore

// Each end of the score bar is the perspective switch, so the whole side —
// avatar and name — is one button filling its track. Selected and hover are
// separate variants over one shared base, so either treatment can be retuned
// without touching the markup. The 2px frame is always present and only its
// colour changes, so selecting a lens never nudges the layout. Text colour is
// the only highlight: selected reads primary, hover previews it.
const teamSwitchVariants = cva(
  'flex min-w-0 flex-1 items-center gap-3 rounded border-5 border-transparent px-7 py-11 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring sm:gap-4',
  {
    variants: {
      mirror: {
        true: 'justify-end',
        false: '',
      },
      selected: {
        true: 'text-primary',
        false: 'text-foreground/60 hover:text-primary',
      },
    },
    // The active lens is marked on the edge it sits against: the left side
    // marks its left edge, the right side its right, so the two indicators
    // mirror each other across the bar.
    compoundVariants: [
      { mirror: false, selected: true, class: 'border-l-primary' },
      { mirror: true, selected: true, class: 'border-r-primary' },
    ],
    defaultVariants: { mirror: false, selected: false },
  },
)

type MatchScoreHeaderProps = {
  match: MatchResource
  // Perspective lens: the team whose page is open. Selecting either team name
  // hands that team's id to onTeamChange. The header navigates nothing itself,
  // so the owner keeps control of replace-versus-push.
  activeTeamId: string
  onTeamChange: (teamId: string) => void
  // Real final score from the analysis payload, keyed by side color. Nullish
  // keeps the fallback treatment so a pending/processing/failed analysis never
  // blanks or zeroes the scoreline.
  finalScore?: FinalScore | null
  // View controls, rendered in the strip under the score bar. Passed in rather
  // than built here so the header stays presentational and the owning view
  // decides what its tabs mean.
  tabs?: ReactNode
  className?: string
}

// Score banner for one match: both teams, the round score, and the map art.
// The two sides are equal flex tracks, so a long team name truncates inside
// its own half instead of pushing the score off centre.
export function MatchScoreHeader({
  match,
  activeTeamId,
  onTeamChange,
  finalScore,
  tabs,
  className,
}: MatchScoreHeaderProps) {
  const background = mapBackground(match.map?.name ?? null)
  const ordered = orderParticipantsBySide(match.participants)
  const [left, right] = ordered
  // Real score when the owner supplies one, fallback otherwise. Each number
  // is resolved by that side's color (blue-first order), never by the active
  // lens, so switching teams keeps each score attached to its team.
  const scores = finalScore ?? MOCK_SCORES
  const leftScore = scoreForSideColor(left?.color, scores, scores.blue)
  const rightScore = scoreForSideColor(right?.color, scores, scores.red)

  return (
    <header
      aria-label="Match score"
      className={cn(
        'relative overflow-hidden rounded-lg border pb-8',
        className,
      )}
    >
      {/* Gradient base doubles as the fallback when the map has no bundled
          art; the image layer only renders when an asset exists. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(47,112,204,0.25)_0%,rgba(13,23,34,0.4)_100%)]"
      />
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
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-[#0D1722]/[0.56] to-[#0D1722]"
      />
      {/* Angled accent on the trailing half, echoing the angled card
          treatments elsewhere in the app. */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-primary/10 to-transparent [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]"
      />

      <div className="relative z-10 flex flex-col">
        {/* items-stretch so each side's button fills the full row height, not
            just the height of its avatar and name. */}
        <div className="flex items-stretch gap-4 sm:gap-6">
          <ScoreSide
            participant={left}
            activeTeamId={activeTeamId}
            onTeamChange={onTeamChange}
          />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="font-heading text-3xl tabular-nums sm:text-4xl">
              {leftScore}
            </span>
            <Badge className="font-button">vs</Badge>
            <span className="font-heading text-3xl tabular-nums sm:text-4xl">
              {rightScore}
            </span>
          </div>
          <ScoreSide
            participant={right}
            activeTeamId={activeTeamId}
            onTeamChange={onTeamChange}
            mirror
          />
        </div>
      </div>

      {/* Tabs pinned to the header's bottom edge, over the map art rather than
          in a band of their own. z-10 puts them above the background layers,
          and they land inside the score row's bottom padding, so nothing is
          covered. */}
      {tabs && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex px-4 pb-1 sm:px-6">
          {tabs}
        </div>
      )}
    </header>
  )
}

// Side-keyed score lookup: the number follows the participant's side color,
// not its bar position or the active lens. Unknown colors fall back to the
// positional value (blue-first order), so the scoreline never blanks.
function scoreForSideColor(
  color: string | undefined,
  scores: FinalScore,
  positionalFallback: number,
): number {
  const normalized = color?.trim().toLowerCase()
  if (normalized === 'blue' || normalized === 'red') {
    return scores[normalized]
  }
  return positionalFallback
}

function ScoreSide({
  participant,
  activeTeamId,
  onTeamChange,
  mirror,
}: {
  participant: MatchParticipant | undefined
  activeTeamId: string
  onTeamChange: (teamId: string) => void
  mirror?: boolean
}) {
  const name = participant?.team_name ?? '—'
  // A missing participant (only reachable if the match loses one between the
  // route's validity check and this render) has nothing to switch to, so the
  // side stays non-interactive rather than a dead control.
  const teamId = participant ? participantTeamId(participant) : null
  const selected = teamId !== null && teamId === activeTeamId

  // `mirror` flips the avatar to the trailing edge so one component serves
  // both ends of the bar. Match participants expose no logo yet, so only the
  // initials fallback renders until the resource carries one.
  const content = (
    <>
      {!mirror && (
        <TeamAvatar
          name={name}
          className="sm:size-16"
          fallbackClassName="font-heading text-base"
        />
      )}
      <span className="truncate font-heading text-xl uppercase sm:text-2xl">
        {name}
      </span>
      {mirror && (
        <TeamAvatar
          name={name}
          className="sm:size-16"
          fallbackClassName="font-heading text-base"
        />
      )}
    </>
  )

  if (teamId === null) {
    return (
      // Same box as the button so the bar never reflows, minus the hover and
      // focus affordances a dead target should not advertise.
      <div className={cn(teamSwitchVariants({ mirror }), 'cursor-default')}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onTeamChange(teamId)}
      aria-current={selected ? 'true' : undefined}
      className={teamSwitchVariants({ mirror, selected })}
    >
      {content}
    </button>
  )
}
