'use client';

import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { api } from '@/lib/api';
import { TimezoneSelect } from '@/components/ui/timezone-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DateTime } from 'luxon';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import QueryTable from '@/components/table/QueryTable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

interface UptimeResponse {
    chart_config: any;
}

export default function SiteUptimePage() {
    const [chartConfig, setChartConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [timezone, setTimezone] = useState('US/Eastern');  // Add timezone state
    const [relative, setRelative] = useState('Last 2 days');  // Updated default text
    const [dateError, setDateError] = useState<string | null>(null);
    
    useEffect(() => {
        // Set default dates to last 2 days (midnight to midnight)
        const now = DateTime.now().setZone(timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        const twoDaysAgo = now.minus({ days: 2 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        
        setStartDate(twoDaysAgo.toISO()?.slice(0, 16) ?? '');
        setEndDate(now.toISO()?.slice(0, 16) ?? '');
        
        // Initial data fetch
        fetchAnalytics();
    }, [timezone]); // Add timezone dependency

    const validateDate = (date: string, isEndDate: boolean = false): boolean => {
        const selectedDate = DateTime.fromISO(date, { zone: timezone });
        const now = DateTime.now().setZone(timezone);
        
        if (selectedDate > now) {
            setDateError('Cannot select future dates');
            return false;
        }
        setDateError(null);
        return true;
    };

    const fetchAnalytics = (customStartDate?: string, customEndDate?: string) => {
        setLoading(true);
        
        // Use provided dates or fall back to state, or calculate defaults
        let start = customStartDate || startDate;
        let end = customEndDate || endDate;
        
        // If still empty, calculate defaults
        if (!start || !end) {
            const now = DateTime.now().setZone(timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            const twoDaysAgo = now.minus({ days: 2 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            start = twoDaysAgo.toISO()?.slice(0, 16) ?? '';
            end = now.toISO()?.slice(0, 16) ?? '';
        }
        
        api.get<UptimeResponse>(`/reporting/v2/rng/analytics/uptime/?start_datetime=${start}&end_datetime=${end}&timezone=${timezone}`)
        .then(data => {
            setChartConfig(data.chart_config);
            toast.success('Data loaded successfully', { position: 'bottom-right' });
        })
        .catch(error => {
            console.error('Error fetching uptime data:', error);
            toast.error('Error fetching uptime data');
        })
        .finally(() => setLoading(false));
    };

    if (loading) {
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
              <Loader2 className="animate-spin" size={24} />
              <div className="text-lg font-medium">Loading data...</div>
            </div>
          </div>
        );
    }

    return (
      <div className='container mx-auto space-y-4 px-6'>
        <div className='text-3xl font-bold mb-4'>Site Uptime</div>

        <div className="grid gap-6">
          {/* Date selection controls in a card with better spacing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col gap-4">
              {/* Timezone and Date Range in one line */}
              <div className="flex items-center gap-4">
                <div className="relative" style={{ width: '10%' }}>
                  <TimezoneSelect
                    value={timezone}
                    onValueChange={(value) => setTimezone(value)}
                    className="w-full h-[42px] px-3 py-2 rounded-md border border-input"
                  />
                  <span className="absolute text-xs font-medium text-gray-700 bg-white px-1 -top-2 left-2">
                    Timezone
                  </span>
                </div>
                <div className="flex items-center gap-4" style={{ width: '90%' }}>
                  <FloatingLabelInput
                    label="Start Time"
                    type="datetime-local"
                    className="flex-1"
                    max={endDate}
                    value={startDate}
                    onChange={(e) => {
                      if (validateDate(e.target.value)) {
                        setStartDate(e.target.value);
                      }
                    }}
                  />
                  <FloatingLabelInput
                    label="End Time"
                    type="datetime-local"
                    className="flex-1"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => {
                      if (validateDate(e.target.value, true)) {
                        setEndDate(e.target.value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Quick Select and Search Button Row */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-20">Quick Select:</span>
                <div className="flex items-center gap-4">
                  <select 
                    className="w-[200px] px-4 py-2.5 border rounded-md text-sm"
                    onChange={(e) => {
                      const [unit, amount] = e.target.value.split('-');
                      setRelative(`Last ${amount} ${unit}`);
                      const now = DateTime.now().setZone(timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                      let start;
                      let end = now;

                      switch(unit) {
                        case 'day':
                          start = now.minus({ days: parseInt(amount) }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                          break;
                        case 'week':
                          start = now.minus({ weeks: parseInt(amount) }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                          break;
                        case 'month':
                          start = now.minus({ months: parseInt(amount) }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                          break;
                      }

                      const startDateStr = start?.toISO()?.slice(0, 16) ?? '';
                      const endDateStr = end?.toISO()?.slice(0, 16) ?? '';
                      setStartDate(startDateStr);
                      setEndDate(endDateStr);
                      fetchAnalytics(startDateStr, endDateStr);
                    }}
                  >
                    <option value="">{relative}</option>
                    <optgroup label="Days">
                      {[1,2,3,4,5,6].map(n => (
                        <option key={`day-${n}`} value={`day-${n}`}>Last {n} day{n > 1 ? 's' : ''}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Weeks">
                      {[1,2,3,4].map(n => (
                        <option key={`week-${n}`} value={`week-${n}`}>Last {n} week{n > 1 ? 's' : ''}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Months">
                      {[1,2,3,4].map(n => (
                        <option key={`month-${n}`} value={`month-${n}`}>Last {n} month{n > 1 ? 's' : ''}</option>
                      ))}
                    </optgroup>
                  </select>
                  <button
                    onClick={() => fetchAnalytics()}
                    className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors min-w-[120px]"
                  >
                    Search
                  </button>
                </div>

                {dateError && (
                  <div className="text-destructive text-sm">{dateError}</div>
                )}
              </div>
            </div>
          </div>

          {/* Chart in a card with better size and responsiveness */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-[60vh]">
              {loading ? (
                <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
                  <Loader2 className="animate-spin" size={24} />
                  <div className="text-lg font-medium">Loading Site Uptime data...</div>
                </div>
              ) : (
                <Line 
                  options={{
                    ...options,
                    maintainAspectRatio: false,
                    responsive: true
                  }} 
                  data={chartConfig} 
                />
              )}
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
    );
}

