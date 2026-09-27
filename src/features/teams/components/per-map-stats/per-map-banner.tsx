import { cn } from 'cn'

import { mapBackground } from '@/features/matches/utils'

type PerMapStatsBannerProps = {
  mapName: string | null
  winPct: number
  className?: string
}

export function PerMapStatsBanner({
  mapName,
  winPct,
  className,
}: PerMapStatsBannerProps) {
  const background = mapBackground(mapName)
  // API names are display-ready ("Firing Range"); the replace only guards
  // against snake_case values, with uppercase handled by CSS.
  const displayName = (mapName ?? 'Unknown map').replace(/_/g, ' ')

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg border', className)}
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

      <div className="relative z-10 flex min-h-48 flex-col justify-end gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <h3 className="font-heading text-3xl uppercase sm:text-4xl">
          {displayName}
        </h3>
        {/* <div className="sm:text-center">
          <p className="font-heading text-4xl sm:text-5xl">{winPct}%</p>
          <p className="text-sm text-primary">Map Win %</p>
        </div> */}
      </div>
    </div>
  )
}
