import type {
  PerMapSideStats,
  RotationSplit,
  SiteSetup,
} from './per-map-stats-mock'

type PlayerStatsProps = {
  stats: PerMapSideStats
  // Derived setup rows for the match view. Undefined keeps the typed mock
  // slice (team pages and pending/failed analysis); a defined array — even
  // empty — renders the live read so lens-plus-side re-aggregates and failed
  // rounds stay excluded.
  setups?: Array<SiteSetup>
}

export function PlayerStats({ stats, setups }: PlayerStatsProps) {
  const rows = setups ?? stats.setups
  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Rotation Odds"
        className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:p-6"
      >
        <h3 className="font-heading text-lg">Rotation Odds</h3>
        <RotationRow
          label="Behavior After a Win"
          split={stats.rotationAfterWin}
        />
        <RotationRow
          label="Behavior After a Loss"
          split={stats.rotationAfterLoss}
        />
      </section>
      <section
        aria-label="Top site setups"
        className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-4 sm:p-6"
      >
        <h3 className="font-heading text-lg">Top Setups</h3>
        {rows.length === 0 ? (
          <div className="flex h-60 items-center justify-center overflow-y-auto">
            <p className="p-6 text-center text-sm text-muted-foreground">
              No setups observed for this team on this side.
            </p>
          </div>
        ) : (
          <ol className="flex h-60 flex-col overflow-y-auto">
            {rows.map((setup) => (
              <SetupRow key={setupKey(setup)} setup={setup} />
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function RotationRow({
  label,
  split,
}: {
  label: string
  split: RotationSplit
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-sm text-emerald-500">
          {split.stay}% same site
        </span>
        <span className="text-sm text-destructive">{split.switch}% switch</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: stay ${split.stay}%, switch ${split.switch}%`}
        className="flex h-1.5 overflow-hidden rounded-full"
      >
        <div className="bg-emerald-500" style={{ width: `${split.stay}%` }} />
        <div className="bg-destructive" style={{ width: `${split.switch}%` }} />
      </div>
    </div>
  )
}

function SetupRow({ setup }: { setup: SiteSetup }) {
  return (
    <li className="flex items-center gap-2 border-t py-2.5 first:border-t-0 first:pt-0 last:pb-0">
      <span className="flex flex-wrap gap-1.5">
        {setup.a > 0 && <SetupBadge label={`${setup.a}A`} />}
        {setup.b > 0 && <SetupBadge label={`${setup.b}B`} />}
        {setup.mid > 0 && <SetupBadge label={`${setup.mid} Mid`} />}
      </span>
      <span className="ml-auto text-base font-semibold tabular-nums">
        {setup.pct}%
      </span>
    </li>
  )
}

function SetupBadge({ label }: { label: string }) {
  return (
    <span className="rounded border border-destructive/60 px-1.5 py-1 text-sm font-semibold text-destructive">
      {label}
    </span>
  )
}

function setupKey(setup: SiteSetup): string {
  // Pattern identity only: rows are pre-aggregated unique patterns, so the
  // key stays stable when a re-aggregation changes only the share.
  return `${setup.a}-${setup.b}-${setup.mid}`
}
