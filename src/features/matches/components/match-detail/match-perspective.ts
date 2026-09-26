import type { MatchResource } from '@/features/matches/utils'
import {
  capitalizeWords,
  compareParticipantsBySide,
} from '@/features/matches/utils'

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

// Canonical auto-pick: the incoming team context when present and a valid
// participant, otherwise the first participant in blue-first side order.
// Null when the match has no participants to pick from.
export function pickPerspectiveTeamId(
  participants: Array<MatchParticipant>,
  preferredTeamId?: string | null,
): string | null {
  const ordered = orderParticipantsBySide(participants)
  if (
    preferredTeamId &&
    ordered.some(
      (participant) => participantTeamId(participant) === preferredTeamId,
    )
  ) {
    return preferredTeamId
  }
  const first = ordered[0]
  return first ? participantTeamId(first) : null
}

// Navigation origin travels in lightweight location state used solely for
// bare/invalid-address auto-pick and is never rendered.
export function readOriginTeamId(state: unknown): string | undefined {
  if (typeof state !== 'object' || state === null) return undefined
  const candidate = (state as { fromTeamId?: unknown }).fromTeamId
  if (typeof candidate === 'string' && candidate.length > 0) return candidate
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return String(candidate)
  }
  return undefined
}

// Humanized side copy for the perspective panel.
export function sideLabel(color: string | undefined): string {
  const normalized = color?.trim().toLowerCase()
  if (normalized === 'blue') return 'Blue'
  if (normalized === 'red') return 'Red'
  if (!color || color.trim().length === 0) return '—'
  return capitalizeWords(color.trim())
}
