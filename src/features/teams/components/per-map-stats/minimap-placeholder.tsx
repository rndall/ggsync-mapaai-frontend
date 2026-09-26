import { SegmentedControl } from './segmented-control'
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
    <div className="flex h-full flex-col gap-3">
      {showHeatToggle && (
        <SegmentedControl
          label="Heat calculation"
          value={heat}
          onChange={onHeatChange}
          options={[
            { value: 'type1', label: 'Type1' },
            { value: 'type2', label: 'Type2' },
          ]}
        />
      )}
      {/* Blank on purpose: heatmap rendering (with site markers) lands
          later. The square box holds the column height so it causes no
          reflow when the heatmap arrives. */}
      <div
        role="img"
        aria-label="Minimap heatmap placeholder"
        className="aspect-square w-full flex-1 rounded-lg border bg-card"
      />
    </div>
  )
}
