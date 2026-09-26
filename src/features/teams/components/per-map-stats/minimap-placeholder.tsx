import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { PerMapStatsHeat } from './use-per-map-stats-params'

type MinimapPlaceholderProps = {
  heat: PerMapStatsHeat
  onHeatChange: (value: PerMapStatsHeat) => void
  // The Utility view renders the same blank box without the heat switch
  // (its heatmap placeholder lands in the next ticket).
  showHeatToggle?: boolean
}

export function MinimapPlaceholder({
  heat,
  onHeatChange,
  showHeatToggle = true,
}: MinimapPlaceholderProps) {
  return (
    <div className="relative flex h-full flex-col">
      {showHeatToggle && (
        <Tabs
          value={heat}
          onValueChange={(value) => onHeatChange(value as PerMapStatsHeat)}
          className="absolute inset-x-4 top-4 z-10"
        >
          <TabsList aria-label="Heat calculation" className="w-full">
            <TabsTrigger value="type1">Type1</TabsTrigger>
            <TabsTrigger value="type2">Type2</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {/* Blank on purpose: heatmap rendering (with site markers) lands
          later. The square box holds the column height so it causes no
          reflow when the heatmap arrives. */}
      <div
        role="img"
        aria-label="Minimap heatmap placeholder"
        className="aspect-square w-full flex-1 rounded-lg border bg-background/70"
      />
    </div>
  )
}
