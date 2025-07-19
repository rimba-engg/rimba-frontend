'use client';

import { TimezoneSelect } from '@/components/ui/timezone-select';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

export interface DateTimeRange {
  startDateTime: string;
  endDateTime: string;
  timezone: string;
}

interface DateTimeSelectorProps {
  onChange: (range: DateTimeRange) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  initialTimezone?: string;
}

export function DateTimeSelector({
  onChange,
  initialStartDate,
  initialEndDate,
  initialTimezone = 'US/Eastern',
}: DateTimeSelectorProps) {
  const [startDateTime, setStartDateTime] = useState(initialStartDate || '');
  const [endDateTime, setEndDateTime] = useState(initialEndDate || '');
  const [timezone, setTimezone] = useState(initialTimezone);

  useEffect(() => {
    onChange({
      startDateTime,
      endDateTime,
      timezone: timezone || 'US/Eastern',
    });
  }, [startDateTime, endDateTime, timezone]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <TimezoneSelect
          value={timezone || 'US/Eastern'}
          onValueChange={(value) => setTimezone(value)}
          className="w-full h-[42px] px-3 py-2 rounded-md border border-input"
        />
        <span className="absolute text-xs font-medium text-gray-700 bg-white px-1 -top-2 left-2">
          Timezone
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <FloatingLabelInput
          label="Start Time"
          type="datetime-local"
          value={startDateTime}
          onChange={(e) => setStartDateTime(e.target.value)}
          max={endDateTime || undefined}
          className="w-full"
        />
        <FloatingLabelInput
          label="End Time"
          type="datetime-local"
          value={endDateTime}
          onChange={(e) => setEndDateTime(e.target.value)}
          min={startDateTime || undefined}
          className="w-full"
        />
      </div>
    </div>
  );
} 