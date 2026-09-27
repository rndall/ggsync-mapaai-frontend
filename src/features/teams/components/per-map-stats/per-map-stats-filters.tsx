import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import * as React from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { capitalizeWords } from '@/features/matches/utils'
import type { components } from '@/types/api'

type MapFilterOption = components['schemas']['MapResource']

type PerMapStatsFiltersProps = {
  maps: MapFilterOption[]
  mapId: string
  onMapChange: (value: string) => void
}

export function PerMapStatsFilters({
  maps,
  mapId,
  onMapChange,
}: PerMapStatsFiltersProps) {
  const mapItems = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(maps, {
        getValue: (map) => String(map.id),
        getLabel: (map) => capitalizeWords(map.name ?? String(map.id)),
      }),
    [maps],
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="per-map-stats-map" className="text-sm text-muted">
          Map
        </label>
        <Combobox
          autoHighlight
          items={mapItems}
          value={mapId === '' ? null : mapId}
          onValueChange={(next) => {
            if (typeof next === 'string' && next !== '') {
              onMapChange(next)
            }
          }}
          disabled={maps.length === 0}
        >
          <ComboboxInput
            id="per-map-stats-map"
            placeholder="Select map"
            className="w-44"
            disabled={maps.length === 0}
          />
          <ComboboxContent>
            <ComboboxList>
              {(map: MapFilterOption) => (
                <ComboboxItem key={map.id} value={String(map.id)}>
                  {capitalizeWords(map.name ?? String(map.id))}
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>No map found.</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  )
}
