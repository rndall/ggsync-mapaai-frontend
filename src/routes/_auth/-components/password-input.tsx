import { cn } from 'cn'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

type PasswordInputProps = Omit<ComponentProps<typeof InputGroupInput>, 'type'>

export default function PasswordInput({
  className,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(false)
  const hasValue =
    value !== undefined ? String(value).length > 0 : uncontrolledHasValue

  return (
    <InputGroup className="h-12 rounded-none">
      <InputGroupAddon className="p-4">
        <KeyRound className="size-5" />
      </InputGroupAddon>
      <InputGroupInput
        {...props}
        className={cn(
          'h-12 font-button text-sm! tracking-wide placeholder:text-muted-foreground',
          className,
        )}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => {
          if (e.target.value.length === 0) {
            setVisible(false)
          }
          if (value === undefined) {
            setUncontrolledHasValue(e.target.value.length > 0)
          }
          onChange?.(e)
        }}
      />
      {hasValue && (
        <InputGroupAddon className="pr-4" align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-sm"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
