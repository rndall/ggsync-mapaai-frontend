import type {
  PerMapSideStats,
  RotationSplit,
  SiteSetup,
} from './per-map-stats-mock'

type PlayerStatsProps = {
  stats: PerMapSideStats
}

export function PlayerStats({ stats }: PlayerStatsProps) {
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
        <ol className="flex flex-col">
          {stats.setups.map((setup) => (
            <SetupRow key={setupKey(setup)} setup={setup} />
          ))}
        </ol>
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
      <span className="flex gap-1.5">
        {setup.a > 0 && <SetupBadge label={`${setup.a}A`} />}
        {setup.b > 0 && <SetupBadge label={`${setup.b}B`} />}
      </span>
      <span className="ml-auto text-base font-semibold">{setup.pct}%</span>
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
  return `${setup.a}-${setup.b}-${setup.pct}`
}
