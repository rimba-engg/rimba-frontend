'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, differenceInDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImportantDate {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'event' | 'reminder';
  description: string;
}

// Dummy data for important dates
const importantDates: ImportantDate[] = [
  {
    id: '1',
    title: 'LCFS Q1 Report Due',
    date: new Date(2024, 3, 30), // April 30, 2024
    type: 'deadline',
    description: 'Quarterly report submission deadline for LCFS compliance'
  },
  {
    id: '2',
    title: 'Annual Verification',
    date: new Date(2024, 5, 15), // June 15, 2024
    type: 'event',
    description: 'Annual verification audit for LCFS compliance'
  },
  {
    id: '3',
    title: 'EPA GHG Report Due',
    date: new Date(2024, 2, 31), // March 31, 2024
    type: 'deadline',
    description: 'Annual greenhouse gas report submission deadline'
  },
  {
    id: '4',
    title: 'Compliance Training',
    date: new Date(2024, 4, 20), // May 20, 2024
    type: 'reminder',
    description: 'Annual compliance training session for staff'
  }
];

export default function CalendarPage() {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const nextEvent = importantDates
    .filter(date => date.date > today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const daysUntilNextEvent = nextEvent 
    ? differenceInDays(nextEvent.date, today)
    : 0;

  // Get the 3 months starting from current month + offset
  const threeMonths = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(today);
    date.setMonth(today.getMonth() + monthOffset + i);
    return date;
  });

  // Function to get the appropriate background color based on event type
  const getEventColor = (type: ImportantDate['type']) => {
    switch (type) {
      case 'deadline':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'event':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      default:
        return '';
    }
  };

  // Function to check if a date has an event
  const hasEvent = (date: Date) => {
    return importantDates.some(event => isSameDay(event.date, date));
  };

  // Function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return importantDates.filter(event => isSameDay(event.date, date));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-2">
                {threeMonths.map((monthDate, i) => (
                  <Calendar
                    key={i}
                    mode="single"
                    selected={today}
                    month={monthDate}
                    className="rounded-md"
                    components={{
                      DayContent: ({ date }) => {
                        const events = getEventsForDate(date);
                        return (
                          <div className="relative">
                            <span>{format(date, 'd')}</span>
                            {events.length > 0 && (
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  getEventColor(events[0].type)
                                )} />
                              </div>
                            )}
                          </div>
                        );
                      },
                    }}
                  />
                ))}
                <div className="flex justify-center gap-4 mt-2">
                  <button
                    className="p-2 rounded hover:bg-gray-100 border"
                    onClick={() => setMonthOffset((prev) => Math.max(prev - 3, 0))}
                    disabled={monthOffset === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded hover:bg-gray-100 border"
                    onClick={() => setMonthOffset((prev) => prev + 3)}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Dates Section */}
        <div className="space-y-6">
          {/* Next Event Countdown */}
          <Card>
            <CardHeader>
              <CardTitle>Next Event</CardTitle>
            </CardHeader>
            <CardContent>
              {nextEvent ? (
                <div className="space-y-2">
                  <h3 className="font-medium">{nextEvent.title}</h3>
                  <p className="text-sm text-gray-500">
                    {format(nextEvent.date, 'MMMM d, yyyy')}
                  </p>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {daysUntilNextEvent}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      days remaining
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming events</p>
              )}
            </CardContent>
          </Card>

          {/* Important Dates List */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {importantDates.map((date) => (
                    <div
                      key={date.id}
                      className="flex items-start space-x-4 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{date.title}</h4>
                        <p className="text-sm text-gray-500">
                          {format(date.date, 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {date.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          getEventColor(date.type)
                        )}>
                          {date.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 