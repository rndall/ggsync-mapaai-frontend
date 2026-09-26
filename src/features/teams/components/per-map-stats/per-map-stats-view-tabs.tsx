import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { PerMapStatsView } from './use-per-map-stats-params'
import { usePerMapStatsParams } from './use-per-map-stats-params'

type PerMapStatsViewTabsProps = {
  // Placement only. The tab treatment itself is fixed so the switch looks the
  // same wherever it is hosted; a host that needs the tabs to sit over or
  // against something passes its own layout here.
  className?: string
}

// The Player/Utility switch over the shared Per Map Stats view state. Hosts
// render this rather than re-binding the same URL state to their own tabs.
export function PerMapStatsViewTabs({ className }: PerMapStatsViewTabsProps) {
  const { view, setView } = usePerMapStatsParams()

  return (
    <Tabs
      value={view}
      onValueChange={(value) => void setView(value as PerMapStatsView)}
      className={className}
    >
      <TabsList aria-label="View" variant="line">
        <TabsTrigger value="player">Player</TabsTrigger>
        <TabsTrigger value="utility">Utility</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
