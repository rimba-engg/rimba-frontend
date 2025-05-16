'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface YearMonthSelectProps {
  onYearChange?: (year: string) => void;
  onMonthChange?: (monthIndex: number) => void;
  defaultYear?: string;
  defaultMonth?: string;
}

const MONTHS = [
  'January',
  'February', 
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
export const YEARS = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"]

export function YearMonthSelect({
  onYearChange,
  onMonthChange,
  defaultYear = new Date().getFullYear().toString(),
  defaultMonth = MONTHS[new Date().getMonth()]
}: YearMonthSelectProps) {
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // Generate year range from 2020 to 2030
  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    onYearChange?.(year);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const monthIndex = MONTHS.indexOf(month);
    if (monthIndex !== -1) {
      onMonthChange?.(monthIndex);
    }
  };

  useEffect(() => {
    // Set initial values
    if (defaultYear) setSelectedYear(defaultYear);
    if (defaultMonth) setSelectedMonth(defaultMonth);
  }, [defaultYear, defaultMonth]);

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}