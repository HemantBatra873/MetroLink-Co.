"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "./button.js"
import { Calendar } from "./calendar.js"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js"

type DatePickerProps = {
  date?: Date
  defaultDate?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  formatStr?: string
} & Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect">

function DatePicker({
  date: dateProp,
  defaultDate,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  buttonClassName,
  align = "start",
  formatStr = "PPP",
  ...calendarProps
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolledDate, setUncontrolledDate] = React.useState<Date | undefined>(
    defaultDate
  )

  const isControlled = dateProp !== undefined
  const selected = isControlled ? dateProp : uncontrolledDate

  function handleSelect(next: Date | undefined) {
    if (!isControlled) {
      setUncontrolledDate(next)
    }
    onDateChange?.(next)
    if (next) {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            data-slot="date-picker-trigger"
            disabled={disabled}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              buttonClassName
            )}
          >
            <CalendarIcon data-icon="inline-start" />
            {selected ? format(selected, formatStr) : <span>{placeholder}</span>}
          </Button>
        }
      />
      <PopoverContent className={cn("w-auto p-0", className)} align={align}>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
