import { cn } from 'cn'
import type { LucideIcon } from 'lucide-react'
import { Bomb, CloudFog, Zap } from 'lucide-react'
import { useState } from 'react'

import type { PerMapSideStats, UtilityMixRow } from './per-map-stats-mock'

type UtilityStatsProps = {
  stats: PerMapSideStats
  // Derived utility rows for the match view. Undefined keeps the typed mock
  // slice (team pages and pending/failed analysis); a defined array — even
  // empty — renders the live aggregation so the list re-aggregates per
  // lens-plus-side with failed rounds excluded and bomb markers dropped.
  rows?: Array<UtilityMixRow>
  // Controlled single-select for the match view: exactly one row active,
  // auto-seeded to the first row by the host. Undefined falls back to local
  // state seeded to the first row (team pages).
  selected?: string | null
  onSelect?: (name: string) => void
}

export function UtilityStats({
  stats,
  rows: rowsProp,
  selected: selectedProp,
  onSelect,
}: UtilityStatsProps) {
  const rows = rowsProp ?? stats.utility
  const [localSelected, setLocalSelected] = useState<string | null>(null)
  const controlled = selectedProp !== undefined || onSelect !== undefined
  // Exactly one row active: the controlled name when still present, else the
  // first row. The local fallback mirrors that so a stale pick never leaves
  // the table without an active row.
  const activeName = controlled
    ? selectedProp && rows.some((row) => row.name === selectedProp)
      ? selectedProp
      : (rows[0]?.name ?? null)
    : localSelected && rows.some((row) => row.name === localSelected)
      ? localSelected
      : (rows[0]?.name ?? null)

  function handleSelect(name: string) {
    if (onSelect) {
      onSelect(name)
    } else {
      setLocalSelected(name)
    }
  }

  return (
    <section
      aria-label="Utility stats"
      className="flex min-w-0 flex-col gap-2 rounded-lg border bg-muted/20 p-4 sm:p-6"
    >
      <h3 className="font-heading text-lg">Utility</h3>
      {rows.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          No utility observed for this team on this side.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th scope="col" className="p-2 font-medium">
                Event
              </th>
              <th scope="col" className="w-20 px-3 py-2 text-right font-medium">
                Throws
              </th>
              <th scope="col" className="w-20 px-3 py-2 text-right font-medium">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <UtilityRow
                key={`${row.name}-${row.count}-${row.pct}`}
                row={row}
                active={row.name === activeName}
                onSelect={handleSelect}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function UtilityRow({
  row,
  active,
  onSelect,
}: {
  row: UtilityMixRow
  active: boolean
  onSelect: (name: string) => void
}) {
  const Icon = utilityIcon(row.name)
  return (
    <tr
      aria-current={active ? 'true' : undefined}
      data-active={active ? 'true' : undefined}
      onClick={() => onSelect(row.name)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(row.name)
        }
      }}
      tabIndex={0}
      className={cn(
        'cursor-pointer border-t hover:bg-muted/40',
        active && 'bg-muted/60',
      )}
    >
      <th
        scope="row"
        className="flex min-w-0 items-center gap-2 px-3 py-2.5 text-left font-medium"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{row.name}</span>
      </th>
      <td className="px-3 py-2.5 text-right tabular-nums">{row.count}</td>
      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
        {row.pct}%
      </td>
    </tr>
  )
}

// Placeholder icons until final utility art exists; rows stay
// distinguishable by shape alone.
function utilityIcon(name: string): LucideIcon {
  const normalized = name.trim().toLowerCase()
  if (normalized.includes('smoke')) {
    return CloudFog
  }
  if (normalized.includes('frag')) {
    return Bomb
  }
  if (normalized.includes('concussion')) {
    return Zap
  }
  return Zap
}
