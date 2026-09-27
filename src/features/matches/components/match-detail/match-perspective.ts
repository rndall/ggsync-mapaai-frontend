import type { TeamSideColor } from '@/features/matches/analysis-types'
import type { MatchResource } from '@/features/matches/utils'
import { compareParticipantsBySide } from '@/features/matches/utils'

export type MatchParticipant = MatchResource['participants'][number]

// Blue-first side order shared with match cards and history rows. Always
// returns a copy so the API array is never sorted in place.
export function orderParticipantsBySide(
  participants: Array<MatchParticipant>,
): Array<MatchParticipant> {
  return [...participants].sort(compareParticipantsBySide)
}

// Route identifiers arrive as strings; participant ids may be numeric, so
// every comparison coerces to string first.
export function participantTeamId(participant: MatchParticipant): string {
  return String(participant.team_id)
}

// Validity always means membership in the fetched match participant set,
// never mere numeric well-formedness.
export function isMatchParticipant(
  participants: Array<MatchParticipant>,
  teamId: string | undefined,
): boolean {
  if (!teamId) return false
  return participants.some(
    (participant) => participantTeamId(participant) === teamId,
  )
}

// Side color of one participant, or null when the record carries an
// unrecognized color. Heat filtering needs the lens color, and a null lens
// renders the heat empty state rather than another team's read.
export function participantSideColor(
  participant: MatchParticipant,
): TeamSideColor | null {
  const normalized = participant.color?.trim().toLowerCase()
  if (normalized === 'blue' || normalized === 'red') return normalized
  return null
}

// Canonical auto-pick for an address that does not name a valid team: the
// first participant in blue-first side order. Null when the match has no
// participants to pick from.
//
// There is deliberately no "incoming team" preference here. Both entry points
// link straight to the canonical team-scoped address, so a team context
// arrives in the URL rather than in location state — which also survives
// refresh and sharing. The bare address is only reached by typing, and it has
// no context to prefer.
export function pickPerspectiveTeamId(
  participants: Array<MatchParticipant>,
): string | null {
  const first = orderParticipantsBySide(participants)[0]
  return first ? participantTeamId(first) : null
}
