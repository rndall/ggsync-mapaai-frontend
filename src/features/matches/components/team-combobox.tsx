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
import type { components } from '@/types/api'

export type TeamOption = Pick<
  components['schemas']['Team'],
  'id' | 'name'
>

type TeamComboboxProps = {
  value: string
  onValueChange: (value: string) => void
  onOpenChange?: (open: boolean) => void
  onBlur?: () => void
  teams?: TeamOption[]
  excludeId?: string
  placeholder?: string
  id?: string
  disabled?: boolean
  size?: React.ComponentProps<typeof ComboboxInput>['size']
  className?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

export default function TeamCombobox({
  value,
  onValueChange,
  onOpenChange,
  onBlur,
  teams = [],
  excludeId,
  placeholder = 'Select team',
  id,
  disabled = false,
  size = 'default',
  className,
  'aria-invalid': ariaInvalid,
}: TeamComboboxProps) {
  const visibleTeams = React.useMemo(
    () =>
      excludeId
        ? teams.filter((team) => String(team.id) !== excludeId)
        : teams,
    [teams, excludeId],
  )
  const items = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(visibleTeams, {
        getValue: (team) => String(team.id),
        getLabel: (team) => team.name,
      }),
    [visibleTeams],
  )

  return (
    <Combobox
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
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onBlur={onBlur}
        size={size}
        className={className}
      />
      <ComboboxContent>
        <ComboboxList>
          {(team: TeamOption) => (
            <ComboboxItem key={team.id} value={String(team.id)}>
              {team.name}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No team found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}
