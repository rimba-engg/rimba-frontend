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
  // Jan – Mar
  {
    id: '1',
    title: 'LCFS Q4 final; AFPR deadline; RFS Q4 reports',
    date: new Date(new Date().getFullYear(), 2, 31), // Mar 31
    type: 'deadline',
    description: 'LCFS Q4 final, AFPR deadline, and RFS Q4 reports due.'
  },
  // Apr – Jun
  {
    id: '2',
    title: 'LCFS Annual Compliance & MCON',
    date: new Date(new Date().getFullYear(), 3, 30), // Apr 30
    type: 'deadline',
    description: 'LCFS Annual Compliance and MCON due.'
  },
  {
    id: '3',
    title: 'LCFS Q1 upload',
    date: new Date(new Date().getFullYear(), 4, 15), // May 15
    type: 'deadline',
    description: 'LCFS Q1 upload deadline.'
  },
  {
    id: '4',
    title: 'RFS Q1 due; CCM list',
    date: new Date(new Date().getFullYear(), 5, 1), // Jun 1
    type: 'deadline',
    description: 'RFS Q1 due and CCM list deadline.'
  },
  {
    id: '5',
    title: 'RFS Attest & Outlook',
    date: new Date(new Date().getFullYear(), 5, 1), // Jun 1
    type: 'deadline',
    description: 'RFS Attest and Outlook deadline.'
  },
  // Jul – Sep
  {
    id: '6',
    title: 'CCM closes',
    date: new Date(new Date().getFullYear(), 6, 31), // Jul 31
    type: 'event',
    description: 'CCM closes.'
  },
  {
    id: '7',
    title: 'LCFS Q2 upload',
    date: new Date(new Date().getFullYear(), 7, 14), // Aug 14
    type: 'deadline',
    description: 'LCFS Q2 upload deadline.'
  },
  {
    id: '8',
    title: 'LCFS verification statements',
    date: new Date(new Date().getFullYear(), 7, 31), // Aug 31
    type: 'event',
    description: 'LCFS verification statements due.'
  },
  // Oct – Dec
  {
    id: '9',
    title: 'LCFS Q2 final',
    date: new Date(new Date().getFullYear(), 8, 30), // Sep 30
    type: 'deadline',
    description: 'LCFS Q2 final deadline.'
  },
  {
    id: '10',
    title: 'RFS Q3 due',
    date: new Date(new Date().getFullYear(), 11, 1), // Dec 1
    type: 'deadline',
    description: 'RFS Q3 due.'
  },
  {
    id: '11',
    title: 'LCFS Q3 final',
    date: new Date(new Date().getFullYear(), 11, 31), // Dec 31
    type: 'deadline',
    description: 'LCFS Q3 final deadline.'
  },
];

export default function CalendarPage() {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

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

  // Function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return importantDates.filter(event => isSameDay(new Date(event.date), new Date(date)));
  };

  // Helper to get events for the selected date
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="container mx-auto py-8">
      {/* Centered Popover/Modal for important dates */}
      {popoverOpen && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setPopoverOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setPopoverOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="space-y-4">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                  <div key={event.id}>
                    <div className="font-semibold">{format(event.date, 'MMMM d, yyyy')}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No events for this date.</div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Calendar Section */}
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
                        const hasEvent = events.length > 0;
                        const eventColor = hasEvent ? getEventColor(events[0].type) : '';
                        if (hasEvent) {
                          return (
                            <span
                              className={cn(
                                `cursor-pointer border-4 ${eventColor} rounded-full px-2 py-0.5 text-base font-bold transition-colors duration-150`)
                              }
                              onClick={() => {
                                setSelectedDate(date);
                                setPopoverOpen(true);
                              }}
                            >
                              {format(date, 'd')}
                            </span>
                          );
                        }
                        return (
                          <span className="text-base">{format(date, 'd')}</span>
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

          {/* Next Event Countdown */}
          <Card className="mt-4 w-fit">
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
        </div>

        {/* Important Dates Section */}
        <div className="space-y-6">
          {/* Important Dates List */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh]">
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