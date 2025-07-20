'use client'

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// List of common timezones
const TIMEZONES = [
  { label: 'EST/EDT', value: 'US/Eastern' },
  { label: 'CST/CDT', value: 'US/Central' },
  { label: 'MST/MDT', value: 'US/Mountain' },
  { label: 'PST/PDT', value: 'US/Pacific' },
  { label: 'AKST/AKDT', value: 'US/Alaska' },
  { label: 'HST/HDT', value: 'US/Hawaii' },
  { label: 'IST', value: 'Asia/Kolkata' },
]

interface TimezoneSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function TimezoneSelect({ value = 'US/Eastern', onValueChange, className }: TimezoneSelectProps) {
  // Find the label for the current value
  const currentTimezone = TIMEZONES.find(tz => tz.value === value);
  
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {currentTimezone?.label || TIMEZONES[0].label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Timezones</SelectLabel>
          {TIMEZONES.map((timezone) => (
            <SelectItem key={timezone.value} value={timezone.value}>
              {timezone.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
} 