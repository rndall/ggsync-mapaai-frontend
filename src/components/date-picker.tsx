'use client'

import type { VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { inputVariants } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  onBlur?: () => void
  placeholder?: string
  id?: string
  disabled?: boolean
  'aria-invalid'?: boolean | 'true' | 'false'
  className?: string
} & VariantProps<typeof inputVariants>

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Pick a date',
  size = 'xl',
  id,
  disabled,
  'aria-invalid': ariaInvalid,
  className,
  onBlur,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultValue,
  )
  const [open, setOpen] = React.useState(false)
  const date = value ?? internalDate

  const handleSelect = (next: Date | undefined) => {
    if (value === undefined) {
      setInternalDate(next)
    }
    onChange?.(next)
    onBlur?.()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="font-sans"
        render={
          <Button
            variant="outline"
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            data-empty={!date}
            className={cn(
              inputVariants({ size }),
              'justify-start gap-2 text-left font-normal hover:bg-input/20 hover:text-foreground data-[empty=true]:text-muted-foreground dark:hover:bg-input/30 [&_svg]:size-4',
              className,
            )}
          />
        }
      >
        <CalendarIcon />
        {date ? format(date, 'PPP') : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          className="[--cell-size:--spacing(9.5)]"
          mode="single"
          selected={date}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
