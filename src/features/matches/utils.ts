import { format } from 'date-fns'

import type { components } from '@/types/api'

type MatchResource = components['schemas']['MatchResource']

export type { MatchResource }

// Bundled map backgrounds, keyed by normalized map name: the asset file
// stems go through the same normalization the API map names do.
const mapBackgrounds = import.meta.glob('@/assets/images/map-bg/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const mapBackgroundByKey: Record<string, string> = Object.fromEntries(
  Object.entries(mapBackgrounds).map(([path, url]) => {
    const fileName = path.split('/').pop() ?? path
    return [normalizeMapName(fileName.replace(/\.webp$/, '')), url]
  }),
)

// Humanized badge copy per known non-ready status; unknown values fall back
// to their raw string in statusBadgeLabel.
const statusBadgeLabels: Record<string, string> = {
  upload_pending: 'Pending',
  processing: 'Processing…',
  failed: 'Failed',
}

export type MatchCardParticipant = {
  teamId: string
  name: string
  // logo: string | null
}

// Minimal presentational props for a match card; the route maps API
// resources down to this shape so cards never see whole resources.
export type MatchCard = {
  id: number
  name: string
  timestamp: string | null
  mapName: string | null
  status: string
  participants: MatchCardParticipant[]
}

// Lowercase with spaces and dashes collapsed to underscores, so API map
// names ("Firing Range", "firing-range") line up with the asset file names.
function normalizeMapName(mapName: string): string {
  return mapName
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

// Per-map framing for card backgrounds. The header is short and wide, so
// `position` picks which horizontal band of the still lands in the card.
// Several bundled images carry a Call of Duty watermark in a corner: those
// maps render at `cover` (which always fills the header without distorting
// the image) and then zoom via transform, anchored on the opposite edge,
// which keeps the logo outside the header at every card width.
const mapBackgroundFrames: Record<
  string,
  { position: string; scale: number; origin: string }
> = {
  // Watermark bottom-right.
  tunisia: { position: '50% 0%', scale: 1.5, origin: '50% 0%' },
  // Watermark top-right.
  slums: { position: '50% 100%', scale: 1.5, origin: '50% 100%' },
  // Watermark bottom-left.
  meltdown: { position: '50% 0%', scale: 1.5, origin: '50% 0%' },
  // Watermark bottom-left.
  coastal: { position: '50% 0%', scale: 1.5, origin: '50% 0%' },
  // firing_range has no watermark and keeps the default framing.
}

export type MapBackground = {
  url: string
  position: string
  scale: number
  origin: string
}

// The bundled background for a map plus its framing, or null when the map
// is missing or has no bundled asset — cards then render no image at all.
export function mapBackground(mapName: string | null): MapBackground | null {
  if (!mapName) return null
  const key = normalizeMapName(mapName)
  const url = mapBackgroundByKey[key]
  if (!url) return null
  return {
    url,
    position: mapBackgroundFrames[key]?.position ?? '50% 50%',
    scale: mapBackgroundFrames[key]?.scale ?? 1,
    origin: mapBackgroundFrames[key]?.origin ?? '50% 50%',
  }
}

// Played time in short day/date/month/time form (the project's date library
// is date-fns); '' when there is no usable timestamp.
export function formatCardDate(timestamp: string | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return format(date, 'EEE, d MMM HH:mm')
}

// Ready matches are clean; every other status gets a humanized label, with
// the raw status string as the fallback for values we do not know yet.
export function statusBadgeLabel(status: string): string | null {
  if (status === 'ready') return null
  return statusBadgeLabels[status] ?? status
}

// Uppercase the first letter of every whitespace-separated word.
export function capitalizeWords(value: string): string {
  return value.replace(/\S+/g, (word) => {
    const [first, ...rest] = Array.from(word)
    return first ? first.toUpperCase() + rest.join('') : word
  })
}

// Row styling for team match history. The API exposes no win/loss outcome
// yet, so ready matches temporarily reuse the victory treatment and every
// other status renders its own label instead of win text.
export type MatchHistoryVariant = 'analyzing' | 'victory' | 'defeat'

export function toHistoryVariant(
  status: MatchResource['status'],
): MatchHistoryVariant {
  if (status === 'failed') return 'defeat'
  if (status === 'ready') return 'victory'
  return 'analyzing'
}

// Status copy for history rows: in-progress work collapses to "Analyzing".
export function historyStatusLabel(status: MatchResource['status']): string {
  switch (status) {
    case 'upload_pending':
    case 'processing':
      return 'Analyzing'
    case 'failed':
      return 'Failed'
    case 'ready':
      return 'Ready'
    default:
      return status
  }
}

// "Team A vs Team B" in blue-left/red-right side order, like match cards.
export function historyMatchup(match: MatchResource): string {
  return [...match.participants]
    .sort((a, b) => sideRank(a.color) - sideRank(b.color))
    .map((participant) => participant.team_name)
    .join(' vs ')
}

// Played date in MM-DD-YYYY form. Date-only values parse as a local date so
// the day never shifts across timezones; full timestamps keep their time.
export function formatHistoryDate(
  playedAt: string | null,
  createdAt: string | null,
): string {
  const raw = playedAt ?? createdAt
  if (!raw) return ''
  const date =
    raw.length <= 10
      ? new Date(
          Number(raw.slice(0, 4)),
          Number(raw.slice(5, 7)) - 1,
          Number(raw.slice(8, 10)),
        )
      : new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return format(date, 'MM-dd-yyyy')
}

// Side order: blue left (0), red right (2), anything unrecognized or missing
// in between (1). Array#sort is stable, so equal ranks keep their input
// order — that is the array-order fallback.
function sideRank(color: string | undefined): number {
  const normalized = color?.trim().toLowerCase()
  if (normalized === 'blue') return 0
  if (normalized === 'red') return 2
  return 1
}

export function toMatchCard(match: MatchResource): MatchCard {
  return {
    id: match.id,
    name: match.name,
    // Games are shown by when they were played; creation time only stands
    // in when the record has no played timestamp.
    timestamp: match.played_at || match.created_at,
    mapName: match.map?.name ?? null,
    status: match.status,
    // Sort a copy: the API array is shared state, and the blue side must
    // land on the left with the red side on the right.
    participants: [...match.participants]
      .sort((a, b) => sideRank(a.color) - sideRank(b.color))
      .map((participant) => ({
        // Route params are strings, so the numeric participant id is coerced.
        teamId: String(participant.team_id),
        name: participant.team_name,
        // logo: participant.logo_url,
      })),
  }
}
