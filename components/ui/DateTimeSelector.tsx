'use client';

import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { FloatingLabelInput } from './floating-label-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface DateTimeRange {
  startDateTime: string;
  endDateTime: string;
  timezone: string;
}

interface DateTimeSelectorProps {
  onChange: (range: DateTimeRange) => void;
  initialTimezone?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  className?: string;
}

const TIMEZONE_OPTIONS = [
  { 
    value: 'US/Eastern', 
    label: 'Eastern Time (EST/EDT)',
    shortLabel: 'EST' 
  },
  { 
    value: 'US/Central', 
    label: 'Central Time (CST/CDT)',
    shortLabel: 'CDT' 
  },
  { 
    value: 'Asia/Kolkata', 
    label: 'India Standard Time (IST)',
    shortLabel: 'IST' 
  },
];

export function DateTimeSelector({
  onChange,
  initialTimezone = 'US/Eastern',
  initialStartDate = '',
  initialEndDate = '',
  className = '',
}: DateTimeSelectorProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone);
  const [dateError, setDateError] = useState<string | null>(null);

  // Helper function to get timezone short label
  const getTimezoneShortLabel = (tzValue: string) => {
    return TIMEZONE_OPTIONS.find(tz => tz.value === tzValue)?.shortLabel || tzValue.split('/')[1];
  };

  // Set default dates (last 3 days to today) when component mounts
  useEffect(() => {
    if (!startDate && !endDate) {
      const now = DateTime.now().setZone(selectedTimezone).set({ hour: 10, minute: 0, second: 0, millisecond: 0 });
      const threeDaysAgo = now.minus({ days: 3 }).set({ hour: 10, minute: 0, second: 0, millisecond: 0 });
      
      setStartDate(threeDaysAgo.toISO()?.slice(0, 16) ?? '');
      setEndDate(now.toISO()?.slice(0, 16) ?? '');
    }
  }, [selectedTimezone]);

  // Validate date is not in future
  const validateDate = (date: string): boolean => {
    const selectedDate = DateTime.fromISO(date, { zone: selectedTimezone });
    const now = DateTime.now().setZone(selectedTimezone);
    
    if (selectedDate > now) {
      setDateError('Cannot select future dates');
      return false;
    }
    setDateError(null);
    return true;
  };

  // Handle timezone change
  const handleTimezoneChange = (newTimezone: string) => {
    // Convert existing dates to new timezone
    if (startDate) {
      const convertedStart = DateTime.fromISO(startDate, { zone: selectedTimezone })
        .setZone(newTimezone)
        .toISO()?.slice(0, 16) ?? '';
      setStartDate(convertedStart);
    }
    
    if (endDate) {
      const convertedEnd = DateTime.fromISO(endDate, { zone: selectedTimezone })
        .setZone(newTimezone)
        .toISO()?.slice(0, 16) ?? '';
      setEndDate(convertedEnd);
    }
    
    setSelectedTimezone(newTimezone);
  };

  // Notify parent component of changes
  useEffect(() => {
    if (startDate && endDate) {
      onChange({
        startDateTime: startDate,
        endDateTime: endDate,
        timezone: selectedTimezone
      });
    }
  }, [startDate, endDate, selectedTimezone]);

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <Select
        value={selectedTimezone}
        onValueChange={handleTimezoneChange}
        defaultValue="US/Eastern"
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {TIMEZONE_OPTIONS.find(tz => tz.value === selectedTimezone)?.label || 'Eastern Time (EST/EDT)'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIMEZONE_OPTIONS.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FloatingLabelInput
        label={`Start Date (${getTimezoneShortLabel(selectedTimezone)})`}
        type="datetime-local"
        value={startDate}
        onChange={(e) => {
          if (validateDate(e.target.value)) {
            setStartDate(e.target.value);
          }
        }}
        className="w-full"
        max={endDate}
      />

      <FloatingLabelInput
        label={`End Date (${getTimezoneShortLabel(selectedTimezone)})`}
        type="datetime-local"
        min={startDate}
        value={endDate}
        onChange={(e) => {
          if (validateDate(e.target.value)) {
            setEndDate(e.target.value);
          }
        }}
        className="w-full"
      />

      <div className="flex justify-center">
        <span className="text-sm text-gray-500">OR</span>
      </div>

      {dateError && (
        <div className="text-destructive text-sm">{dateError}</div>
      )}

      <FloatingLabelInput
        label={`Single Day (${getTimezoneShortLabel(selectedTimezone)})`}
        type="date" 
        className="w-full"
        max={DateTime.now().setZone(selectedTimezone).toFormat('yyyy-MM-dd')}
        onChange={(e) => {
          // Set to 10 AM on selected date in selected timezone
          let selectedDate = DateTime.fromISO(e.target.value + 'T00:00:00', { zone: selectedTimezone })
            .set({ hour: 10 });

          // Validate the selected date
          if (!validateDate(selectedDate.toISO() || '')) {
            return;
          }

          // Set to 10 AM next day
          let nextDay = selectedDate.plus({ days: 1 });

          // Set start and end dates
          setStartDate(selectedDate.toISO()?.slice(0, 16) ?? '');
          setEndDate(nextDay.toISO()?.slice(0, 16) ?? '');
        }}
      />
    </div>
  );
} 