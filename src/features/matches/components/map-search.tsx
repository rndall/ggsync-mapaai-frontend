import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { mapQueries } from '@/features/matches/queries'
import type { components } from '@/types/api'

export type MapOption = components['schemas']['MapResource']

function capitalizeWords(value: string): string {
  return value.replace(/\S+/g, (word) => {
    const [first, ...rest] = Array.from(word)
    return first ? first.toUpperCase() + rest.join('') : word
  })
}

type MapSelectProps = {
  value: string
  onValueChange: (value: string) => void
  onOpenChange?: (open: boolean) => void
  onBlur?: () => void
  maps?: MapOption[]
  placeholder?: string
  id?: string
  name?: string
  size?: React.ComponentProps<typeof ComboboxInput>['size']
  className?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

export default function MapSearch({
  value,
  onValueChange,
  onOpenChange,
  onBlur,
  maps: mapsProp,
  placeholder = 'Select a map',
  id,
  size = 'default',
  className,
  'aria-invalid': ariaInvalid,
}: MapSelectProps) {
  const { data } = useQuery(mapQueries.list())
  const maps = mapsProp ?? data?.data ?? []

  const items = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(maps, {
        getValue: (map) => String(map.id),
        getLabel: (map) => capitalizeWords(map.name ?? String(map.id)),
      }),
    [maps],
  )

  return (
    <Combobox
      autoHighlight
      items={items}
      value={value === '' ? null : value}
      onValueChange={(next) => {
        onValueChange(typeof next === 'string' ? next : '')
      }}
      onOpenChange={(open) => {
        onOpenChange?.(open)
        if (!open) {
          onBlur?.()
        }
      }}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        onBlur={onBlur}
        size={size}
        className={className}
      />
      <ComboboxContent>
        <ComboboxList>
          {(map: MapOption) => (
            <ComboboxItem key={map.id} value={String(map.id)}>
              {capitalizeWords(map.name ?? String(map.id))}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No map found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}
