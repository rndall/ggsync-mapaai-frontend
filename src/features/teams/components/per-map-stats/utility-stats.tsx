import { cn } from 'cn'
import type { LucideIcon } from 'lucide-react'
import { Bomb, CloudFog, Zap } from 'lucide-react'

import type { PerMapSideStats, UtilityMixRow } from './per-map-stats-mock'

type UtilityStatsProps = {
  stats: PerMapSideStats
}

// The mock marks Frag (index 1) as the selected row so reviewers can see
// what the active highlight looks like before heatmaps land.
const ACTIVE_UTILITY_INDEX = 1

export function UtilityStats({ stats }: UtilityStatsProps) {
  return (
    <section
      aria-label="Utility stats"
      className="flex min-w-0 flex-col gap-2 rounded-lg border bg-muted/20 p-4 sm:p-6"
    >
      <h3 className="font-heading text-lg">Utility</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th scope="col" className="p-2 font-medium">
              Event
            </th>
            <th scope="col" className="w-20 px-3 py-2 text-right font-medium">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.utility.map((row, index) => (
            <UtilityRow
              key={`${row.name}-${row.count}-${row.pct}`}
              row={row}
              active={index === ACTIVE_UTILITY_INDEX}
            />
          ))}
        </tbody>
      </table>
    </section>
  )
}

function UtilityRow({ row, active }: { row: UtilityMixRow; active: boolean }) {
  const Icon = utilityIcon(row.name)
  return (
    <tr
      aria-current={active ? 'true' : undefined}
      data-active={active ? 'true' : undefined}
      className={cn('border-t', active && 'bg-muted/60')}
    >
      <th
        scope="row"
        className="flex min-w-0 items-center gap-2 px-3 py-2.5 text-left font-medium"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{row.name}</span>
      </th>
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
